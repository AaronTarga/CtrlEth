import styled from '@emotion/styled';
import { tableCellClasses } from '@mui/material/TableCell';
import {
    TableCell,
    TableRow,
    Link,
} from '@mui/material';
import theme from '../themes/theme';

export const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const StyledLink = styled(Link)`
    cursor: pointer;
  `;
