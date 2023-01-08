from flask_cors import CORS
from flask import Flask
from flask_celeryext import FlaskCeleryExt
from .celery import make_celery
from dotenv import load_dotenv
from ethpector.analysis import CodeAnalysis
from ethpector.data import AggregateProvider
from ethpector.config import Configuration
from types import SimpleNamespace

load_dotenv()

celery_ext = FlaskCeleryExt(create_celery_app=make_celery)


def create_app():
    app = Flask(__name__)
    app.config.from_prefixed_env()
    CORS(app)
    celery_ext.init_app(app)

    return app

def use_args(ethpector_rpc= None, etherscan_token=None):
    return {"rpc": ethpector_rpc, "etherscan_token": etherscan_token, "concolic": None, "loglevel": None, "deploy_code": None, "address": None,
            "tofile": None, "dont_drop_metadatastring": None, "offline": False, "nodotenv": None, "output": None, "output_dir": 'ethpector-output'}

def get_analysis(address, args):

    config = Configuration(SimpleNamespace(**args))

    online_resolver = AggregateProvider(config)

    account_summary = online_resolver.account_summary(address)

    if (account_summary == None):
        return {"task_error": {"message": "Etherscan token needed for analysis", "status": 500}}

    if (account_summary.is_contract == None or not account_summary.is_contract):
        return {"task_error": {"message": "Address input is not a contract address", "status": 400}}

    code = None

    code = (
        online_resolver.first_of(["node", "etherscan"]).get_code(address)
        if not code
        else code
    )

    if code is None:
        return None

    analysis = CodeAnalysis(address, code, config, online_resolver)

    return analysis
