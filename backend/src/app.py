import os
from celery.result import AsyncResult
from flask import jsonify
from celery.signals import setup_logging
from utils import get_analysis, use_args
from disassembly_routes import disassembly_route
from information_routes import information_route
from shared import app,inspect, celery
from utils.source import categorize_abi_names

etherscan_token = os.environ.get('ETHERSCAN_TOKEN')
ethpector_rpc = os.environ.get('ETHPECTOR_RPC')

app.register_blueprint(disassembly_route, url_prefix="/disassembly")
app.register_blueprint(information_route, url_prefix="/information")


@setup_logging.connect
# prevent celery from overriding loggin and breaking mythril analysis workaround taken from this issue: https://github.com/celery/celery/issues/1867
def void(*args, **kwargs):
    """ Override celery's logging setup to prevent it from altering our settings.
    github.com/celery/celery/issues/1867

    :return void:
    """
    pass


@app.route("/source/<address>")
def analyse_source(address):
    try:
        analysis = get_analysis(address, use_args(
            etherscan_token=etherscan_token, ethpector_rpc=ethpector_rpc))
    except ValueError as valueError:
        # not found if valueError
        return str(valueError), 404

    if analysis is None:
        return "No analysis result", 404

    if (not type(analysis).__name__ == "CodeAnalysis" and "task_error" in analysis):
        return analysis['task_error']['message'], analysis['task_error']['status']

    summary = analysis.get_source_summary()

    # no analysis without etherscan token
    if "etherscan" not in summary.source_code:
        return "Etherscan token neeeded for analysis", 500

    if "etherscan" not in summary.source_abi or "etherscan" not in summary.source_metadata:
        return "No Source code available on Etherscan", 404

    source_code = summary.source_code['etherscan'][0]['source_code']
    source_abi = summary.source_abi['etherscan']

    events, functions = categorize_abi_names(source_abi)

    source_metadata = summary.source_metadata['etherscan']

    return {"source_code": source_code, "source_abi": source_abi, "source_metadata": source_metadata, "functions": functions, "events": events}


@app.route("/tasks")
def get_tasks():
    worker_tasks = inspect.active()
    active_tasks = []
    for worker in worker_tasks:
        for task in worker_tasks[worker]:
            formatted_task = {}
            formatted_task['contract'] = task['args'][0]
            formatted_task['args'] = task['args'][2]
            formatted_task['timestamp'] = task['time_start']
            formatted_task['type'] = task['type']
            formatted_task['id'] = task['id']
            active_tasks.append(formatted_task)
    return  { "tasks": active_tasks }

@app.route("/tasks/<task_id>")
def get_status(task_id):
    task_result = AsyncResult(task_id)
    result = task_result.result

    return {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": result
    }
