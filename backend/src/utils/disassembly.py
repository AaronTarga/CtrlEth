import json
from mythril.analysis.ops import get_variable, VarType


def is_conditional_jump(last):
    # checks if instructions is conditional jump
    if last is None:
        return False
    else:
        return last.is_jumpi()


def generate_jumps(bb, pc_to_block, conditional=False):
    # generate jumps depending on wether it is static or conditional
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


def add_annotations(bb, symbolic, disassembly):
    # adding all annotations to the basic block object
    for inst in bb.instructions:
        inst.annotations += symbolic.get_annotations_valid_at(inst.pc())
        inst.annotations += disassembly.get_annotations_valid_at(inst.pc())
    bb.propagage_block_annotations()


def create_block_dict(_id, bb):
    # convert basic block to json
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


def addTypeToBlock(block, newType):
    '''
    append types depending on priority
    if priority is greater it keeps looping until meet its place in list
    if priority is equal it does not add to the types array because we do not want duplicates
    '''
    i = 0
    block['types'].append(newType)
    block['types'] = list(filter(lambda item: item in block['types'], [
                          _type for _type, _ in priorities.items()]))


def add_symbolics(symbolic, blocks, pc_to_block):
    for _function in symbolic.functions:
        name = _function.name
        for pc in _function.pcs:
            blocks[pc_to_block[int(pc)]]['function'] = name
    for _selfdestruct in symbolic.selfdestructs:
        addTypeToBlock(blocks[pc_to_block[int(_selfdestruct.pc)]], "selfdestruct")
    for _revert in symbolic.reverts:
        addTypeToBlock(blocks[pc_to_block[int(_revert.pc)]], "revert")
    for _calls in symbolic.calls:
        addTypeToBlock(blocks[pc_to_block[int(_calls.pc)]], "calls")

    for _create in symbolic.creates:
        addTypeToBlock(blocks[pc_to_block[int(_create.pc)]], "creates")
    for _create2s in symbolic.create2s:
        addTypeToBlock(blocks[pc_to_block[int(_create2s.pc)]], "creates")
    for _returns in symbolic.returns:
        addTypeToBlock(blocks[pc_to_block[int(_returns.pc)]], "returns")
    for _storage_read in symbolic.storage_reads:
        addTypeToBlock(blocks[pc_to_block[int(_storage_read.pc)]], "storageReads")
    for _storage_write in symbolic.storage_writes:
        addTypeToBlock(blocks[pc_to_block[int(_storage_write.pc)]], "storageWrites")
    for _memory_read in symbolic.memory_reads:
        addTypeToBlock(blocks[pc_to_block[int(_memory_read.pc)]], "memoryReads")
    for _memory_write in symbolic.memory_writes:
        addTypeToBlock(blocks[pc_to_block[int(_memory_write.pc)]], "memoryWrites")
    for _push in symbolic.pushes:
        addTypeToBlock(blocks[pc_to_block[int(_push.pc)]], "push")
    for _log in symbolic.logs:
        addTypeToBlock(blocks[pc_to_block[int(_log.pc)]], "logs")
    for _calldataloads in symbolic.calldataloads:
        addTypeToBlock(blocks[pc_to_block[int(_calldataloads.pc)]], "calldataloads")
    for _calldatacopies in symbolic.calldatacopies:
        addTypeToBlock(
            blocks[pc_to_block[int(_calldatacopies.pc)]], "calldatacopies")

