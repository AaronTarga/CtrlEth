
from ethpector.abi import AbiJson


def categorize_abi_names(source_abi):
    if (type(source_abi) is not list):
        source_abi = None
    abi_json = AbiJson(source_abi)
    events = []
    functions = []
    for abi in abi_json.abi_dict:
        try:
            signature = AbiJson.abi_entry_to_signature(abi)
        except Exception as exception:
            print(f"failed to parse abi {exception}")
        if (abi['type'] == 'event'):
            events.append(signature)
        elif (abi['type'] == 'function'):
            functions.append(signature)

    return (events,functions)