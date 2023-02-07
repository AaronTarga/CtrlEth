import styled from '@emotion/styled';
import React, { useEffect, useState, useRef } from 'react';
import ContractInput from '../Components/ContracInput';
import Ethpector from './../assets/images/Ethpector.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AutocompleteChangeDetails, AutocompleteChangeReason, IconButton } from '@mui/material';
import { HEADER_HEIGHT } from '../lib/constant';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import theme from '../themes/theme';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledInput = styled(ContractInput)`
  width: 100%;
  padding: 0.4em;
`;

const StyledHeader = styled.header`
  background-color: ${theme.palette.primary.main};
  position: sticky;
  top: 0;
  width: 100%;
  color: white;
  text-align: center;
  z-index: 10;
  height: ${HEADER_HEIGHT};
`;

const HeaderContainer = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  padding: 20px 20px;
`;

const StyledImage = styled.img`
  width: 40px;
  margin-right: 10px;
  vertical-align: -0.75em;
`;

const HomeLink = styled(Link)`
  text-decoration: none;
  font-size: 2em;
  color: inherit;
`;

const StartHeader = styled.div`
  text-align: left;
`;

const CenterHeader = styled.div`
  width: 100%;
`

const EndHeader = styled.div`
  padding-right: 2em;
  text-align: right;
`;

type HeaderProps = {
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
};

const route = {
  disassembly: '/disassembly',
  source: '/source',
  information: '/information',
};

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function Header({ address, setAddress }: HeaderProps) {
  const [active, setActive] = useState<string>();

  const location = useRef(useLocation());
  const navigate = useRef(useNavigate());

  useEffect(() => {
    if (active !== undefined && navigate.current) {
      navigate.current(`/address/${address}${(route as any)[active]}`);
    }
  }, [active, address]);

  useEffect(() => {
    if (location.current !== undefined) {
      const pathSplit = location.current.pathname.split('/');
      const activePath = pathSplit[pathSplit.length - 1];

      if (activePath in route) {
        setActive(activePath);
      } else {
        setActive('disassembly');
      }
    }
  }, []);

  const tabs = {
    disassembly: 'Disassembly',
    source: 'Source Code',
    information: 'Information',
  };

  const onChange = (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    if (value !== undefined) {
      setAddress(value as string);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActive(newValue);
  };

  return (
    <StyledHeader>
      <HeaderContainer>
        <StartHeader>
          <StyledImage src={Ethpector} alt="Logo" id="logo" />
          <HomeLink to={'/'}>CtrlEth</HomeLink>
        </StartHeader>
        <CenterHeader>
          <StyledInput addressInput={address} centered={true} onChange={onChange} />
        </CenterHeader>
        <EndHeader>
          <IconButton >
            <SettingsIcon style={{color: "white", transform: "scale(1.8)"}}/>
          </IconButton>
        </EndHeader>
      </HeaderContainer>
      <Tabs
        value={active !== undefined ? active : 'disassembly'}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        {Object.keys(tabs).map((key) => (
          <Tab key={key} label={(tabs as any)[key]} {...a11yProps(0)} value={key} />
        ))}
      </Tabs>
    </StyledHeader>
  );
}
