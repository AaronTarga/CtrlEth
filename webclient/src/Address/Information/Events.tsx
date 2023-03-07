import { extractEvents, FormattedOccurences, sortOccurences } from '../../lib/function';
import EventTable from '../../Components/Tables/EventTable';
import { ErrorText, InfoContainer, OverflowDiv, SubInfo } from '../../Components/Layout';
import { Card, CardContent, CircularProgress, Grid, List, ListItem, Typography } from '@mui/material';
import { Dispatch, useContext, useEffect, useState } from 'react';
import { ApiController, mapStatusToMessage } from '../../lib/api';
import { ApiResult, ContractEvents } from '../../types/types';
import { SettingsContext } from '../../Context';

export type EventsProps = {
  address: string;
  setAlertShown: Dispatch<React.SetStateAction<boolean>>;
  closeAlert: () => void;
};

export default function Events({ address, setAlertShown, closeAlert }: EventsProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ContractEvents>();
  const [occurences, setOccurences] = useState<Array<FormattedOccurences>>([]);
  const [error, setError] = useState<any>();
  const [currentAddress, setCurrentAddress] = useState<string>();
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    if (address !== null) {
      setCurrentAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (currentAddress === undefined) {
      return;
    }
    setLoading(true);
    const apiController = new ApiController();

    let controller = new AbortController();
    const signal = controller.signal;

    apiController
      .getContractEvents(currentAddress, { rpc: settings.rpc, token: settings.etherscan }, signal)
      .then((response: ApiResult<ContractEvents>) => {
        if (response.data !== null) {
          setEvents(response.data);
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
  }, [currentAddress, settings.etherscan, settings.rpc]);

  useEffect(() => {
    if (events !== undefined) {
      setOccurences(sortOccurences(extractEvents(events.events)));
    }
  }, [events]);

  let content = undefined;

  if (loading) {
    content = <CircularProgress color="secondary" sx={{ mt: '2em' }} />;
  } else if (typeof error === 'string' && error.toLowerCase().includes('error')) {
    content = <ErrorText>{error}</ErrorText>;
  } else if (error && !isNaN(error)) {
    content = <ErrorText>{mapStatusToMessage(error)}</ErrorText>;
  } else if (events !== undefined) {
    content = (
      <>
        {occurences && occurences.length > 0 && (
          <SubInfo>
            <Card color="primary" elevation={4}>
              <CardContent>
                <List>
                  {occurences.map((occurence: any) => (
                    <ListItem key={occurence.key}>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography fontWeight="bold"> {occurence.key} </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography> {occurence.value}</Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </SubInfo>
        )}

        {events.events && events.events.length > 0 && (
          <SubInfo>
            <EventTable events={events.events} setAlertShown={setAlertShown} />
          </SubInfo>
        )}
      </>
    );
  }

  return (
    <InfoContainer>
      <Typography align="left" sx={{ marginBottom: '0.5em' }} gutterBottom variant="h5">
        Events
      </Typography>
      {(error || !loading) && (
        <OverflowDiv>
          {events?.events.length === 0 && <Typography>No events found</Typography>}
          {content}
        </OverflowDiv>
      )}

      {!error && loading && <CircularProgress color="secondary" sx={{ mt: '2em' }} />}
    </InfoContainer>
  );
}
