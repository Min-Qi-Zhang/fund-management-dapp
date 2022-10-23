const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/FundManagement.sol/FundManagement.json");
const token = require("../artifacts/contracts/FMD.sol/FMD.json");

// provider - Alchemy
const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);

// signer
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

// contract
const fundManagement = new ethers.Contract(CONTRACT_ADDRESS, contract.abi, signer);
const fmd_token = new ethers.Contract(TOKEN_ADDRESS, token.abi, signer);

async function main() {
  // Deposit
  // await fundManagement.deposit(1, {
  //   value: ethers.utils.parseEther("0.1")
  // });

  // Withdraw
  await fmd_token.approve(CONTRACT_ADDRESS, ethers.utils.parseEther("1.0"));
  await fundManagement.withdraw(1);

  console.log("Success!");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });