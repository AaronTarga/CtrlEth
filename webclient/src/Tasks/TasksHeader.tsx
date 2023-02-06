import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { BASIC_HEADER_HEIGHT } from '../lib/constant';
import theme from '../themes/theme';
import Ethpector from './../assets/images/Ethpector.png';

const StyledHeader = styled.header`
  background-color: ${theme.palette.primary.main};
  position: sticky;
  top: 0;
  width: 100%;
  color: white;
  text-align: center;
  z-index: 10;
  display: flex;
  height: ${BASIC_HEADER_HEIGHT};
`;

const StyledImage = styled.img`
  width: 40px;
  margin-right: 1em;
  vertical-align: -0.75em;
`;

const HomeLink = styled(Link)`
  text-decoration: none;
  font-size: 2em;
  color: inherit;
`;

const LinkContainer = styled.div`
  text-align: left;
  padding: 1em;
  color: inherit;
  min-width: 200px;
  width: calc(47% - 2em);
  position: relative;
`;

const CenterContainer = styled.div`
  text-align: left;
  padding: 1em;
  color: inherit;
  min-width: 100px;
  width: calc(53% - 2em);
  position: relative;
`;

const StyledTitle = styled.h1`
  outline: none;
  color: white;
`;

export default function TasksHeader() {
  return (
    <>
      <StyledHeader>
        <LinkContainer>
          <StyledImage src={Ethpector} alt="Logo" id="logo" />
          <HomeLink to={'/'}>CtrlEth</HomeLink>
        </LinkContainer>
        <CenterContainer>
          <StyledTitle>Tasks</StyledTitle>
        </CenterContainer>
      </StyledHeader>
    </>
  );
}

