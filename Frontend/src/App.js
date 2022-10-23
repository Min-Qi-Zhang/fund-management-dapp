import { Component } from 'react';
import { ethers } from 'ethers';
import FundManagement from './artifacts/contracts/FundManagement.sol/FundManagement.json';
import FMD from './artifacts/contracts/FMD.sol/FMD.json';
import './App.css';

import DepositCard from './components/DepositCard';

const contractAddress = "0x978Fd7aF1b995373C3bCc4a3DB0d69714E561058";
const tokenAddress = "0xef4c597986a2241D5fED9aadcb4E33a24e2D5483";

class App extends Component {
  state = {
    // tokenAddress: ''
  }
  
  componentDidMount = async () => {
    // if (typeof window.ethereum !== 'undefined') {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const contract = new ethers.Contract(contractAddress, FundManagement.abi, provider);
    //   try {
    //     const shareToken = await contract.getShareToken();
    //     this.setState({ tokenAddress: shareToken });
    //   } catch (err) {
    //     console.log('Error: ', err);
    //   }
    // }
  }

  requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  render() {
    return(
      <div className='App'>
        <DepositCard contractAddress={contractAddress} tokenAddress={tokenAddress} contractAbi={FundManagement.abi} tokenAbi={FMD.abi} requestAccount={this.requestAccount} />
      </div>
    );
  }
}

export default App;
