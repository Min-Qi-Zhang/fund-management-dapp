import { Component } from 'react';
import FundManagement from './artifacts/contracts/FundManagement.sol/FundManagement.json';
import FMD from './artifacts/contracts/FMD.sol/FMD.json';
import './App.css';

import DepositCard from './components/DepositCard';
import CreateSpendingCard from './components/CreateSpendingCard';
import ApproveSpendingCard from './components/ApproveSpendingCard';
import ExecuteSpendingCard from './components/ExecuteSpendingCard';

const contractAddress = "0x978Fd7aF1b995373C3bCc4a3DB0d69714E561058";
const tokenAddress = "0xef4c597986a2241D5fED9aadcb4E33a24e2D5483";

class App extends Component {
  requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  render() {
    return(
      <div className='App'>
        <DepositCard contractAddress={contractAddress} tokenAddress={tokenAddress} contractAbi={FundManagement.abi} tokenAbi={FMD.abi} requestAccount={this.requestAccount} />
        <CreateSpendingCard contractAddress={contractAddress} tokenAddress={tokenAddress} contractAbi={FundManagement.abi} tokenAbi={FMD.abi} requestAccount={this.requestAccount} />
        <ApproveSpendingCard contractAddress={contractAddress} tokenAddress={tokenAddress} contractAbi={FundManagement.abi} tokenAbi={FMD.abi} requestAccount={this.requestAccount} />
        <ExecuteSpendingCard contractAddress={contractAddress} tokenAddress={tokenAddress} contractAbi={FundManagement.abi} tokenAbi={FMD.abi} requestAccount={this.requestAccount} />
      </div>
    );
  }
}

export default App;
