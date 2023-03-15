from flask_cors import CORS
from flask import Flask
from flask_celeryext import FlaskCeleryExt
from .celery import make_celery
from dotenv import load_dotenv
from ethpector.analysis import CodeAnalysis
from ethpector.data import AggregateProvider
from ethpector.config import Configuration
from types import SimpleNamespace
from datatypes.config import MythrilConfiguration

load_dotenv()

celery_ext = FlaskCeleryExt(create_celery_app=make_celery)


def create_app():
    app = Flask(__name__)
    app.config.from_prefixed_env()
    CORS(app)
    celery_ext.init_app(app)

    return app


def use_args(ethpector_rpc=None, etherscan_token=None):
    return {"rpc": ethpector_rpc, "etherscan_token": etherscan_token, "concolic": None, "loglevel": None, "deploy_code": None, "address": None,
            "tofile": None, "dont_drop_metadatastring": None, "offline": False, "nodotenv": None, "output": None, "output_dir": 'ethpector-output'}


def get_analysis(address, args, mythril_args=None):

    config = Configuration(SimpleNamespace(**args))

    if mythril_args:
        config.mythril = MythrilConfiguration({
            "mythril_concolic": mythril_args.get("mythril_concolic"),
            "strategy": mythril_args.get("strategy"),
            "execution_timeout": mythril_args.get("execution_timeout"),
            "max_depth": mythril_args.get("max_depth"),
            "loop_bound": mythril_args.get("loop_bound"),
            "create_timeout": mythril_args.get("create_timeout"),
            "solver_timeout": mythril_args.get("solver_timeout"),
            "call_depth_limit": mythril_args.get("call_depth_limit"),
            "transaction_count": mythril_args.get("transaction_count")
        })

    online_resolver = AggregateProvider(config)

    account_summary = online_resolver.account_summary(address)

    if (account_summary == None):
        return {"task_error": {"message": "Etherscan token needed for analysis", "status": 400, "type": 0}}

    if (account_summary.is_contract == None or not account_summary.is_contract):
        return {"task_error": {"message": "Address input is not a contract address", "status": 400, "type": 1}}

    code = None

    try:
        code = (
            online_resolver.first_of(["node", "etherscan"]).get_code(address)
            if not code
            else code
        )
    except Exception as ex:
        return {"type": 0, "message": str(ex)}, 400

    if code is None:
        return None

    analysis = CodeAnalysis(address, code, config, online_resolver)

    return analysis
