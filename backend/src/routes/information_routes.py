from flask import Blueprint, request
from ethpector.data import AggregateProvider
from types import SimpleNamespace
from ethpector.config import Configuration
from utils.information import etherscan_transactions, etherscan_contract_creation, decode_transactions, retrieve_events, decode_events
from shared import redis
from utils.format import format_transactions, str_timestamp_to_date
from etherscan import Etherscan
from web3 import Web3
from utils.redis import ttl
from utils import use_args
import json
from decimal import Decimal

max_blocks = 1000000
starting_max = 10000

information_route = Blueprint('information', __name__,)


def extract_account_summary(address, etherscan_token, ethpector_rpc):

    config = Configuration(SimpleNamespace(**use_args(
        etherscan_token=etherscan_token, ethpector_rpc=ethpector_rpc)))

    online_resolver = AggregateProvider(config)

    account_summary = online_resolver.account_summary(address)

    if (account_summary == None):
        return {"task_error": {"message": "Missing providers for endpoint to function", "status": 500}}

    if (account_summary.is_contract == None):
        return {"task_error": {"message": "Wrong Ethereum address as input", "status": 400}}

    return account_summary


def is_valid_address(account_summary):
    return account_summary.__class__.__name__ == "AccountSummary" or "task_error" not in account_summary


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)

        return json.JSONEncoder.default(self, obj)


@information_route.route("/basic/<address>")
def get_information(address):
    cache_key = f"{address}-information-basic"

    data = redis.get_routes_from_cache(cache_key)

    if data != None:
        return json.loads(data)

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    account_summary = extract_account_summary(address, token, rpc)

    if not is_valid_address(account_summary):
        return account_summary['task_error']['message'], account_summary['task_error']['status']

    if (not account_summary.is_contract):
        data = {
            "type": "external",
            "balance": Web3.fromWei(int(account_summary.balance), 'ether'),
        }
        return data

    if token is not None:
        eth = Etherscan(token)
    else:
        eth = Etherscan('')
    try:

        balance = eth.get_eth_balance(address=address)
        source = eth.get_contract_source_code(address=address)

        transaction, creator, contract_timestamp = etherscan_contract_creation(
            token, address, eth)
    except AssertionError as assertError:
        return str(assertError), 404
    except Exception as error:
        return str(error), 500

    data = {
        "type": "contract",
        "balance": Web3.fromWei(int(balance), 'ether'),
        "name": source[0]['ContractName'],
        "creator": creator,
        "creationTransaction": transaction,
        "creationDate": str_timestamp_to_date(contract_timestamp),
    }

    redis.set_routes_to_cache(cache_key, value=json.dumps(
        data, cls=DecimalEncoder), ttl=ttl)

    return data


@information_route.route("/transactions/<address>")
def get_transactions(address):
    cache_key = f"{address}-information-transactions"

    data = redis.get_routes_from_cache(cache_key)

    if data != None:
        return json.loads(data)

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    account_summary = extract_account_summary(address, token, rpc)

    if not is_valid_address(account_summary):
        return account_summary['task_error']['message'], account_summary['task_error']['status']

    if token is not None:
        eth = Etherscan(token)
    else:
        eth = Etherscan('')

    source = eth.get_contract_source_code(address=address)

    try:

        txs, int_txs = etherscan_transactions(address, eth, max_blocks)

        tx_limited = txs[:50]
        int_tx_limited = int_txs[:50]

        try:
            source_abi = json.loads(source[0]['ABI'])
        except:
            source_abi = None

        decode_transactions(rpc, address, tx_limited, abi=source_abi)

        data = {
            "normalTransactions": format_transactions(tx_limited),
            "internalTransactions": format_transactions(int_tx_limited),
        }

        redis.set_routes_to_cache(cache_key, value=json.dumps(
            data, cls=DecimalEncoder), ttl=ttl)

        return data
    except AssertionError as assertError:
        return str(assertError), 404
    except Exception as error:
        return str(error), 500


@information_route.route("/events/<address>")
def get_events(address):
    cache_key = f"{address}-information-events"

    data = redis.get_routes_from_cache(cache_key)

    if data != None:
        return json.loads(data)

    token = request.args.get('etherscan')
    rpc = request.args.get('rpc')

    account_summary = extract_account_summary(address, token, rpc)

    if not is_valid_address(account_summary):
        return account_summary['task_error']['message'], account_summary['task_error']['status']

    if token is not None:
        eth = Etherscan(token)
    else:
        eth = Etherscan('')

    try:

        source = eth.get_contract_source_code(address=address)

        try:
            source_abi = json.loads(source[0]['ABI'])
        except:
            source_abi = None

        events = retrieve_events(rpc, address, eth, max_blocks, starting_max)

        events = decode_events(rpc, address, events, source_abi)

        data = {
            "events": events
        }

        redis.set_routes_to_cache(cache_key, value=json.dumps(
            data, cls=DecimalEncoder), ttl=ttl)

        return data
    except AssertionError as assertError:
        return str(assertError), 404
    except Exception as error:
        return str(error), 500
