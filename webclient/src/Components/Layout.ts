import styled from "@emotion/styled";
import { HEADER_HEIGHT } from "../lib/constant";
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { Typography, ListItemText } from "@mui/material";


// content under header needs to subtract header height
export const CenterDiv = styled.div`
  text-align: center;
  height: calc(100% - ${HEADER_HEIGHT});
`;

export const DrawerView = styled(Paper)`
  width: 50%;
  overflow: auto;
`;

export const TopRightButton = styled(IconButton)`
  position: absolute;
  right: 0.5em;
  top: 0.1em;
  z-index: 1;
`;

export const ErrorText = styled(Typography)`
  padding-top: 0.5em;
`;

export const CenteredItem = styled(ListItemText)`
  text-align: center;
`;

export const OverflowDiv = styled.div`
  height: 100%;
  overflow: auto;
`;

export const InfoContainer = styled.div`
  margin: 2em;
`;

export const SubInfo = styled.div`
  margin: 2em 0;
`