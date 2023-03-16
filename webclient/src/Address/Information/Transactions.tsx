import { Card, CardContent, CircularProgress, Grid, List, ListItem, Typography } from '@mui/material';
import { Dispatch, useContext, useEffect, useState } from 'react';
import { ErrorText, InfoContainer, OverflowDiv, SubInfo } from '../../Components/Layout';
import TransactionTable from '../../Components/Tables/TransactionTable';
import { SettingsContext } from '../../Context';
import { ApiController, mapStatusToMessage } from '../../lib/api';
import { extractFunctions, FormattedOccurences, sortOccurences } from '../../lib/function';
import { ApiResult, ContractTransactions } from '../../types/types';

export type TransactionsProps = {
  address: string | null;
  setAlertShown: Dispatch<React.SetStateAction<boolean>>;
  closeAlert: () => void;
};

export default function Transactions({ address, setAlertShown, closeAlert }: TransactionsProps) {
  const [loading, setLoading] = useState(false);
  const [occurences, setOccurences] = useState<Array<FormattedOccurences>>([]);
  const [transactions, setTransactions] = useState<ContractTransactions>();
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

    const apiController = new ApiController();

    let controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);

    apiController
      .getContractTransactions(currentAddress, { rpc: settings.rpc, etherscan: settings.etherscan }, signal)
      .then((response: ApiResult<ContractTransactions>) => {
        if (response.data !== null) {
          setTransactions(response.data);
          setError(response.error);
          setLoading(false);
        } else if (response.error) {
          setError(response.error);
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [currentAddress, settings.rpc, settings.etherscan]);

  useEffect(() => {
    if (transactions !== undefined) {
      setOccurences(sortOccurences(extractFunctions(transactions.normalTransactions)));
    }
  }, [transactions]);

  let content = undefined;

  if (error ) {
    content = <ErrorText>{mapStatusToMessage(error)}</ErrorText>;
  } else if (transactions !== undefined) {
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

        {transactions.normalTransactions && transactions.normalTransactions.length > 0 && (
          <SubInfo>
            <Typography align="left" sx={{ marginBottom: '0.5em' }} gutterBottom variant="h5">
              Regular
            </Typography>
            <TransactionTable
              transactions={transactions.normalTransactions}
              closeAlert={closeAlert}
              setAlertShown={setAlertShown}
              isFunction={true}
            />
          </SubInfo>
        )}
        {transactions.internalTransactions && transactions.internalTransactions.length > 0 && (
          <SubInfo>
            <Typography align="left" sx={{ marginBottom: '0.5em' }} gutterBottom variant="h5">
              Internal
            </Typography>
            <TransactionTable
              transactions={transactions.internalTransactions}
              closeAlert={closeAlert}
              setAlertShown={setAlertShown}
            />
          </SubInfo>
        )}
      </>
    );
  }

  return (
    <InfoContainer>
      <Typography align="left" sx={{ marginBottom: '0.5em' }} gutterBottom variant="h5">
        Transactions
      </Typography>
      {(error || !loading) && (
        <OverflowDiv>
          {transactions?.internalTransactions.length === 0 && transactions.normalTransactions.length === 0 && (
            <Typography>No Transactions found</Typography>
          )}
          {content}
        </OverflowDiv>
      )}

      {!error && loading && <CircularProgress color="secondary" sx={{ mt: '2em' }} />}
    </InfoContainer>
  );
}

