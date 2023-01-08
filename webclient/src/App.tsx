import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Information from './Address/Information/Information';
import Source from './Address/Source';
import Disassembly from './Address/Disassembly/Disassembly';
import Address from './Address/Address';
import { theme } from './themes/theme';
import { ThemeProvider } from '@mui/material/styles';
import { SelectContext } from './Context';
import { useState } from 'react';

function App() {
  const [select, setSelect] = useState(false);
  const selectValue = { select, setSelect };

  return (
    <SelectContext.Provider value={selectValue}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/address/:address" element={<Address />}>
            <Route path={'disassembly'} element={<Disassembly />}></Route>
            <Route path={'source'} element={<Source />}></Route>
            <Route path={'information'} element={<Information />}></Route>
          </Route>

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
    </SelectContext.Provider>
  );
}

export default App;
