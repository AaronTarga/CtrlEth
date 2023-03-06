import { useContext, useState } from 'react';
import ContractInput from '../Components/ContracInput';
import styled from '@emotion/styled';
import { AutocompleteChangeDetails, AutocompleteChangeReason, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { SettingsDialog } from '../Components/Dialogs/SettingsDialog';
import { SettingsContext } from '../Context';
import { Settings } from '../types/types';

const Title = styled.h1`
  text-transform: uppercase;
  text-align: center;
  font-size: 4em;
  font-weight: 100;
  font-family: 'Roboto';
`;

const Centered = styled.div`
  width: 500px;
  left: 50%;
  position: absolute;
  top: 60%;
  transform: translate(-50%, -100%);
`;

const StyledPaper = styled(Paper)`
  display: flex;
  align-items: center;
`;

const StyledSearchIcon = styled(SearchIcon)`
  margin: 0 0.4em;
`;

const StyledContractInput = styled(ContractInput)`
  padding: 0.5em 0;
`;

const StyledButton = styled(Button)`
  margin-top: 2em;
  align-items: center;
  width: 100%;
`;

export default function Home() {
  const [addressInput, setAddressInput] = useState<string>();
  const [openSettings, setOpenSettings] = useState(false);
  const { setSettings } = useContext(SettingsContext);

  const navigate = useNavigate();

  const onChange = (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    if (value !== undefined) {
      setAddressInput(value as string);
      navigate(`/address/${value}`);
    }
  };

  const gotoTasks = () => {
    navigate('/tasks');
  };

  const configureSettings = () => {
    setOpenSettings(true);
  };

  const closeSettings = () => {
    setOpenSettings(false);
  };

  const saveSettings = (settings: Settings) => {
    setOpenSettings(false);
    setSettings(settings);
    localStorage.setItem('settings', JSON.stringify(settings));
  };

  return (
    <Centered>
      <Title>CtrlEth</Title>
      <StyledPaper elevation={6}>
        <StyledSearchIcon />
        <StyledContractInput id="search-input" addressInput={addressInput} onChange={onChange} />
      </StyledPaper>
      <StyledButton color="primary" variant="contained" onClick={configureSettings}>
        Change Settings
      </StyledButton>
      <StyledButton color="primary" variant="contained" onClick={gotoTasks}>
        View Tasks
      </StyledButton>
      <SettingsDialog open={openSettings} onClose={closeSettings} onSave={saveSettings} />
    </Centered>
  );
}

