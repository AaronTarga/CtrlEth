import {
  ApiError,
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

export type QueryArgs = {
  param: string;
  value: string | undefined;
};

function argsToQuery(args: Array<QueryArgs>) {
  const querystring = args
    .map((arg: QueryArgs) => {
      if (arg.value) {
        return `${arg.param}=${arg.value}`;
      } else {
        return null;
      }
    })
    .filter((query) => query != null)
    .join('&');

  if (querystring) {
    return '?' + querystring;
  }

  return '';
}

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

  private async handleResponse(url: string, signal: AbortSignal, body?: object): Promise<ApiResult<any>> {
    try {
      let response = await fetch(this.endpoint + url, { signal });

      if (!response.ok) {
        let message = 0;
        let errrorResponse = await response.json();
        if ("type" in errrorResponse) {
          message = errrorResponse.type
        } else {
          message = parseInt(errrorResponse);
          if (isNaN(message)) {
            message = 0;
          }
        }
         
        return { data: null, error: { status: response.status, type: message } };
      }

      return { data: await response.json(), error: null };
    } catch (error) {
      return { data: null, error: { status: this.handleError(error as Error), type: 0 } };
    }
  }

  async getAddressSource(
    address: string,
    args: { rpc: string; etherscan: string },
    signal: AbortSignal
  ): Promise<ApiResult<SourceCode>> {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
    ]);
    return this.handleResponse('/source/' + address + queryString, signal);
  }

  async getAddressDisassembly(
    address: string,
    signal: AbortSignal,
    args: Settings
  ): Promise<ApiResult<DisassemblyState>> {
    const queryString = argsToQuery([
      { param: 'secret', value: args.secret },
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
      { param: 'execution_timeout', value: args.mythril.executionTimeout.toString() },
      { param: 'create_timeout', value: args.mythril.createTimeout.toString() },
      { param: 'max_depth', value: args.mythril.maxDepth.toString() },
      { param: 'solver_timeout', value: args.mythril.solverTimeout.toString() },
    ]);
    return this.handleResponse('/disassembly/' + address + queryString, signal, args);
  }
  async getBasicInformation(
    address: string,
    args: { rpc: string; etherscan: string },
    signal: AbortSignal
  ): Promise<ApiResult<BasicContract>> {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
    ]);
    return this.handleResponse('/information/basic/' + address + queryString, signal);
  }

  async getContractEvents(
    address: string,
    args: { rpc: string; etherscan: string },
    signal: AbortSignal
  ): Promise<ApiResult<ContractEvents>> {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
    ]);
    return this.handleResponse('/information/events/' + address + queryString, signal);
  }
  async getContractTransactions(
    address: string,
    args: { rpc: string; etherscan: string },
    signal: AbortSignal
  ): Promise<ApiResult<ContractTransactions>> {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
    ]);
    return this.handleResponse('/information/transactions/' + address + queryString, signal);
  }

  async getContracts(signal: AbortSignal): Promise<ApiResult<ContractList>> {
    return this.handleResponse('/contracts', signal);
  }

  async getCachedDisassembly(
    address: string,
    args: { rpc: string | undefined; etherscan: string | undefined },
    signal: AbortSignal
  ): Promise<ApiResult<DisassemblyResponse | DisassemblyState>> {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'etherscan', value: args.etherscan },
    ]);
    return this.handleResponse('/disassembly/load/' + address + queryString, signal);
  }

  async getActiveTasks(signal: AbortSignal): Promise<ApiResult<TaskResponse>> {
    return this.handleResponse('/tasks', signal);
  }

  async getStorageLookup(address: string, args: { rpc: string | undefined; slot: string }, signal: AbortSignal) {
    const queryString = argsToQuery([
      { param: 'rpc', value: args.rpc },
      { param: 'slot', value: args.slot },
    ]);
    return this.handleResponse(`/lookup/storage/${address}${queryString}`, signal);
  }

  async getEventLookup(address: string, signal: AbortSignal) {
    return this.handleResponse(`/lookup/event/${address}`, signal);
  }
}

export function mapStatusToMessage(error: ApiError): string {
  if (error.status === 404) {
    return 'Could not find the specified input!';
  }
  if (error.status === 400) {
    if (error.type === 0) {
      return "Missing credentials, check if correct data given in Settings!"
    } else if (error.type === 1) {
      return "Wrong address type, only contract addresses allowed!"
    } else if (error.type === 9) {
      return "Values missing in request!"
    } else if (error.type === 10) {
      return "Given value is invalid!"
    }
    return 'Invalid Input given!'
  }

  return 'Server failed to handle the request.';
}

