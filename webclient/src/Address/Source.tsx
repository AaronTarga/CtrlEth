import { ApiController, mapStatusToMessage } from '../lib/api';
import { useEffect, useState } from 'react';
import Code from '../Components/Code';
import { CenterDiv, ErrorText } from '../Components/Layout';
import { useAddress } from './Address';
import { ApiResult, SourceCode } from '../types/types';
import { CircularProgress, Stack } from '@mui/material';
import { AbiDialog } from '../Components/Dialogs/AbiDialog';
import Button from '@mui/material/Button';

export default function Source() {
  const { address } = useAddress();
  const [currentAddress, setCurrentAddress] = useState<string | null>();
  const [error, setError] = useState<any>();
  const [addressSource, setAddressSource] = useState<SourceCode>();
  const [loading, setLoading] = useState(false);
  const [functionOpen, setFunctionOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  const handleFunctionOpen = () => {
    setFunctionOpen(true);
  };

  const handleFunctionClose = () => {
    setFunctionOpen(false);
  };

  const handleEventOpen = () => {
    setEventOpen(true);
  };

  const handleEventClose = () => {
    setEventOpen(false);
  };


  useEffect(() => {
    setCurrentAddress(address);
  }, [address]);

  useEffect(() => {
    if (!currentAddress) {
      return;
    }
    const apiController = new ApiController();
    let controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);

    apiController.getAddressSource(currentAddress, signal).then((response: ApiResult<SourceCode>) => {
      if (response.data !== null) {
          setAddressSource(response.data);
          setLoading(false);
          setError(response.error)
      } else {
        setError(response.error);
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [currentAddress]);

  var content = undefined;
  if (loading) {
    content = <CircularProgress color="secondary" sx={{ mt: '2em' }} />;
  } else if (!error && addressSource && addressSource['source_code'] != null) {
    content = <>
      <br />
      <Stack alignItems="center" justifyContent="center" direction="row" spacing={4}>
        <Button variant="contained" color='secondary' onClick={handleFunctionOpen} disabled={addressSource.functions.length === 0}>
          See functions
        </Button>
        <AbiDialog
          open={functionOpen}
          title="Function Abi"
          items={addressSource.functions}
          onClose={handleFunctionClose}
        />
        <Button variant="contained" color="secondary" onClick={handleEventOpen} disabled={addressSource.events.length === 0}>
          See Events
        </Button>
      </Stack>
      <AbiDialog
        open={eventOpen}
        title="Event Abi"
        items={addressSource.events}
        onClose={handleEventClose}
        
      />
      <br/>
      <Code code={addressSource.source_code} language="solidity" />
    </>;
  } else if (typeof error === 'string' && error.toLowerCase().includes('error')) {
    content = <ErrorText>{error}</ErrorText>;
  } else if (error && !isNaN(error)) {
    content = <ErrorText>{mapStatusToMessage(error)}</ErrorText>
  }

  return (
    <>
      <CenterDiv>{content}</CenterDiv>
    </>
  );
}
