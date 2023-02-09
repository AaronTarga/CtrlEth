import styled from '@emotion/styled';
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApiController } from '../lib/api';
import { ApiResult, ContractList } from '../types/types';

type ContractInputProps = {
  addressInput?: string;
  onChange: (
    event: any,
    value: unknown,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => void;
  disabled?: boolean;
  id?: string;
  centered?: boolean;
};

const StyledContractInput = styled(Autocomplete)`
  flex-grow: 0.95;
  background: white;
`;

const StyledDiv = styled.div`
  justify-content: center !important;
  text-align: center;
`;

export default function ContractInput({
  addressInput,
  onChange,
  disabled = false,
  centered = false,
  ...props
}: ContractInputProps) {
  type Item = {
    contract: string;
  };
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Array<Item>>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const apiController = new ApiController();
    let controller = new AbortController();
    const signal = controller.signal;

    apiController.getContracts(signal).then((contractResponse: ApiResult<ContractList>) => {
      if (contractResponse.data !== null) {
        setOptions(contractResponse.data.contracts.map((contract) => ({ contract: contract })));
      }
    });

    return () => {
      controller.abort();
    };
  }, [open]);

  return (
    <StyledContractInput
      {...props}
      freeSolo
      disabled={disabled}
      onChange={onChange}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      value={addressInput}
      renderOption={(props: object, option: any, state: object) => {
        return centered ? <StyledDiv {...props}>{option}</StyledDiv> : <div {...props}>{option}</div>;
      }}
      options={options.map((option) => option.contract)}
      renderInput={(params) => (
        <TextField
          sx={centered ? { input: { textAlign: 'center' }, '&.MuiAutocomplete-listbox': { alignSelf: 'center' } } : {}}
          variant="standard"
          {...params}
          placeholder="Search"
        />
      )}
    />
  );
}

