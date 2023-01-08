import json
from mythril.analysis.ops import get_variable, VarType

# checks if instructions is conditional jump
def is_conditional_jump(last):
    if last is None:
        return False
    else:
        return last.is_jumpi()


# generate jumps depending on wether it is static or conditional
def generate_jumps(bb, pc_to_block, conditional=False):
    target = bb.get_next_block_true_branch()
    jumps = []
    if target is not None and target in pc_to_block:
        jumps.append({"source": bb.i, "target": pc_to_block[target]})
    if conditional:
        false_jump = bb.get_next_block_false_branch()
        if false_jump is not None:
            jumps.append(
                {"source": bb.i, "target": false_jump, "condition": False})

    return jumps

# adding all annotations to the basic block object


def add_annotations(bb, symbolic, disassembly):
    for inst in bb.instructions:
        inst.annotations += symbolic.get_annotations_valid_at(inst.pc())
        inst.annotations += disassembly.get_annotations_valid_at(inst.pc())
    bb.propagage_block_annotations()


# convert basic block to json
def create_block_dict(_id, bb):
    block_dict = {}
    block_dict['types'] = []
    block_dict['i'] = _id
    block_dict['instructions'] = []
    block_dict['next'] = bb.nextBlockIndex
    for inst in bb.instructions:
        block_dict['instructions'].append(json.loads(inst.to_json()))

    return block_dict


priorities = {
    "selfdestruct": 1,
    "calls": 2,
    "creates": 3,
    "revert": 4,
    "returns": 5,
    "logs": 6,
    "calldataloads": 7,
    "calldatacopies": 8,
    "storageReads": 9,
    "storageWrites": 10,
    "memoryReads": 11,
    "memoryWrites": 12,
    "push": 13,
}

# append types depending on priority
# if priority is greater it keeps looping until meet its place in list
# if priority is equal it does not add to the types array because we do not want duplicates


def addTypeToBlock(block, newType):
    i = 0
    block['types'].append(newType)
    block['types'] = list(filter(lambda item: item in block['types'], [
                          _type for _type, _ in priorities.items()]))


def add_symbolics(symbolic, blocks, pc_to_block):
    for _function in symbolic.functions:
        name = _function.name
        for pc in _function.pcs:
            blocks[pc_to_block[pc]]['function'] = name
    for _selfdestruct in symbolic.selfdestructs:
        addTypeToBlock(blocks[pc_to_block[_selfdestruct.pc]], "selfdestruct")
    for _revert in symbolic.reverts:
        addTypeToBlock(blocks[pc_to_block[_revert.pc]], "revert")
    for _calls in symbolic.calls:
        addTypeToBlock(blocks[pc_to_block[_calls.pc]], "calls")

    for _create in symbolic.creates:
        addTypeToBlock(blocks[pc_to_block[_create.pc]], "creates")
    for _create2s in symbolic.create2s:
        addTypeToBlock(blocks[pc_to_block[_create2s.pc]], "creates")
    for _returns in symbolic.returns:
        addTypeToBlock(blocks[pc_to_block[_returns.pc]], "returns")
    for _storage_read in symbolic.storage_reads:
        addTypeToBlock(blocks[pc_to_block[_storage_read.pc]], "storageReads")
    for _storage_write in symbolic.storage_writes:
        addTypeToBlock(blocks[pc_to_block[_storage_write.pc]], "storageWrites")
    for _memory_read in symbolic.memory_reads:
        addTypeToBlock(blocks[pc_to_block[_memory_read.pc]], "memoryReads")
    for _memory_write in symbolic.memory_writes:
        addTypeToBlock(blocks[pc_to_block[_memory_write.pc]], "memoryWrites")
    for _push in symbolic.pushes:
        addTypeToBlock(blocks[pc_to_block[_push.pc]], "push")
    for _log in symbolic.logs:
        addTypeToBlock(blocks[pc_to_block[_log.pc]], "logs")
    for _calldataloads in symbolic.calldataloads:
        addTypeToBlock(blocks[pc_to_block[_calldataloads.pc]], "calldataloads")
    for _calldatacopies in symbolic.calldatacopies:
        addTypeToBlock(
            blocks[pc_to_block[_calldatacopies.pc]], "calldatacopies")


def add_storage_lookups(symbolic_summary, address, bbs, pc_to_block, web3prov):
    for sload in symbolic_summary.storage_reads:
        # using get variable from mythril to retrive a concrete value
        try:
            variable = get_variable(sload.slot.var)
        except AssertionError:
            variable = None
        except ValueError:
            variable = None

        if variable != None and variable.type == VarType.CONCRETE:
            storage_value = web3prov.get_storage_at(
                address, hex(variable.val))

            try:
                block_id = pc_to_block[sload.pc]
            except KeyError:
                block_id = None

            if block_id != None:
                for instruction in bbs[block_id].instructions:
                    for annotation in instruction.annotations:
                        if annotation['_class'] == "StorageLoad":
                            hex_value = storage_value.hex()
                            if hex_value != None:
                                annotation['data']['concreteValue'] = hex_value
                            if storage_value.isascii():
                                text = storage_value.decode('utf8')
                                if text != None or text == '':
                                    annotation['data']['concreteValueText'] = text


def add_event_lookups(symbolic_summary, bbs, pc_to_block, signature_provider):

    for event in symbolic_summary.logs:

        get_variable(event.topic0.var)
        try:
            variable = get_variable(event.topic0.var)
        except AssertionError:
            variable = None
        except ValueError:
            variable = None

        signature = None
        if variable != None and variable.type == VarType.CONCRETE:
            try:
                matches = signature_provider.event_name(hex(variable.val))
                if (len(matches) > 0):
                    signature = " or ".join(matches)
            except Exception as exception:
                print(
                    f"signature lookup failed with following error: {exception}")

        if signature != None:
            try:
                block_id = pc_to_block[event.pc]
            except KeyError:
                block_id = None

            if block_id != None:
                for instruction in bbs[block_id].instructions:
                    for annotation in instruction.annotations:
                        if annotation['_class'] == "Log":
                            annotation['data']['name'] = signature
