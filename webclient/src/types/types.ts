import Selfdestruct from '../assets/icons/eraser-solid.svg';
import Revert from '../assets/icons/backward-solid.svg';
import Return from '../assets/icons/arrow-up-from-bracket-solid.svg';
import Log from '../assets/icons/file-lines-regular.svg';
import Call from '../assets/icons/terminal-solid.svg';
import Push from '../assets/icons/arrows-down-to-line-solid.svg';
import MemoryWrite from '../assets/icons/floppy-disk-solid.svg';
import MemoryRead from '../assets/icons/floppy-disk-regular.svg';
import StorageWrite from '../assets/icons/hard-drive-solid.svg';
import StorageRead from '../assets/icons/hard-drive-regular.svg';
import DataLoad from '../assets/icons/rotate-solid.svg';
import DataCopy from '../assets/icons/clone-regular.svg';
import Default from '../assets/icons/circle-regular.svg';
import Creates from '../assets/icons/plus-solid.svg';
import { Block, FunctionOverview } from './assembly';

export interface StringDict {
  [key: string]: string;
}

export type TypedDict<T extends string> = { [key in T]: string };

export enum NodeType {
  selfdestructs = 'selfdestructs',
  revert = 'revert',
  returns = 'returns',
  calls = 'calls',
  creates = 'creates',
  storageReads = 'storageReads',
  storageWrites = 'storageWrites',
  memoryReads = 'memoryReads',
  memoryWrites = 'memoryWrites',
  push = 'push',
  logs = 'logs',
  calldataloads = 'calldataloads',
  calldatacopies = 'calldatacopies',
  default = 'default',
}

export const iconImages: TypedDict<NodeType> = {
  [NodeType.selfdestructs]: Selfdestruct,
  [NodeType.revert]: Revert,
  [NodeType.returns]: Return,
  [NodeType.calls]: Call,
  [NodeType.storageReads]: StorageRead,
  [NodeType.storageWrites]: StorageWrite,
  [NodeType.memoryReads]: MemoryRead,
  [NodeType.memoryWrites]: MemoryWrite,
  [NodeType.push]: Push,
  [NodeType.logs]: Log,
  [NodeType.creates]: Creates,
  [NodeType.calldataloads]: DataLoad,
  [NodeType.calldatacopies]: DataCopy,
  [NodeType.default]: Default,
};

export const edgeColors: StringDict = {
  trueCondition: '#227834',
  falseCondition: '#b01515',
};

export const edgeNames: StringDict = {
  trueCondition: 'True Jump',
  falseCondition: 'False Jump',
};

export type NodeLink = {
  id: string;
  source: string;
  target: string;
  condition?: boolean;
};

export type GraphNode = {
  id: number;
  data: string;
  icon: string;
  function: string;
  type: NodeType;
  types: Array<NodeType>;
};

export type GraphLibNode = {
  id: number;
  data: string;
  icon: string;
  function: string;
  types: Array<string>;
};

export type FunctionDict = { [key: string]: { name: string; color: string } };

export type ApiResult<T> = {
  data: T;
  error: number | null;
};

export type TaskError = {
  task_error: {
    message: string;
    status: number;
  };
};

export type DisassemblyState = {
  state: number;
};

export function isTaskError(result: TaskError | any): result is TaskError {
  return result && result['task_error'];
}

export function isDisassemblyState(result: DisassemblyState | any): result is DisassemblyState {
  return result && result['state'];
}

export type Transaction = {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  input: string;
  value: number;
  gasPrice: number;
  fee: number;
  gasUsed: number;
  timeStamp: number;
  functionName: string;
  functionArguments: object;
};

export type ContractEvent = {
  signature: string;
  unindexedValues: Array<StringDict>;
  indexedValues: Array<StringDict>;
  transactionHash: string;
  timestamp: string;
};

export type BasicContract = {
  type: 'external' | 'contract';
  balance: number;
  creationDate: string;
  creator: string;
  name: string;
  creationTransaction: {
    hash: string;
    blockHash: string;
    blockNumber: string;
  };
};

export type ContractTransactions = {
  internalTransactions: Array<Transaction>;
  normalTransactions: Array<Transaction>;
};

export type ContractEvents = {
  events: Array<ContractEvent>;
};

export type GraphFilter = {
  type: string | null;
  function: string | null;
};

export type FunctionFilter = {
  name: string;
  types: Array<string>;
};

export type DisassemblyResponse = {
  blocks: Array<Block>;
  links: Array<any>;
  functions: Array<FunctionOverview>;
  coverage: any;
};

export type TaskResponse = {
  tasks: Array<Task>;
}

export type Task = {
  contract: string,
  args: object,
  timestamp: string,
  type: string,
  id: string,
  status: "active" | "waiting",
};

export type Settings = {
  etherscan: string | undefined,
  rpc: string | undefined,
  mythril: {
    executionTimeout: number,
    createTimeout: number,
    maxDepth: number,
    solverTimeout: number
  }
}

export type SourceCode = {
  source_code: string;
  source_abi: any;
  source_metadata: any;
  events: Array<string>;
  functions: Array<string>;
};
