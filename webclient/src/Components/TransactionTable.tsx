import { Table, TableBody, TableContainer, Paper, TablePagination, TableHead, Typography } from '@mui/material';
import { Transaction } from '../types/types';
import { useState, Dispatch } from 'react';
import theme from '../themes/theme';
import { StyledTableCell, StyledTableRow, StyledLink } from '../lib/table';

export type TransactionTableProps = {
  transactions: Array<Transaction>;
  closeAlert: () => void;
  setAlertShown: Dispatch<React.SetStateAction<boolean>>;
  isFunction?: boolean;
};
export default function TransactionTable({
  transactions,
  closeAlert,
  setAlertShown,
  isFunction = false,
}: TransactionTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const copyTextToClipBoard = (text: string) => {
    setAlertShown(true);
    navigator.clipboard.writeText(text);
  };
  if (!transactions || transactions.length === 0) {
    return <Typography>No recent Transactions available</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: 'auto', height: '100%' }} elevation={4}>
      <Table sx={{ minWidth: 400 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell>Hash </StyledTableCell>
            <StyledTableCell>Block</StyledTableCell>
            <StyledTableCell>Sender</StyledTableCell>
            <StyledTableCell>Recipient</StyledTableCell>
            {isFunction && <StyledTableCell>Function</StyledTableCell>}
            {isFunction && <StyledTableCell>Function Data</StyledTableCell>}
            <StyledTableCell>Value (Eth)</StyledTableCell>
            <StyledTableCell>Fee (Eth)</StyledTableCell>
            <StyledTableCell>GasPrice (Gwei)</StyledTableCell>
            <StyledTableCell>Time</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {transactions
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: Transaction, index: number) => (
              <StyledTableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell component="th" scope="row">
                  <StyledLink
                    variant="body2"
                    onClick={() => {
                      copyTextToClipBoard(row.hash);
                    }}
                    color={theme.palette.custom.link}
                  >
                    {row.hash}
                  </StyledLink>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledLink
                    variant="body2"
                    color={theme.palette.custom.link}
                    onClick={() => {
                      copyTextToClipBoard(String(row.blockNumber));
                    }}
                  >
                    {row.blockNumber}
                  </StyledLink>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledLink
                    variant="body2"
                    color={theme.palette.custom.link}
                    onClick={() => {
                      copyTextToClipBoard(row.from);
                    }}
                  >
                    {row.from}
                  </StyledLink>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledLink
                    variant="body2"
                    color={theme.palette.custom.link}
                    onClick={() => {
                      copyTextToClipBoard(row.to);
                    }}
                  >
                    {row.to}
                  </StyledLink>
                </StyledTableCell>
                {isFunction && (
                  <StyledTableCell component="th" scope="row">
                    {row.functionName}
                  </StyledTableCell>
                )}
                {isFunction && (
                  <StyledTableCell component="th" scope="row">
                    {JSON.stringify(row.functionArguments)}
                  </StyledTableCell>
                )}
                <StyledTableCell>
                  {Number.isNaN(row.value) ? '-' : Math.round(row.value * 100000) / 100000}
                </StyledTableCell>
                <StyledTableCell>{Number.isNaN(row.fee) ? '-' : Math.round(row.fee * 100000) / 100000}</StyledTableCell>
                <StyledTableCell>
                  {Number.isNaN(row.gasPrice) ? '-' : Math.round(row.gasPrice * 100000) / 100000}
                </StyledTableCell>
                <StyledTableCell>{row.timeStamp}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}
