from utils.disassembly import addTypeToBlock, add_event_lookups, add_storage_lookups, generate_jumps
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


def test_storage_pc_not_mapped():
    web_provider = Mock()
    web_provider.get_storage_at = Mock(
        return_value=HexBytes("0x577261707065642045746865720000000000000000000000000000000000001a"))
    address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    pc = 12
    pc_to_block = {20: 0}

    instructions = [ReportedInstructions([], [{"_class": "StorageLoad", "data": {}}])]
    bbs = [ReportedBasicBlocks(i=0, instructions=instructions, annotations=[
                               TypedAnnotation(_class="StorageLoad", data={})], nextBlockIndex=None)]

    load = StorageLoad(pc=pc, slot=ReportedSymbolicVariable(var=1), tags={})

    symbolic = ReportedSymbolicExecSummary(
        [], [], [load], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], 0)


    try:
        add_storage_lookups(symbolic, address, bbs, pc_to_block, web_provider)
    except KeyError:
        assert False, "Should handle key errors of pc_to_block"


def test_storage_lookups():
    web_provider = Mock()
    web_provider.get_storage_at = Mock(
        return_value=HexBytes("0x577261707065642045746865720000000000000000000000000000000000001a"))
    address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    pc = 20
    pc_to_block = {20: 0}

    instructions = [ReportedInstructions([], [{"_class": "StorageLoad", "data": {}}])]
    bbs = [ReportedBasicBlocks(i=0, instructions=instructions, annotations=[
                               TypedAnnotation(_class="StorageLoad", data={})], nextBlockIndex=None)]

    load = StorageLoad(pc=pc, slot=ReportedSymbolicVariable(var=1), tags={})

    symbolic = ReportedSymbolicExecSummary(
        [], [], [load], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], 0)

    add_storage_lookups(symbolic, address, bbs, pc_to_block, web_provider)
    
    assert bbs[0].instructions[0].annotations[0]['data']['concreteValue'] == "0x577261707065642045746865720000000000000000000000000000000000001a"
    

def test_event_lookups_pc_not_mapped():
    signature_provider = Mock()
    signature_provider.event_name = Mock(return_value=[
                                         "Sent(uint256,uint256,bytes32,uint256[],address,uint256,bytes32,addresss)"])
    pc = 10
    pc_to_block = {13: 0}

    instructions = [ReportedInstructions([], [{"_class": "Log", "data": {}}])]
    bbs = [ReportedBasicBlocks(i=0, instructions=instructions, annotations=[
                               TypedAnnotation(_class="Log", data={})], nextBlockIndex=None)]

    log = Log(tags={}, n=0, topic0=ReportedSymbolicVariable(var=int(
        "0x1c9f0c65ac3c9ec3bef182b74cf932aed4751e92e30545a1b1643173c757f348", 16)), topic1=None, topic2=None, topic3=None, data=None, pc=pc)

    symbolic = ReportedSymbolicExecSummary(
        [], [], [], [], [], [], [log], [], [], [], [], [], [], [], [], [], [], [], 0)

    try:
        add_event_lookups(symbolic, bbs, pc_to_block, signature_provider)
    except KeyError:
        assert False, "Should handle key errors of pc_to_block"


def test_event_lookups():
    signature_provider = Mock()
    signature_provider.event_name = Mock(return_value=[
                                         "Sent(uint256,uint256,bytes32,uint256[],address,uint256,bytes32,addresss)"])
    pc = 20
    pc_to_block = {20: 0}

    instructions = [ReportedInstructions([], [{"_class": "Log", "data": {}}])]
    bbs = [ReportedBasicBlocks(i=0, instructions=instructions, annotations=[
                               TypedAnnotation(_class="Log", data={})], nextBlockIndex=None)]

    log = Log(tags={}, n=0, topic0=ReportedSymbolicVariable(var=int(
        "0x1c9f0c65ac3c9ec3bef182b74cf932aed4751e92e30545a1b1643173c757f348", 16)), topic1=None, topic2=None, topic3=None, data=None, pc=pc)

    symbolic = ReportedSymbolicExecSummary(
        [], [], [], [], [], [], [log], [], [], [], [], [], [], [], [], [], [], [], 0)

    add_event_lookups(symbolic, bbs, pc_to_block, signature_provider)

    assert bbs[0].instructions[0].annotations[0]['data'][
        'name'] == "Sent(uint256,uint256,bytes32,uint256[],address,uint256,bytes32,addresss)"

def test_no_jump_target():
    bb = Mock()
    bb.get_next_block_true_branch = Mock(return_value=2)
    type(bb).i = PropertyMock(return_value=2)
    
    pc_to_block = {20: 3, 5: 1};
    
    assert generate_jumps(bb,pc_to_block) == []
    

def test_valid_true_jump_target():
    bb = Mock()
    bb.get_next_block_true_branch = Mock(return_value=20)
    type(bb).i = PropertyMock(return_value=2)
    
    pc_to_block = {20: 4, 5: 1};
    
    assert generate_jumps(bb,pc_to_block) == [{"source": 2, "target": 4}]

def test_valid_false_jump_target():
    bb = Mock()
    bb.get_next_block_false_branch = Mock(return_value=4)
    type(bb).i = PropertyMock(return_value=2)
    
    pc_to_block = {};
    
    assert generate_jumps(bb,pc_to_block,conditional=True) == [{"source": 2, "target": 4, "condition": False}]