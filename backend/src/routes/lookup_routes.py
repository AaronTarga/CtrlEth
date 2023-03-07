import os
from flask import Blueprint, request
from ethpector.data.signatures import SignatureProvider
from ethpector.data.node import NodeProvider
import json


lookup_route = Blueprint('lookup', __name__,)
ethpector_rpc = os.environ.get('ETHPECTOR_RPC')

disassembly_task_name = "get_disassembly"


signature_provider = SignatureProvider()


@lookup_route.route("/storage/<address>")
def storage_lookup(address):

    rpc = request.args.get('rpc')
    if (rpc == None):
        rpc = ethpector_rpc
        
    web3prov = NodeProvider(rpc_url=rpc)
    
    variable = request.args.get('slot')

    if variable == None:
        return "Slot parameter missing",400

    try:
        storage_value = web3prov.get_storage_at(
                address, hex(int(variable,0)))
    except ValueError:
        return "Invalid value given",400

    if storage_value == None:
        return "Could not resolve storage of contract",404

    return json.dumps(storage_value.hex())

@lookup_route.route("/event/<event>")
def event_lookup(event):
    
    signature = None

    try:
        matches = signature_provider.event_name(hex(int(event,0)))
        if (len(matches) > 0):
            signature = " or ".join(matches)
    except ValueError:
        return "Invalid value given",400
    except Exception as exception:
        print(
            f"signature lookup failed with following error: {exception}")

    if signature == None:
        return "Could not retrieve signature",404

    return json.dumps(signature)