import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { SettingsContext } from '../Context';
import { DialogActions, DialogContent, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { Settings } from '../types/types';
import Stack from '@mui/material/Stack';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export function SettingsDialog(props: DialogProps) {
  const { open, onClose, onSave } = props;
  const { settings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <Dialog open={open}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: '2em' }}>
          <TextField
            id="etherscan"
            label="Etherscan Token"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({ ...localSettings, etherscan: event.target.value });
            }}
            defaultValue={settings.etherscan}
          />
          <TextField
            id="rpc"
            label="RPC URL"
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({ ...localSettings, rpc: event.target.value });
            }}
            defaultValue={settings.rpc}
          />
          <TextField
            id="execution-timeout"
            label="Execution Timeout"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, executionTimeout: event.target.value },
              });
            }}
            defaultValue={settings.mythril.executionTimeout}
          />
          <TextField
            id="create-timeout"
            label="Create Timeout"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, createTimeout: event.target.value },
              });
            }}
            defaultValue={settings.mythril.createTimeout}
          />
          <TextField
            id="max-depth"
            label="Max Depth"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            defaultValue={settings.mythril.maxDepth}
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
            onChange={(event) => {
              setLocalSettings({
                ...localSettings,
                mythril: { ...localSettings.mythril, solverTimeout: event.target.value },
              });
            }}
            defaultValue={settings.mythril.solverTimeout}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ margin: '0 auto' }}>
        <Button color="success" variant="outlined" onClick={() => onSave(localSettings)}>
          Save
        </Button>
        <Button color="error" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
