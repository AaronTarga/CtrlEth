import {
  ApiResult,
  BasicContract,
  ContractEvents,
  ContractList,
  ContractTransactions,
  DisassemblyResponse,
  DisassemblyState,
  Settings,
  SourceCode,
  TaskResponse,
} from '../types/types';

export type TaskState = {
  task_id: string;
  task_result: any;
  task_status: string;
};
export class ApiController {
  private endpoint = process.env.REACT_APP_BACKEND_URL;

  private handleError(error: Error): number {
    if (error.name === 'AbortError') {
      console.log('Request aborted!');
      return 299;
    } else {
      console.error(error);
    }
    return 500;
  }

  private async handleResponse(url: string, signal: AbortSignal, body?: object): Promise<any> {
    try {
      let response = await fetch(this.endpoint + url, { signal });

      if (!response.ok) {
        return { data: null, error: response.status };
      }

      return { data: await response.json(), error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error as Error) };
    }
  }

  async getAddressSource(address: string, signal: AbortSignal): Promise<ApiResult<SourceCode>> {
    return this.handleResponse('/source/' + address, signal);
  }

  async getAddressDisassembly(
    address: string,
    signal: AbortSignal,
    args: Settings
  ): Promise<ApiResult<DisassemblyState>> {
    let queryString = "?";
    queryString += `etherscan=${args.etherscan}`
    queryString += `&rpc=${args.rpc}`
    queryString += `&execution_timeout=${args.mythril.executionTimeout}`
    queryString += `&create_timeout=${args.mythril.createTimeout}`
    queryString += `&max_depth=${args.mythril.maxDepth}`
    queryString += `&solver_timeout=${args.mythril.solverTimeout}`
    return this.handleResponse('/disassembly/' + address + queryString, signal, args);
  }
  async getBasicInformation(address: string, signal: AbortSignal): Promise<ApiResult<BasicContract>> {
    return this.handleResponse('/information/basic/' + address, signal);
  }

  async getContractEvents(address: string, signal: AbortSignal): Promise<ApiResult<ContractEvents>> {
    return this.handleResponse('/information/events/' + address, signal);
  }
  async getContractTransactions(address: string, signal: AbortSignal): Promise<ApiResult<ContractTransactions>> {
    return this.handleResponse('/information/transactions/' + address, signal);
  }

  async getContracts( signal: AbortSignal): Promise<ApiResult<ContractList>> {
    return this.handleResponse('/contracts' , signal);
  }

  async getCachedDisassembly(
    address: string,
    signal: AbortSignal
  ): Promise<ApiResult<DisassemblyResponse | DisassemblyState>> {
    return this.handleResponse('/disassembly/load/' + address, signal);
  }

  async getActiveTasks(signal: AbortSignal): Promise<ApiResult<TaskResponse>> {
    return this.handleResponse('/tasks', signal);
  }
}

export function mapStatusToMessage(status: Number): string {
  if (status === 404) {
    return 'Could not find the specified input!';
  }
  if (status === 400) {
    return 'Invalid Input given!';
  }

  return 'Unknwon server error';
}

