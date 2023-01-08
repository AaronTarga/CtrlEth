import { useState, SetStateAction, Dispatch } from 'react';
import Header from './Header';
import { useParams } from 'react-router-dom';
import { Outlet, useOutletContext } from 'react-router-dom';

type ContextType = { address: string | null; setAddress: Dispatch<SetStateAction<string>> };

export default function Address() {
  var { address } = useParams();

  if (address === undefined) {
    address = '';
  }

  const [inputAddress, setInputAddress] = useState<string>(address);

  return (
    <>
      <Header address={inputAddress} setAddress={setInputAddress} />

      <Outlet context={{ address: inputAddress, setAddress: setInputAddress }} />
    </>
  );
}

export function useAddress() {
  return useOutletContext<ContextType>();
}
