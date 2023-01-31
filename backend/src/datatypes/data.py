from typing import Optional
from mythril.analysis.ops import Variable
import pyevmasm as EVMAsm
from dataclasses import dataclass
from ethpector.data.datatypes import SymbolicExpression


@dataclass
class ReportedSymbolicVariable:
    var: Variable | str
    symbolic: Optional[bool] = False


@dataclass
class ReportedInstructions():
    instruction: EVMAsm.Instruction
    annotations: list[any]


@dataclass
class ReportedSymbolicMemorySlice:
    value: str


@dataclass
class ReportedSymbolicExpression:
    condition: str


@dataclass
class TypedAnnotation:
    _class: str
    data: any


@dataclass
class ReportedBasicBlocks:
    i: int
    instructions: list[ReportedInstructions]
    annotations: list[TypedAnnotation]
    nextBlockIndex: Optional[int]


@dataclass
class ReportedAnnotation():
    tags: dict


@dataclass
class ReportedPCAnnotation(ReportedAnnotation):
    pc: int


@dataclass
class FunctionSummary(ReportedAnnotation):
    name: str
    pcs: list[int]
    has_writes: bool
    has_reads: bool
    has_logs: bool
    has_calls: bool
    has_delegate: bool
    has_creates: bool
    has_create2s: bool
    has_selfdestructs: bool


@dataclass
class Call(ReportedPCAnnotation):
    to: ReportedSymbolicVariable
    gas: ReportedSymbolicVariable
    type: ReportedSymbolicVariable
    value: ReportedSymbolicVariable
    data: ReportedSymbolicVariable


@dataclass
class StorageLoad(ReportedPCAnnotation):
    slot: ReportedSymbolicVariable


@dataclass
class StorageWrite(ReportedPCAnnotation):
    slot: ReportedSymbolicVariable
    value: ReportedSymbolicVariable


@dataclass
class MemoryLoad(ReportedPCAnnotation):
    slot: ReportedSymbolicVariable


@dataclass
class MemoryWrite(ReportedPCAnnotation):
    slot: ReportedSymbolicVariable
    value: ReportedSymbolicVariable


@dataclass
class Log(ReportedPCAnnotation):
    n: int
    topic0: ReportedSymbolicVariable
    topic1: ReportedSymbolicVariable
    topic2: ReportedSymbolicVariable
    topic3: ReportedSymbolicVariable
    data: ReportedSymbolicMemorySlice


@dataclass
class Return(ReportedPCAnnotation):
    data: ReportedSymbolicMemorySlice


@dataclass
class Revert(ReportedPCAnnotation):
    data: ReportedSymbolicMemorySlice


@dataclass
class Selfdestruct(ReportedPCAnnotation):
    address: ReportedSymbolicVariable


@dataclass
class Calldataload(ReportedPCAnnotation):
    offset: ReportedSymbolicVariable


@dataclass
class Calldatacopy(ReportedPCAnnotation):
    offset: ReportedSymbolicVariable
    mem_addr: ReportedSymbolicVariable
    length: ReportedSymbolicVariable


@dataclass
class UnconditionalJump(ReportedPCAnnotation):
    to: ReportedSymbolicVariable


@dataclass
class ConditionalJump(ReportedPCAnnotation):
    to: ReportedSymbolicVariable
    condition: object


@dataclass
class Push(ReportedPCAnnotation):
    value: int


@dataclass
class SenderConstraintFunction(ReportedPCAnnotation):
    address: ReportedSymbolicVariable
    condition: SymbolicExpression
    model: object
    is_storage_address: bool = True
    is_probably_mapping: bool = False
    true_branch_reachable: bool = False
    false_branch_reachable: bool = False


@dataclass
class ReportedSymbolicExecSummary():
    functions: list[FunctionSummary]
    calls: list[Call]
    storage_reads: list[StorageLoad]
    storage_writes: list[StorageWrite]
    memory_reads: list[MemoryLoad]
    memory_writes: list[MemoryWrite]
    logs: list[Log]
    returns: list[Return]
    reverts: list[Revert]
    calldataloads: list[Calldataload]
    calldatacopies: list[Calldatacopy]
    selfdestructs: list[Selfdestruct]
    conditional_jumps: list[ConditionalJump]
    unconditional_jumps: list[UnconditionalJump]
    pushes: list[Push]
    creates: list[Push]
    create2s: list[Push]
    sender_constraint_functions: list[SenderConstraintFunction]
    unique_instructions_visited: int
