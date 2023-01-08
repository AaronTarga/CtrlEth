export type SymbolicVariable = {
    var: string,
    symbolic?: boolean
}

export type SymbolicMemorySlice = {
    condition: string
}

export type Instructions = {
    instruction: any,
    annotations: Array<any>
}

export type Block = {
    i: number;
    instructions: Array<any>
    next: number;
    type: string;
    types: Array<string>;
    function: string;
}


export type AnnotatedInstruction = {
    annotations: Array<BaseAnnotation>
    instruction: {
        _description: string;
        _fee: number;
        _name: string;
        _opcode: number;
        _operand: number;
        _operand_size: number;
        _pc: number;
        _pops: number;
        _pushes: number;
    }
}


export type BaseAnnotation = {
    "_class": string,
    data: {
    }
}

export type Annotation = {
    header: {
        pc: number;
        name: string;
    },
    annotations: Array<BaseAnnotation>;
}


export interface ReachAnnotation extends BaseAnnotation {
    data: {
        "reaches": any
    }
}

export interface CodeAnnotation extends BaseAnnotation {
    data: {
        tags: object
    }
}


export interface PCAnnotation extends CodeAnnotation {
    data: CodeAnnotation['data'] & {
        pc: number
    }

}

export interface JumpTarget extends CodeAnnotation {
    data: CodeAnnotation['data'] & {
        target: number;
    }
}


export interface ConstantSummary extends CodeAnnotation {
    data: CodeAnnotation['data'] & {
        length: number,
        value: number,
        introduced_at: Array<number>
    }
}

export interface MetaDataString extends CodeAnnotation {
    data: CodeAnnotation['data'] & {
        raw: object,
        index: number,
        data: object,
        url: string,
    }
}

export interface FunctionEntrypoint extends CodeAnnotation {
    data: CodeAnnotation['data'] & {
        function_name: string;
    }
}

export interface FunctionSummary {
    name: string
    pcs: Array<Number>
    has_writes?: boolean
    has_reads?: boolean
    has_logs?: boolean
    has_calls?: boolean
    has_delegate?: boolean
    has_creates?: boolean
    has_create2s?: boolean
    has_selfdestructs?: boolean
}

export interface EntryPoint {
    functionName: string
    block: number
}

export interface FunctionOverview {
    entrypoint: EntryPoint,
    function: FunctionSummary
}

export interface Call extends PCAnnotation {
    data: PCAnnotation['data'] & {
        to: SymbolicVariable
        gas: SymbolicVariable
        type: SymbolicVariable
        value: SymbolicVariable
        data: SymbolicVariable
    }
}

export interface StorageLoad extends PCAnnotation {
    data: PCAnnotation['data'] & {
        slot: SymbolicVariable
        concreteValue?: string,
        concreteValueText?: string
    }
}

export interface StorageWrite extends PCAnnotation {
    data: PCAnnotation['data'] & {
        slot: SymbolicVariable
        value: SymbolicVariable
    }
}

export interface MemoryLoad extends PCAnnotation {
    data: PCAnnotation['data'] & {
        slot: SymbolicVariable
    }
}

export interface MemoryWrite extends PCAnnotation {
    data: PCAnnotation['data'] & {
        slot: SymbolicVariable
        value: SymbolicVariable
    }
}

export interface Log extends PCAnnotation {
    data: PCAnnotation['data'] & {
        n: number
        topic0: SymbolicVariable
        topic1: SymbolicVariable
        topic2: SymbolicVariable
        topic3: SymbolicVariable
        data: SymbolicMemorySlice
        name: string

    }
}

export interface Return extends PCAnnotation {
    data: PCAnnotation['data'] & {
        data: SymbolicVariable
    }
}

export interface Revert extends PCAnnotation {
    data: PCAnnotation['data'] & {
        data: SymbolicVariable
    }
}

export interface Selfdestruct extends PCAnnotation {
    data: PCAnnotation['data'] & {
        address: SymbolicVariable
    }
}

export interface Calldataload extends PCAnnotation {
    data: PCAnnotation['data'] & {
        offset: SymbolicVariable
    }
}

export interface Calldatacopy extends PCAnnotation {
    data: PCAnnotation['data'] & {
        offset: SymbolicVariable
        mem_addr: SymbolicVariable
        length: SymbolicVariable
    }
}

export interface UnconditionalJump extends PCAnnotation {
    data: PCAnnotation['data'] & {
        to: SymbolicVariable
    }
}

export interface ConditionalJump extends PCAnnotation {
    data: PCAnnotation['data'] & {
        to: SymbolicVariable
        condition: object
    }
}

export interface Push extends PCAnnotation {
    data: PCAnnotation['data'] & {
        value: Number
    }
}

export interface SenderConstraintFunction extends PCAnnotation {
    data: PCAnnotation['data'] & {
        address: SymbolicVariable
        condition: SymbolicMemorySlice
        model: object
        is_storage_address: boolean
        is_probably_mapping: boolean
        true_branch_reachable: boolean
        false_branch_reachable: boolean
    }
}

export type SymbolicExecSummary = {
    functions: Array<FunctionSummary>
    calls: Array<Call>
    storageReads: Array<StorageLoad>
    storageWrites: Array<StorageWrite>
    memoryReads: Array<MemoryLoad>
    memoryWrites: Array<MemoryWrite>
    logs: Array<Log>
    returns: Array<Return>
    reverts: Array<Revert>
    calldataloads: Array<Calldataload>
    calldatacopies: Array<Calldatacopy>
    selfdestructs: Array<Selfdestruct>
    conditional_jumps: Array<ConditionalJump>
    unconditional_jumps: Array<UnconditionalJump>
    pushes: Array<Push>
    creates: Array<Push>
    create2s: Array<Push>
    sender_constranumber_functions: Array<SenderConstraintFunction>
    unique_instructions_visited: number
}