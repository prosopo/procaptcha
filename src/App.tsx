import React, { useState, useEffect, ChangeEventHandler } from 'react';
import './App.css';
import { extensionTest } from './api';
import ProsopoContract from './api/ProsopoContract';
import { HttpProvider } from '@polkadot/rpc-provider';
import { prosopoMiddleware } from "@prosopo/provider/src/api";
import { Environment } from "@prosopo/provider/src/env"

const contract = new ProsopoContract(new HttpProvider(), "5EFDQKSZeWLNZySoHb1JGT89AajKJECmBnZ7HasdYWqbyeaT");

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    contract.creationPromise().then(() => {
      setAccount(contract.extension.getAccount().address);
    })
  }, []);

  if (!account) {
    return null;
  }

  const accountOnChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    contract.extension.setAccount(e.target.item(e.target.selectedIndex).value).then(({ address }) => setAccount(address));
  };

  const accounts = contract.extension.getAllAcounts();

  const onClick = () => {
    const provider = contract.getRandomProvider();

  }

  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <label>Choose an account:</label>
      <select style={{ marginBottom: '20px', width: '100px' }} onChange={accountOnChange} value={account}>
        {accounts.map((account) =>
          <option key={account.address} value={account.address}>
            {account.meta.name || account.address}
          </option>)}
      </select>
      <button onClick={extensionTest}>Test Extension</button>
    </div>
  );
}

export default App;

