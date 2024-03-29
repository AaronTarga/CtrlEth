from celery.result import AsyncResult
from celery.signals import setup_logging
from utils import get_analysis, use_args
from routes.disassembly_routes import disassembly_route
from routes.information_routes import information_route
from routes.lookup_routes import lookup_route
from shared import app, inspect, celery
from utils.source import categorize_abi_names
from utils.format import str_timestamp_to_date
from utils.mongo import Mongo
from flask import request


app.register_blueprint(disassembly_route, url_prefix="/disassembly")
app.register_blueprint(information_route, url_prefix="/information")
app.register_blueprint(lookup_route, url_prefix="/lookup")


@setup_logging.connect
# prevent celery from overriding logging and breaking mythril analysis workaround taken from this issue: https://github.com/celery/celery/issues/1867
def void(*args, **kwargs):
    """ Override celery's logging setup to prevent it from altering our settings.
    github.com/celery/celery/issues/1867

    :return void:
    """
    pass


@app.route("/source/<address>")
def analyse_source(address):

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    try:
        analysis = get_analysis(address, use_args(
            etherscan_token=token, ethpector_rpc=rpc))
    except ValueError as valueError:
        # not found if valueError
        return str(valueError), 404

    if analysis is None:
        return "No analysis result", 404

    if (not type(analysis).__name__ == "CodeAnalysis" and "task_error" in analysis):
        return analysis['task_error'], analysis['task_error']['status']

    summary = analysis.get_source_summary()

    # no analysis without credentials
    if "etherscan" not in summary.source_code:
        return {"type": 0,"message": "Etherscan token and rpc url neeeded for analysis"}, 400

    if "etherscan" not in summary.source_abi or "etherscan" not in summary.source_metadata:
        return "No Source code available on Etherscan", 404

    source_code = summary.source_code['etherscan'][0]['source_code']
    source_abi = summary.source_abi['etherscan']

    events, functions = categorize_abi_names(source_abi)

    source_metadata = summary.source_metadata['etherscan']

    return {"source_code": source_code, "source_abi": source_abi, "source_metadata": source_metadata, "functions": functions, "events": events}


def queued_tasks(task_dict, status):
    tasks = []
    for worker in task_dict:
        for task in task_dict[worker]:
            formatted_task = {}
            formatted_task['contract'] = task['args'][0]
            formatted_task['args'] = task['args'][2]
            formatted_task['timestamp'] = str_timestamp_to_date(
                int(task['time_start']))
            formatted_task['type'] = task['type']
            formatted_task['id'] = task['id']
            formatted_task['status'] = status
            tasks.append(formatted_task)

    return tasks


@app.route("/tasks")
def get_tasks():
    worker_tasks = inspect.active()
    received_tasks = inspect.reserved()
    tasks = []

    tasks += queued_tasks(worker_tasks, "active")
    tasks += queued_tasks(received_tasks, "waiting")

    return {"tasks": tasks}


@app.route("/tasks/<task_id>")
def get_status(task_id):
    task_result = AsyncResult(task_id)
    result = task_result.result

    return {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": result
    }


@app.route("/contracts")
def get_contracts():
    mongo = Mongo()
    contracts = mongo.db['contracts'].distinct("contract")
    return {"contracts": contracts}
