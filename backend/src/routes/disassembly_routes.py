import os
from flask import Blueprint, request
from utils.disassembly import add_annotations, add_symbolics, create_block_dict, is_conditional_jump, generate_jumps
from utils import get_analysis, use_args
from ethpector.data import AggregateProvider
from ethpector.data.datatypes import to_json
from datatypes.json_mapping import json_to_assembly, json_to_basic_blocks, json_to_symbolic
import json
from celery_once import QueueOnce
from shared import celery, redis
import dataclasses
from celery_once import AlreadyQueued
from ethpector.config import Configuration
from types import SimpleNamespace
from celery_once.helpers import queue_once_key
from utils.mongo import Mongo


secret = os.getenv("CREATE_SECRET")
disassembly_route = Blueprint('disassembly', __name__,)
disassembly_task_name = "get_disassembly"


class IntDecoder(json.JSONDecoder):
    # Need to decode ints into strings because some integers are too large for mongodb to store
    def decode(self, s):
        result = super().decode(s)
        return self._decode(result)

    def _decode(self, o):
        if isinstance(o, int):
            return str(o)
        elif isinstance(o, dict):
            return {k: self._decode(v) for k, v in o.items()}
        elif isinstance(o, list):
            return [self._decode(v) for v in o]
        else:
            return o


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

        data = to_json({"contract": address, "symbolic_summary": symbolic_summary,
                       "disassembly_summary": disassembly_summary, "bbs": bbs, "links": links, "pc_to_block": pc_to_block, "functions": functions})
        # saving result in mongodb at the end
        mongo = Mongo()
        mongo.db['contracts'].insert_one(json.loads(data, cls=IntDecoder))
        mongo.close()

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

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    config = Configuration(SimpleNamespace(**use_args(
        etherscan_token=token, ethpector_rpc=rpc)))

    online_resolver = AggregateProvider(config)
    code = online_resolver.first_of(["node", "etherscan"]).get_code(address)

    # invalid addresses have no code and external account addresses or selfdestructed contracts have 0x as code and cannot be analysed
    if code == "0x":
        return "No bytecode at address", 404

    if code == None:
        return "Not a valid address", 400

    mongo = Mongo()
    data = mongo.db['contracts'].find_one({"contract": address})
    mongo.close()
    if data == None:
        # if celery once key is found we now a task is still running
        key = queue_once_key(disassembly_task_name, {"address": address, "args": use_args(
            etherscan_token=token, ethpector_rpc=rpc)}, ["address"])
        if redis.get_routes_from_cache(key) != None:
            return {"state": 2}

        return {"state": 1}

    disassembly_summary = json_to_assembly(data['disassembly_summary'])
    symbolic_summary = json_to_symbolic(data['symbolic_summary'])
    bbs = json_to_basic_blocks(data['bbs'])
    links = data['links']
    pc_to_block = {int(k): int(v) for k, v in data['pc_to_block'].items()}

    blocks = []

    # create dict that maps all instructions to each block
    for _id, bb in enumerate(bbs):
        block_dict = create_block_dict(_id, bb)

        blocks.append(block_dict)

    add_symbolics(symbolic_summary, blocks, pc_to_block)

    # calculate coverage
    ac = (
        (int(disassembly_summary.unique_instructions_visited) /
         int(disassembly_summary.total_instructions))
        if int(disassembly_summary.total_instructions) > 0
        else 0
    )
    sc = (
        (int(symbolic_summary.unique_instructions_visited) /
         int(disassembly_summary.total_instructions))
        if int(disassembly_summary.total_instructions) > 0
        else 0
    )
    coverage = {"assembly": ac, "symbolic": sc}

    data = {"blocks": blocks, "links":
            links, "functions": data['functions'], "coverage": coverage}

    return data


@disassembly_route.route("/<address>")
def analyse_disassembly(address):

    if secret != None and request.args.get('secret') != secret:
        return "Not authorized",401

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    try:
        execution_timeout = int(request.args.get('execution_timeout'))
    except (ValueError, TypeError):
        execution_timeout = None
    try:
        create_timeout = int(request.args.get('create_timeout'))
    except (ValueError, TypeError):
        create_timeout = None
    try:
        max_depth = int(request.args.get('max_depth'))
    except (ValueError, TypeError):
        max_depth = None
    try:
        solver_timeout = int(request.args.get('solver_timeout'))
    except (ValueError, TypeError):
        solver_timeout = None

    mythril_args = {
        "execution_timeout": execution_timeout,
        "create_timeout": create_timeout,
        "max_depth": max_depth,
        "solver_timeout": solver_timeout
    }

    try:
        get_disassembly.delay(address, use_args(
            etherscan_token=token, ethpector_rpc=rpc), mythril_args)
    except AlreadyQueued:
        return {"state": 2}, 200

    return {"state": 3}, 200
