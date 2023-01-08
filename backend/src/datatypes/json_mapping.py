from ethpector.data.datatypes import AssemblySummary, ConstantSummary, FunctionEntrypoint, JumpTarget, MetaDataString
from ethpector.assembly.program import Instruction
import pyevmasm as EVMAsm

from datatypes.data import ReportedSymbolicVariable, ReportedSymbolicExpression, ReportedSymbolicMemorySlice, ReportedBasicBlocks, ReportedSymbolicExecSummary, FunctionSummary, Call, StorageLoad, StorageWrite, MemoryLoad, MemoryWrite, Log, Return, Revert, Calldataload, Calldatacopy, Selfdestruct, ConditionalJump, UnconditionalJump, Push, SenderConstraintFunction

# https://github.com/uibk-ethpector/ethpector/blob/570537b28bdd3df99720f8880f0ff6d66244291e/src/ethpector/data/datatypes.py#L1023


def json_to_assembly(json_string):
    constants = json_string['constants']
    constant_summary = [ConstantSummary(
        constant['length'], constant['value'], constant['introduced_at']) for constant in constants]
    function_entrypoints = json_string['function_entrypoints']
    function_entrypoint_list = [FunctionEntrypoint(pc=int(
        entrypoint['pc']), function_name=entrypoint['function_name']) for entrypoint in function_entrypoints]
    jump_targets = [JumpTarget(target['pc'], target['target'])
                    for target in json_string['jump_targets']]
    jumps = json_string['jumps']
    jumpdests = json_string['jumpdests']
    meta_data = json_string['meta_data']
    meta_data_string = MetaDataString(
        raw=meta_data['raw'], index=meta_data['index'], data=meta_data['data'], url=meta_data['url'])
    unique_instructions_visited = json_string['unique_instructions_visited']
    total_instructions = json_string['total_instructions']

    return AssemblySummary(constants=constant_summary, function_entrypoints=function_entrypoint_list, jump_targets=jump_targets,
                           jumps=jumps, jumpdests=jumpdests, meta_data=meta_data_string, unique_instructions_visited=unique_instructions_visited,
                           total_instructions=total_instructions)


def json_to_symbolic_memory(json_memory):
    return ReportedSymbolicMemorySlice(value=json_memory)


def json_to_symbolic_expression(json_expression):
    return ReportedSymbolicExpression(condition=json_expression)


def json_to_symbolic_variable(json_expression):
    if type(json_expression) == str and not json_expression.startswith("s("):
        try:
            return ReportedSymbolicVariable(int(json_expression, base=0))
        except ValueError:
            # TODO: parse expression conditions
            return ReportedSymbolicVariable(json_expression, symbolic=True)
    return ReportedSymbolicVariable(json_expression)

# https://github.com/uibk-ethpector/ethpector/blob/570537b28bdd3df99720f8880f0ff6d66244291e/src/ethpector/data/datatypes.py#L1075
def json_to_instruction(json_string):
    instruction = json_string['instruction']
    instruction_object = Instruction(EVMAsm.Instruction(opcode=instruction['_opcode'], name=instruction['_name'], operand_size=instruction['_operand_size'],
                                                        pops=instruction['_pops'], pushes=instruction['_pushes'], fee=instruction[
        '_fee'], description=instruction['_description'],
        operand=instruction['_operand'] if '_operand' in instruction else None, pc=instruction['_pc']))

    instruction_object.annotations = json_string['annotations']

    return instruction_object


def json_to_basic_blocks(json_string):
    return [json_to_basic_block(block) for block in json_string]


def json_to_basic_block(json_string):
    i = json_string['i']
    instructions = [json_to_instruction(instruction)
                    for instruction in json_string['instructions']]
    annotations = json_string['annotations']
    nextBlockIndex = json_string['nextBlockIndex'] if 'nextBlockIndex' in json_string else None

    return ReportedBasicBlocks(i=i, instructions=instructions, annotations=annotations, nextBlockIndex=nextBlockIndex)


def json_to_symbolic(json_string):

    functions = json_string['functions']
    function_summary = [FunctionSummary(tags=_function['tags'],
                                        name=_function['name'], pcs=_function['pcs'], has_writes=_function[
                                            'has_writes'], has_reads=_function['has_reads'], has_logs=_function['has_logs'],
                                        has_calls=_function['has_calls'], has_delegate=_function['has_delegate'], has_creates=_function['has_creates'], has_create2s=_function['has_create2s'], has_selfdestructs=_function['has_selfdestructs']) for _function in functions]
    calls = [Call(tags=call['tags'], pc=call['pc'], to=json_to_symbolic_variable(call['to']), type=json_to_symbolic_variable(call['type']), gas=json_to_symbolic_variable(call['gas']),
                  value=json_to_symbolic_variable(call['value']), data=json_to_symbolic_memory(call['data']))
             for call in json_string['calls']]
    storage_reads = [StorageLoad(tags=load['tags'], pc=load['pc'], slot=json_to_symbolic_variable(
        load['slot'])) for load in json_string['storage_reads']]
    storage_writes = [StorageWrite(tags=write['tags'], pc=write['pc'], slot=json_to_symbolic_variable(
        write['slot']), value=json_to_symbolic_variable(write['value'])) for write in json_string['storage_writes']]
    memory_reads = [MemoryLoad(tags=load['tags'], pc=load['pc'], slot=json_to_symbolic_variable(
        load['slot'])) for load in json_string['memory_reads']]
    memory_writes = [MemoryWrite(tags=write['tags'], pc=write['pc'], slot=json_to_symbolic_variable(
        write['slot']), value=json_to_symbolic_variable(write['value'])) for write in json_string['memory_writes']]
    logs = [Log(tags=log['tags'], pc=log['pc'], n=log['n'], topic0=json_to_symbolic_variable(log['topic0']), topic1=json_to_symbolic_variable(
        log['topic1']), topic2=json_to_symbolic_variable(log['topic2']), topic3=json_to_symbolic_variable(log['topic3']), data=json_to_symbolic_memory(log['data']) if 'data' in log else None) for log in json_string['logs']]
    returns = [Return(tags=_return['tags'], pc=_return['pc'], data=json_to_symbolic_memory(
        _return['data'])) for _return in json_string['returns']]
    reverts = [Revert(tags=revert['tags'], pc=revert['pc'], data=json_to_symbolic_memory(
        revert['data'])) for revert in json_string['reverts']]
    calldataloads = [Calldataload(tags=dataload['tags'], pc=dataload['pc'], offset=json_to_symbolic_variable(
        dataload['offset'])) for dataload in json_string['calldataloads']]
    calldatacopies = [Calldatacopy(tags=datacopy['tags'], pc=datacopy['pc'], offset=json_to_symbolic_variable(datacopy['offset']), mem_addr=json_to_symbolic_variable(
        datacopy['mem_addr']), length=json_to_symbolic_variable(datacopy['length'])) for datacopy in json_string['calldatacopies']]
    selfdestructs = [Selfdestruct(tags=selfdestruct['tags'], pc=selfdestruct['pc'], address=json_to_symbolic_variable(
        selfdestruct['address'])) for selfdestruct in json_string['selfdestructs']]
    conditional_jumps = [ConditionalJump(tags=jump['tags'], pc=jump['pc'], to=json_to_symbolic_variable(
        jump['to']), condition=jump['condition']) for jump in json_string['conditional_jumps']]
    unconditional_jumps = [UnconditionalJump(tags=jump['tags'], pc=jump['pc'], to=json_to_symbolic_variable(
        jump['to'])) for jump in json_string['unconditional_jumps']]
    pushes = [Push(tags=push['tags'], pc=push['pc'], value=push['value'])
              for push in json_string['pushes']]
    creates = [Push(tags=push['tags'], pc=push['pc'], value=push['value'])
               for push in json_string['creates']]
    create2s = [Push(tags=push['tags'], pc=push['pc'], value=push['value'])
                for push in json_string['create2s']]
    # maybe extend with optionals
    sender_constraint_functions = [SenderConstraintFunction(tags=constraint['tags'], pc=constraint['pc'], address=json_to_symbolic_variable(
        constraint['address']), condition=json_to_symbolic_expression(constraint['condition']), model=constraint['model'], true_branch_reachable=constraint['true_branch_reachable'],
        false_branch_reachable=constraint['false_branch_reachable'], is_storage_address=constraint['is_storage_address'], is_probably_mapping=constraint['is_probably_mapping']) for constraint in json_string['sender_constraint_functions']]
    unique_instructions_visited = json_string['unique_instructions_visited']

    return ReportedSymbolicExecSummary(functions=function_summary, calls=calls, storage_reads=storage_reads, storage_writes=storage_writes, memory_reads=memory_reads, memory_writes=memory_writes, logs=logs, returns=returns, reverts=reverts, calldataloads=calldataloads, calldatacopies=calldatacopies, selfdestructs=selfdestructs, conditional_jumps=conditional_jumps, unconditional_jumps=unconditional_jumps, pushes=pushes, create2s=create2s, creates=creates, sender_constraint_functions=sender_constraint_functions, unique_instructions_visited=unique_instructions_visited)
