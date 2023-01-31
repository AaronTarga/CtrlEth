import os
from flask import Blueprint, request
from utils.disassembly import add_annotations, add_symbolics, create_block_dict, is_conditional_jump, generate_jumps, add_event_lookups, add_storage_lookups
from utils import get_analysis, use_args
from ethpector.data.node import NodeProvider
from ethpector.data import AggregateProvider
from networkx.readwrite import json_graph
from ethpector.data.datatypes import to_json
from datatypes.json_mapping import json_to_assembly, json_to_basic_blocks, json_to_symbolic
import json
from json import JSONDecodeError
from celery_once import QueueOnce
from shared import celery, redis
import dataclasses
from ethpector.data.signatures import SignatureProvider
from celery_once import AlreadyQueued
from ethpector.config import Configuration
from types import SimpleNamespace
from celery_once.helpers import queue_once_key

disassembly_route = Blueprint('disassembly', __name__,)

etherscan_token = os.environ.get('ETHERSCAN_TOKEN')
ethpector_rpc = os.environ.get('ETHPECTOR_RPC')

disassembly_task_name = "get_disassembly"


@celery.task(name=disassembly_task_name, base=QueueOnce, once={'keys': ['address']})
def get_disassembly(address, args, mythril_args=None):
    # add task id to redis cache if multiple users load same contract only one task started
    data = redis.get_routes_from_cache(key=address)
    if (data is None):
        try:
            analysis = get_analysis(address, args, mythril_args)
        except ValueError as valueError:
            # not found if valueError
            return {"task_error": {"message": str(valueError), "status": 404}}

        if (analysis == None):
            return {"task_error": {"message": "No analysis result", "status": 404}}

        if (not type(analysis).__name__ == "CodeAnalysis" and "task_error" in analysis):
            return analysis

        try:
            bbs = analysis.aa.get_basic_blocks()
            symbolic = analysis.sa
            disassembly = analysis.aa
        except ValueError:
            # values missing in get summary therefore throwing value error
            return {"task_error": {"message": "No values in analysis", "status": 500}}

        try:
            disassembly_summary = disassembly.get_summary()
            symbolic_summary = symbolic.get_summary()
        except Exception as exception:
            return {"task_error": {"message": f"Ethpector analysis summaries failed with the following exception: {exception}", "status": 500}}

        links = []
        pc_to_block = {}
        # adding annotations
        for _id, bb in enumerate(bbs):
            for inst in bb.instructions:
                pc_to_block[inst.pc()] = _id

            add_annotations(bb, symbolic_summary, disassembly_summary)

        for jump in disassembly_summary.jump_targets:
            # adding all jumps to links list could add types if needed to block#
            if jump.get_pc() in pc_to_block:
                bb = bbs[pc_to_block[jump.get_pc()]]
                if bb.is_static_jump_block():
                    links += generate_jumps(bb, pc_to_block)
                elif is_conditional_jump(bb.instructions[-1]):
                    links += generate_jumps(bb, pc_to_block, True)

        # typing annotations at the end because it otherwise breaks other analysis done by ethpector (jumps, annotation propagation, etc ...)
        for _id, bb in enumerate(bbs):
            # add types to annotations
            for inst in bb.instructions:
                inst.annotations = [{"_class": type(
                    annotation).__name__, "data": annotation} for annotation in inst.annotations]

        # adding entrypoint to functions
        found_functions = symbolic_summary.functions
        functions = [{"entrypoint": entrypoint_by_function(
            _function, disassembly_summary.function_entrypoints, pc_to_block), "function": dataclasses.asdict(_function)} for _function in found_functions]

        data = to_json({"symbolic_summary": symbolic_summary,
                       "disassembly_summary": disassembly_summary, "bbs": bbs, "links": links, "pc_to_block": pc_to_block, "functions": functions})
        # caching result at the end
        redis.set_routes_to_cache(key=address, value=data)

    return address


def jsonKeys2int(x):
    # cast dict keys to int
    if isinstance(x, dict):

        return {int(k): v for k, v in x.items()}
    return x


def entrypoint_by_function(_function, entrypoints, pc_to_block):
    found = (
        entrypoint for entrypoint in entrypoints if _function.valid_at(entrypoint.pc))
    try:
        pc_entrypoint = next(found)
        block_entrypoint = {
            "block": pc_to_block[pc_entrypoint.pc], "functionName": pc_entrypoint.function_name}
        return block_entrypoint
    except Exception:  # if stopiteration or keyerror it returns none
        return None


@disassembly_route.route("/load/<address>")
def load_analysis(address):
    '''
    some additional analysis liformattingformattingke storage lookups that isnt done in ethpector
    receives ethpector results as input
    '''

    config = Configuration(SimpleNamespace(**use_args(
        etherscan_token=etherscan_token, ethpector_rpc=ethpector_rpc)))

    online_resolver = AggregateProvider(config)
    code = online_resolver.first_of(["node", "etherscan"]).get_code(address)

    # invalid addresses have no code and external account addresses or selfdestructed contracts have 0x as code and cannot be analysed
    if code == "0x":
        return "No bytecode at address", 404

    if code == None:
        return "Not a valid address", 400

    data = redis.get_routes_from_cache(address)
    if data == None:
        # if celery once key is found we now a task is still running
        key = queue_once_key(disassembly_task_name, {"address": address, "args": use_args(
            etherscan_token=etherscan_token, ethpector_rpc=ethpector_rpc)}, ["address"])
        if redis.get_routes_from_cache(key) != None:
            return {"state": 2}

        return {"state": 1}

    data = json.loads(data)
    disassembly_summary = json_to_assembly(data['disassembly_summary'])
    symbolic_summary = json_to_symbolic(data['symbolic_summary'])
    bbs = json_to_basic_blocks(data['bbs'])
    links = data['links']
    pc_to_block = {int(k): int(v) for k, v in data['pc_to_block'].items()}

    blocks = []

    web3prov = NodeProvider(rpc_url=ethpector_rpc)

    add_storage_lookups(symbolic_summary, address, bbs, pc_to_block, web3prov)

    signature_provider = SignatureProvider()

    add_event_lookups(symbolic_summary, bbs, pc_to_block, signature_provider)

    # create dict that maps all instructions to each block
    for _id, bb in enumerate(bbs):
        block_dict = create_block_dict(_id, bb)

        blocks.append(block_dict)

    add_symbolics(symbolic_summary, blocks, pc_to_block)

    # calculate coverage
    ac = (
        (disassembly_summary.unique_instructions_visited /
         disassembly_summary.total_instructions)
        if disassembly_summary.total_instructions > 0
        else 0
    )
    sc = (
        (symbolic_summary.unique_instructions_visited /
         disassembly_summary.total_instructions)
        if disassembly_summary.total_instructions > 0
        else 0
    )
    coverage = {"assembly": ac, "symbolic": sc}

    data = {"blocks": blocks, "links":
            links, "functions": data['functions'], "coverage": coverage}

    return data


@celery.task(name="get_disassembly_cfg")
def get_disassembly_cfg(address, args):
    try:
        analysis = get_analysis(address, args)
    except ValueError as valueError:
        # not found if valueError
        return {"task_error": {"message": str(valueError), "status": 404}}

    if (analysis == None):
        return {"task_error": {"message": "No analysis result", "status": 404}}

    if (not type(analysis).__name__ == "CodeAnalysis" and "task_error" in analysis):
        return analysis

    bbs = analysis.aa.get_basic_blocks()

    return json_graph.node_link_data(bbs.get_cfg())


@disassembly_route.route("/<address>")
def analyse_disassembly(address):

    try:
        body = json.loads(request.data)
    except JSONDecodeError:
        body = None

    token = etherscan_token
    rpc = ethpector_rpc
    mythril_args = None

    if body:
        if "mythril" in body:
            mythril_args = body['mythril']

        if "secrets" in body:
            if "etherscan" in body['secrets']:
                token = body['secrets']['etherscan']
            if "rpc" in body['secrets']:
                rpc = body['secrets']['rpc']

    try:
        get_disassembly.delay(address, use_args(
            etherscan_token=token, ethpector_rpc=rpc), mythril_args)
    except AlreadyQueued:
        return {"state": 2}, 200

    return {"state": 3}, 200


@disassembly_route.route("/cfg/<address>")
def analyse_disassembly_cfg(address):

    disassembly_task = get_disassembly_cfg.delay(address, use_args(
        etherscan_token=etherscan_token, ethpector_rpc=ethpector_rpc))
    return {"task_id": disassembly_task.id}
