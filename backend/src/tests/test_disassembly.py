from utils.disassembly import addTypeToBlock, generate_jumps
from datatypes.data import ReportedBasicBlocks, ReportedInstructions, ReportedSymbolicExecSummary, Log, ReportedSymbolicVariable, StorageLoad, TypedAnnotation
from unittest.mock import Mock, PropertyMock
from hexbytes import HexBytes


def test_priorities():

    block = {"types": []}

    addTypeToBlock(block, "logs")
    addTypeToBlock(block, "push")
    addTypeToBlock(block, "selfdestruct")
    addTypeToBlock(block, "dsf")

    assert block['types'] == ["selfdestruct", "logs", "push"]


def test_no_jump_target():
    bb = Mock()
    bb.get_next_block_true_branch = Mock(return_value=2)
    type(bb).i = PropertyMock(return_value=2)

    pc_to_block = {20: 3, 5: 1}

    assert generate_jumps(bb, pc_to_block) == []


def test_valid_true_jump_target():
    bb = Mock()
    bb.get_next_block_true_branch = Mock(return_value=20)
    type(bb).i = PropertyMock(return_value=2)

    pc_to_block = {20: 4, 5: 1}

    assert generate_jumps(bb, pc_to_block) == [{"source": 2, "target": 4}]


def test_valid_false_jump_target():
    bb = Mock()
    bb.get_next_block_false_branch = Mock(return_value=4)
    type(bb).i = PropertyMock(return_value=2)

    pc_to_block = {}

    assert generate_jumps(bb, pc_to_block, conditional=True) == [
        {"source": 2, "target": 4, "condition": False}]
