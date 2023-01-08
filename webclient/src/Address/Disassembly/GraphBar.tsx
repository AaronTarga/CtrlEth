import styled from '@emotion/styled';
import { TextField, Button, InputLabel } from '@mui/material';
import { useState } from 'react';
import { Core } from 'cytoscape';

const Bar = styled.div`
  position: absolute;
  top: 1em;
  left: 1em;
  text-align: left;
  align-items: center;
  display: flex;
  width: 200px;
  height: 50px;
  background-color: #000;
  z-index: 1;
`;

export type GraphBarProps = {
  container: Core;
  setBlockId: React.Dispatch<React.SetStateAction<string | undefined>>;
  closeAlert: () => void;
  setAlertShown: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function GraphBar({ container, setBlockId, closeAlert, setAlertShown }: GraphBarProps) {
  const [nodeId, setNodeId] = useState<string>();
  const focusNode = (id: string) => {
    const position = container.getElementById(id).position();
    const node = container.$(`#${id}`);
    if (node.length !== 0 && position !== undefined) {
      container.center(node);
      container.zoom({
        level: 1.5,
        position: position,
      });
      node.select();
      setBlockId(id);
    } else {
      setAlertShown(true);
    }
  };

  const handleEnter = (event: any) => {
    if (event.keyCode === 13) {
      if (nodeId !== undefined) focusNode(nodeId);
    }
  };

  return (
    <Bar>
      <InputLabel sx={{ color: 'white', pl: '0.5em' }}>Node</InputLabel>
      <TextField
        onChange={(event: any) => setNodeId(event.target.value)}
        onKeyDown={handleEnter}
        hiddenLabel
        variant="standard"
        size="small"
        type="number"
        InputProps={{
          inputProps: {
            min: 0,
          },
        }}
        InputLabelProps={{ shrink: true }}
        sx={{ width: '50px', px: '0.5em', mx: '0.5em', backgroundColor: 'white' }}
      />
      <Button
        onClick={() => {
          if (nodeId !== undefined) focusNode(nodeId);
        }}
        variant="contained"
        disableElevation
        color="secondary"
        size="small"
      >
        Go
      </Button>
    </Bar>
  );
}
