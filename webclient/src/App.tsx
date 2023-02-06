import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Information from './Address/Information/Information';
import Source from './Address/Source';
import Disassembly from './Address/Disassembly/Disassembly';
import Address from './Address/Address';
import { theme } from './themes/theme';
import { ThemeProvider } from '@mui/material/styles';
import { SelectContext, SettingsContext } from './Context';
import { useState } from 'react';
import Tasks from './Tasks/Tasks';
import { Settings } from './types/types';

export const defaultSettings: Settings = {
  etherscan: undefined,
  rpc: undefined,
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

function App() {
  const [select, setSelect] = useState(false);
  const selectValue = { select, setSelect };

  const [settings, setSettings] = useState(defaultSettings);
  const settingsValue = { settings, setSettings };

  return (
    <SelectContext.Provider value={selectValue}>
      <SettingsContext.Provider value={settingsValue}>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/address/:address" element={<Address />}>
              <Route path={'disassembly'} element={<Disassembly />}></Route>
              <Route path={'source'} element={<Source />}></Route>
              <Route path={'information'} element={<Information />}></Route>
            </Route>

            <Route path={'tasks'} element={<Tasks />} />

            <Route
              path="*"
              element={
                <main style={{ padding: '1rem' }}>
                  <p>Page not found :/</p>
                </main>
              }
            />
          </Routes>
        </ThemeProvider>
      </SettingsContext.Provider>
    </SelectContext.Provider>
  );
}

export default App;
