import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import { SettingsContext } from '../../Context';
import { DialogActions, DialogContent, IconButton, Link, TextField, Tooltip, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { Settings } from '../../types/types';
import Stack from '@mui/material/Stack';
import { retrieveSettings } from '../../lib/settings';
import styled from '@emotion/styled';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

const StretchedTextfield = styled(TextField)`
  flex-grow: 1;
`;
const InfoText = styled.p`
  font-size: 1.5em;
  text-align: center;
`;

export function SettingsDialog(props: DialogProps) {
  const { open, onClose, onSave } = props;
  const { settings, setSettings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);

  const reset = () => {
    localStorage.removeItem('settings');
    setSettings(retrieveSettings());
    setLocalSettings(retrieveSettings());
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{ width: '400px' }}>
        <Stack spacing={2} sx={{ mt: '2em' }}>
          <Typography>
           Credentials
          </Typography>
          <Stack direction="row">
            <StretchedTextfield
              id="secret"
              label="Create Secret"
              type="text"
              value={localSettings.secret}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setLocalSettings({ ...localSettings, secret: event.target.value });
              }}
            />
            <Tooltip title={<InfoText>Authentication Key required to be able to start own disassembly tasks</InfoText>}>
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row">
            <StretchedTextfield
              id="etherscan"
              label="Etherscan Token"
              type="text"
              value={localSettings.etherscan}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => {
                setLocalSettings({ ...localSettings, etherscan: event.target.value });
              }}
            />
            <Tooltip
              title={
                <InfoText>
                  Token required to use the{' '}
                  <Link href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer">
                    Etherscan API
                  </Link>
                </InfoText>
              }
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row">
            <StretchedTextfield
              id="rpc"
              label="RPC URL"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              value={localSettings.rpc}
              onChange={(event) => {
                setLocalSettings({ ...localSettings, rpc: event.target.value });
              }}
            />
            <Tooltip
              title={
                <InfoText>
                  <Link
                    href="https://ethereum.org/en/developers/docs/apis/json-rpc/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ethereum Json Rpc URL{' '}
                  </Link>
                  required to load data from chain. Providers like{' '}
                  <Link href="https://www.infura.io/pricing" target="_blank" rel="noopener noreferrer">
                    Infura
                  </Link>{' '}
                  offer free RPC endpoints.
                </InfoText>
              }
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography>
            Mythril Parameters
          </Typography>
          <StretchedTextfield
            id="execution-timeout"
            label="Execution Timeout"
            type="number"
            value={localSettings.mythril.executionTimeout}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, executionTimeout: event.target.value },
              });
            }}
          />
          <StretchedTextfield
            id="create-timeout"
            label="Create Timeout"
            type="number"
            value={localSettings.mythril.createTimeout}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, createTimeout: event.target.value },
              });
            }}
          />
          <StretchedTextfield
            id="max-depth"
            label="Max Depth"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={localSettings.mythril.maxDepth}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, maxDepth: event.target.value },
              });
            }}
          />
          <StretchedTextfield
            id="solver-timeout"
            label="Solver Timeout"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={localSettings.mythril.solverTimeout}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, solverTimeout: event.target.value },
              });
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ margin: '0 auto' }}>
        <Button color="success" variant="outlined" onClick={() => onSave(localSettings)}>
          Save
        </Button>
        <Button variant="outlined" onClick={reset}>
          Reset
        </Button>
        <Button color="error" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

