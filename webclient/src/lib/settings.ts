import { Settings } from '../types/types';

export const retrieveSettings = (): Settings => {
    const storageValue = localStorage.getItem("settings");
    if ( storageValue !== null) {
        return JSON.parse(storageValue) as Settings
    } else {
        return defaultSettings;
    }
}

const defaultSettings: Settings = {
    etherscan: "",
    rpc: "",
    mythril: {
      executionTimeout: Number.isInteger(Number(process.env.REACT_APP_MYTHRIL_EXECUTION_TIMEOUT))
        ? Number(process.env.REACT_APP_MYTHRIL_EXECUTION_TIMEOUT)
        : 1000,
      createTimeout: Number.isInteger(Number(process.env.REACT_APP_MYTHRIL_CREATE_TIMEOUT))
        ? Number(process.env.REACT_APP_MYTHRIL_CREATE_TIMEOUT)
        : 60,
      maxDepth: Number.isInteger(Number(process.env.REACT_APP_MYTHRIL_MAX_DEPTH))
        ? Number(process.env.REACT_APP_MYTHRIL_MAX_DEPTH)
        : 128,
      solverTimeout: Number.isInteger(Number(process.env.REACT_APP_MYTHRIL_SOLVER_TIMEOUT))
        ? Number(process.env.REACT_APP_MYTHRIL_SOLVER_TIMEOUT)
        : 10000,
    },
  };