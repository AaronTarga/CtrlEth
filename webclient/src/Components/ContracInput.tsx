import styled from '@emotion/styled';
import { Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason, TextField } from '@mui/material';

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

export default function ContractInput({ addressInput, onChange, disabled = false, ...props }: ContractInputProps) {
  type Item = {
    contract: string;
  };
  
  let options: Item[] = [
    { contract: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB' },
    { contract: '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d' },
    { contract: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
    { contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { contract: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
    { contract: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52' }, //bnb
    { contract: '0x000000000000cd17345801aa8147b8D3950260FF' }, //very small (poster)
    { contract: '0xAaDafb3bfea42Ba02252f6ce456f56713aB49EbA' },
    { contract: '0x17772f767Ed9CA382a639e591C598ac40f08cCdD' }, //forwarder
    { contract: '0x3c64dc415ebb4690d1df2b6216148c8de6dd29f7' }, // selfdestruct
  ];

  return (
    <StyledContractInput
      {...props}
      freeSolo
      disabled={disabled}
      onChange={onChange}
      value={addressInput}
      options={options.map((option) => option.contract)}
      renderInput={(params) => <TextField sx={ props.centered ? {input: {textAlign: "center"}} : {}} variant="standard" {...params} placeholder="Search" />}
    />
  );
}
