import { Table, TableBody, TableContainer, Paper, TablePagination, TableHead, Typography } from '@mui/material';

import { ContractEvent } from '../../types/types';
import { useState, Dispatch } from 'react';
import theme from '../../themes/theme';
import { StyledTableCell, StyledTableRow, StyledLink } from '../../lib/table';

export type EventTableProps = {
  events: Array<ContractEvent>;
  setAlertShown: Dispatch<React.SetStateAction<boolean>>;
};
export default function EventTable({ events, setAlertShown }: EventTableProps) {
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

  if (!events || events.length === 0) {
    return <Typography>No recent Events available</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: 'auto', height: '100%' }} elevation={4}>
      <Table sx={{ minWidth: 400 }} aria-label="simple table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell>Transaction Hash</StyledTableCell>
            <StyledTableCell>Event Name </StyledTableCell>
            <StyledTableCell>Indexed Values</StyledTableCell>
            <StyledTableCell>Unindexed Values</StyledTableCell>
            <StyledTableCell>Transaction Timestamp</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {events
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: ContractEvent, index: number) => (
              <StyledTableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <StyledTableCell>
                  <StyledLink
                    variant="body2"
                    color={theme.palette.custom.link}
                    onClick={() => {
                      copyTextToClipBoard(String(row.transactionHash));
                    }}
                  >
                    {row.transactionHash}
                  </StyledLink>
                </StyledTableCell>

                <StyledTableCell>{row.signature}</StyledTableCell>
                <StyledTableCell>{JSON.stringify(row.indexedValues)}</StyledTableCell>
                <StyledTableCell>{JSON.stringify(row.unindexedValues)}</StyledTableCell>
                <StyledTableCell>{row.timestamp}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={events.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}
