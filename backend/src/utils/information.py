import requests
import os
from ethpector.utils import strip_0x, get_function_selector
from ethpector.data.signatures import SignatureProvider
from ethpector.classify.parser import EventDefinition, FunctionDefinition
from eth_abi import abi
from hexbytes import HexBytes
from utils.format import str_timestamp_to_date
from web3 import Web3
from ethpector.abi import AbiJson
import sha3


etherscan_base = "https://api.etherscan.io/api"
etherscan_token = os.environ.get('ETHERSCAN_TOKEN')
ethpector_rpc = os.environ.get('ETHPECTOR_RPC')

signature_provider = SignatureProvider()
web3prov = Web3(Web3.HTTPProvider(ethpector_rpc))


def etherscan_contract_creation(address, eth):
    resp = requests.get(
        f"{etherscan_base}?module=contract&action=getcontractcreation&contractaddresses={address}&apiKey={etherscan_token}")
    creator_res = resp.json()

    if "message" not in creator_res:
        return (None,None,None)

    if creator_res['message'].startswith("NOTOK"):
        return (None,None,None)

    if "result" not in creator_res or len(creator_res['result']) < 1:
        return (None,None,None)
    
    creation = creator_res['result'][0]
    transaction = creation['txHash'] if 'txHash' in creation else None
    creator = creation['contractCreator'] if 'contractCreator' in creation else None
    transaction = eth.get_proxy_transaction_by_hash(txhash=transaction)
    block_number = transaction['blockNumber'] if 'blockNumber' in transaction else None
    block = eth.get_proxy_block_by_number(tag=block_number)
    contract_timestamp = block['timestamp'] if 'timestamp' in block else None

    return (transaction, creator, contract_timestamp)


def etherscan_transactions(address, eth, max_blocks):

    txs = []
    latest_block = int(eth.get_proxy_block_number(), base=0)
    start_block = latest_block - max_blocks
    try:
        txs = eth.get_normal_txs_by_address(
            address=address, startblock=start_block, endblock=latest_block, sort="desc")
    except AssertionError as assertError:
        if ("No transactions found" in assertError.args[0]):
            txs = []
        else:
            return {"task_error": {"message": "txs failure", "status": 500}}
    except Exception as error:
        return {"task_error": {"message": "txs failure", "status": 500}}

    int_txs = []
    try:
        int_txs = eth.get_internal_txs_by_address(
            address=address, startblock=start_block, endblock=latest_block, sort="desc")
    except AssertionError as assertError:
        if ("No transactions found" in assertError.args[0]):
            int_txs = []
        else:
            return {"task_error": {"message": "internal txs failure", "status": 500}}
    except Exception as error:
        return {"task_error": {"message": "internal txs failure", "status": 500}}

    return (txs, int_txs)


def decode_transactions(address,txs,abi=None):
    if abi:
        try:
            contract = web3prov.eth.contract(address,abi=abi)
        except Exception as error:
            print(f"web3py issue: {error}")
        for tx in txs:
            # https://web3py.readthedocs.io/en/v5/contracts.html?highlight=decode%20parameters#web3.contract.Contract.decode_function_input
            try:
                decoded_input = contract.decode_function_input(tx['input'])
                _function = decoded_input[0]
                tx['functionName'] = f"{_function.function_identifier}({', '.join([value['type'] for value in _function.abi['inputs']])})"
                tx['functionArguments'] = decoded_input[1]
            except ValueError as valueError:
                print(valueError)
    else:
        # taking first 4 bytes and using as input
        for tx in txs:
            try:
                signature = get_function_selector(tx['input'])
                if signature is None:
                    continue
                name = signature_provider.function_name(signature)[0]
                fd = FunctionDefinition(name)
                tx['functionName'] = name
                try:
                    tx['functionArguments'] = fd.decode_input_to_str(tx['input'])
                except Exception as error:
                    print(f"Failed to parse arguments of {name}")
            except ValueError as value_error:
                print(value_error)

def decode_log_no_abi(log):
    topics = log['topics']
    try:
        name = signature_provider.event_name(topics[0].hex())[0]
    except Exception as exception:
        print(f"event lookup failed with following exception: {exception}")
        return None
    event_decode = EventDefinition(name)
    types = event_decode.param_types()
    indexed_amount = len(topics) - 1
    try:
        hex_data = HexBytes(log['data'])
    except Exception as exception:
        print(f"not encodable data {exception}")

    index_topics = topics[1:]
    indexed_values = []

    for i, topic in enumerate(index_topics):
        try:
            indexed_values.append(
                {types[i]: abi.decode([types[i]], topic)[0]})
        except Exception as exception:
            print(f"decoding indexed value failed: {exception}")

    unindexed_values = []
    if (hex_data):
        try:
            unindexed_values = list(zip(types[indexed_amount:], list(
                abi.decode(types[indexed_amount:], hex_data))))
            unindexed_values = [{value[0]: value[1]}
                                for value in unindexed_values]
        except Exception as exception:
            print(f"decoding unindexed value failed: {exception}")

    return (name,indexed_values,unindexed_values)

def decode_log_abi(log,contract,mapping):

    topic_signature = log['topics'][0].hex()

    if topic_signature in mapping:
        signature = mapping[topic_signature]
    else:
        return None
    
    event = contract.events[signature.split("(")[0]]

    receipt = web3prov.eth.getTransactionReceipt(log['transactionHash'])
    for receipt_log in receipt['logs']:
        if receipt['logs'][0]['topics'][0].hex() == topic_signature:
            try:
                processed_log = event().processLog(receipt_log)
                indexed_dict = dict([ (input['name'], input['indexed']) for input in event().abi['inputs'] ])
                indexed = [{name: str(indexed)} for name, indexed in processed_log['args'].items() if indexed_dict[name]]
                unindexed = [{name: indexed} for name, indexed in processed_log['args'].items() if not indexed_dict[name]]
                return (signature,indexed,unindexed)
            except Exception as exception:
                print(f"Decoding log failed with following message {exception}")
                return None

def decode_events(address,logs,abi=None):
    events = []
    
    if abi != None:
        try:
            contract = web3prov.eth.contract(address,abi=abi)
        except Exception as error:
            print(f"web3py issue: {error}")
        
        if contract:
            abi_json = AbiJson(abi)
            event_signatures = [AbiJson.abi_entry_to_signature(x) for x in abi_json.abi_dict if x["type"] == "event"]
            signature_mapping = dict([ ( "0x" + (sha3.keccak_256(signature.encode("utf-8")).hexdigest().lower()),signature) for signature in event_signatures])

    for log in logs:

        if contract:
            decoded_log = decode_log_abi(log,contract,signature_mapping)
        #if abi failed or not available use custom function    
        if decoded_log == None:
            decoded_log = decode_log_no_abi(log)

        name =  log['topics'][0].hex()
        indexed_values = []
        unindexed_values = []

        if decoded_log != None:

            name,indexed_values,unindexed_values = decoded_log
            
        block = web3prov.eth.getTransaction(log.transactionHash).blockNumber
        
        timestamp = web3prov.eth.getBlock(block).timestamp

        events.append({"signature": name, "indexedValues": indexed_values, "unindexedValues": unindexed_values,
                    "timestamp":  str_timestamp_to_date(timestamp), "transactionHash": log['transactionHash'].hex()})

    return events

def retrieve_events(address, eth, max_blocks,starting_max):

    latest_block = int(eth.get_proxy_block_number(), base=0)
    start_block = latest_block - starting_max

    current_blocks = starting_max

    logs = None
    # limit down blocks until only 1000 results in query left (1000 most recent transaction)
    while (logs == None or len(logs) < 50) and current_blocks <= max_blocks and current_blocks > 1000:
        try:
            logs = web3prov.eth.get_logs({"fromBlock": start_block,"address": address})
        except ValueError:
            current_blocks /= 2
            start_block = int(latest_block - current_blocks)

        if logs != None and len(logs) < 50:
            current_blocks *= 10
            start_block = int(latest_block - current_blocks)

    logs.reverse()

    logs = logs[:50]

    return logs
