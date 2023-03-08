import {
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Typography,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { CenterDiv, ErrorText, OverflowDiv } from '../../Components/Layout';

import { ApiController, mapStatusToMessage } from '../../lib/api';
import { ApiResult, BasicContract } from '../../types/types';
import { useAddress } from '../Address';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Transactions from './Transactions';
import Events from './Events';
import { SettingsContext } from '../../Context';

export default function Information() {
  const { address } = useAddress();
  const [currentAddress, setCurrentAddress] = useState<string | null>();
  const [error, setError] = useState<any>();
  const [basicInformation, setBasicInformation] = useState<BasicContract>();
  const [loading, setLoading] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const { settings } = useContext(SettingsContext);

  const closeAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertShown(false);
  };

  const copyTextToClipBoard = (text: string) => {
    setAlertShown(true);
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    setCurrentAddress(address);
  }, [address]);

  useEffect(() => {
    if (!currentAddress) {
      return;
    }

    setLoading(true);
    const apiController = new ApiController();

    let controller = new AbortController();
    const signal = controller.signal;

    apiController
      .getBasicInformation(currentAddress, { rpc: settings.rpc, etherscan: settings.etherscan }, signal)
      .then((response: ApiResult<BasicContract>) => {
        if (response.data !== null) {
          setBasicInformation(response.data);
          setError(response.error);
          setLoading(false);
        } else if (response.error) {
          setLoading(false);
          setError(response.error);
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentAddress, settings.rpc, settings.etherscan]);

  var content;

  if (loading) {
    content = <CircularProgress color="secondary" sx={{ mt: '2em' }} />;
  } else if (address !== null && !error && basicInformation) {
    if (basicInformation.type === 'external') {
      content = (
        <Card sx={{ margin: '2em' }} color="primary" elevation={4}>
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              {address}
            </Typography>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold"> Balance: </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography> {`${Math.round(basicInformation.balance * 100000) / 100000} Eth`}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      );
    } else {
      content = (
        <OverflowDiv>
          <Card sx={{ margin: '2em' }} color="primary" elevation={4}>
            <CardContent>
              <Typography gutterBottom variant="h4" component="div">
                {basicInformation.name ? basicInformation.name : 'Unnamed Contract'}
              </Typography>
              <List>
                <ListItem>
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography fontWeight="bold"> Balance: </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography> {`${Math.round(basicInformation.balance * 100000) / 100000} Eth`}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography fontWeight="bold"> Contract creation address: </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Grid container>
                        <Grid item xs={11}>
                          <Typography noWrap> {basicInformation.creator}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton onClick={() => copyTextToClipBoard(basicInformation.creator)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography fontWeight="bold"> Contract creation transaction: </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Grid container>
                        <Grid item xs={11}>
                          <Typography noWrap> {basicInformation.creationTransaction.hash}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton onClick={() => copyTextToClipBoard(basicInformation.creationTransaction.hash)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography fontWeight="bold"> Contract creation date: </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography> {basicInformation.creationDate}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </CardContent>
          </Card>
          <Transactions address={address} setAlertShown={setAlertShown} closeAlert={closeAlert}></Transactions>
          <Events address={address} setAlertShown={setAlertShown} closeAlert={closeAlert}></Events>
          <Snackbar open={alertShown} autoHideDuration={6000} onClose={closeAlert}>
            <Alert onClose={closeAlert} severity="success" sx={{ width: '100%' }}>
              Copied address to clipboard!
            </Alert>
          </Snackbar>
        </OverflowDiv>
      );
    }
  } else if (typeof error === 'string' && error.toLowerCase().includes('error')) {
    content = <ErrorText>{error}</ErrorText>;
  } else if (error && !isNaN(error)) {
    content = <ErrorText>{mapStatusToMessage(error)}</ErrorText>;
  }

  return (
    <>
      <CenterDiv>{content}</CenterDiv>
    </>
  );
}

