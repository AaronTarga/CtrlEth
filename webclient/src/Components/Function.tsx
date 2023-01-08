import Popover from '@mui/material/Popover';
import { useState } from 'react';

export type FunctionProps = {
  shortFunction: string;
  fullFunction: string;
  title?: boolean;
};

export default function Function({ shortFunction, fullFunction, title = false }: FunctionProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const showFullFunction = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatFullFunction = (fullFunction: string) => fullFunction.split(' or ').join('\r\n');

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <p style={{ whiteSpace: 'pre', margin: '0.5em' }}>{formatFullFunction(fullFunction)}</p>
      </Popover>
      {title && (
        <h2 onClick={showFullFunction} style={{ textDecoration: 'underline', color: '#0000EE' }}>
          {shortFunction}
        </h2>
      )}
      {!title && (
        <p onClick={showFullFunction} style={{ textDecoration: 'underline', color: '#0000EE' }}>
          {shortFunction}
        </p>
      )}
    </>
  );
}
