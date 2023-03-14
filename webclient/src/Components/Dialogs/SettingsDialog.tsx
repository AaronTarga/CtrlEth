import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { SettingsContext } from '../../Context';
import { DialogActions, DialogContent, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { Settings } from '../../types/types';
import Stack from '@mui/material/Stack';
import { retrieveSettings } from '../../lib/settings';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}




export function SettingsDialog(props: DialogProps) {
  const { open, onClose, onSave } = props;
  const { settings,setSettings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);

  const reset = () => {
    localStorage.removeItem("settings");
    setSettings(retrieveSettings());
    setLocalSettings(retrieveSettings())
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: '2em' }}>
        <TextField
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
          <TextField
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
          <TextField
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
          <TextField
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
          <TextField
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
          <TextField
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
          <TextField
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
