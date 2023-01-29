import { useState } from 'react';
import ContractInput from '../Components/ContracInput';
import styled from '@emotion/styled';
import { AutocompleteChangeDetails, AutocompleteChangeReason, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const Title = styled.h1`
  text-transform: uppercase;
  text-align: center;
  font-size: 4em;
  font-weight: 100;
  font-family: 'Roboto';
`;

const Centered = styled.div`
  width: 500px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -120%);
`;

const StyledPaper = styled(Paper)`
  display: flex;
  align-items: center;
`;

const StyledSearchIcon = styled(SearchIcon)`
  margin: 0 0.4em;
`;

const StyledContractInput = styled(ContractInput)`
  padding: 0.5em 0;
`;

export default function Home() {
  const [addressInput, setAddressInput] = useState<string>();

  const navigate = useNavigate();

  const onChange = (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    if (value !== undefined) {
      setAddressInput(value as string);
      navigate(`/address/${value}`);
    }
  };

  return (
    <Centered>
      <Title>CtrlEth</Title>
      <StyledPaper elevation={6}>
        <StyledSearchIcon />
        <StyledContractInput id="search-input" addressInput={addressInput} onChange={onChange} />
      </StyledPaper>
    </Centered>
  );
}