import { ApiResult, BasicContract, ContractEvents, ContractTransactions, DisassemblyResponse, DisassemblyState, SourceCode } from "../types/types";

export type TaskState = {
  task_id: string;
  task_result: any;
  task_status: string;
}
export class ApiController {

  private endpoint = process.env.REACT_APP_BACKEND_URL

  private handleError(error: Error): number {

    if (error.message === 'AbortError') {
      console.log("Request has been cancelled!");
    } else {
      console.error(error);
    }
    return 500;

  }


  private async handleResponse(url: string, signal: AbortSignal): Promise<any> {
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
    return this.handleResponse("/source/" + address, signal);
  }

  async getAddressDisassembly(address: string, signal: AbortSignal): Promise<ApiResult<DisassemblyState>> {
    return this.handleResponse("/disassembly/" + address, signal);
  }
  async getBasicInformation(address: string, signal: AbortSignal): Promise<ApiResult<BasicContract>> {
    return this.handleResponse("/information/basic/" + address, signal);
  }

  async getContractEvents(address: string, signal: AbortSignal): Promise<ApiResult<ContractEvents>> {
    return this.handleResponse("/information/events/" + address, signal);
  }
  async getContractTransactions(address: string, signal: AbortSignal): Promise<ApiResult<ContractTransactions>> {
    return this.handleResponse("/information/transactions/" + address, signal);
  }

  async getCachedDisassembly(address: string, signal: AbortSignal): Promise<ApiResult<DisassemblyResponse | DisassemblyState>> {
    return this.handleResponse("/disassembly/load/" + address, signal);
  }
}

export function mapStatusToMessage(status: Number): string {
  if (status === 404) {
    return "Could not find the specified input!"
  }
  if (status === 400) {
    return "Invalid Input given!"
  }

  return "Unknwon server error"
}
