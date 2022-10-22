const { expect, use } = require("chai");
const { deployContract, solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");

use(solidity);

const FundManagement = require("../artifacts/contracts/FundManagement.sol/FundManagement.json");
const FMD = require("../artifacts/contracts/FMD.sol/FMD.json");

describe("FundManagement", () => {
  let signers;
  let contract;
  let token;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    contract = await deployContract(signers[0], FundManagement, [
      signers[0].address,
      1,
    ]);
    token = await deployContract(signers[0], FMD, [contract.address, 1000000]);
    await contract.setShareToken(token.address);
  });

  it("Return correct shareToken", async () => {
    expect(await contract.getShareToken()).to.equal(token.address);
  });

  it("Deposit 0.2 ETH to the fund", async () => {
    await expect(
      contract
        .connect(signers[1])
        .deposit(2, {
          value: ethers.utils.parseEther("0.2"),
          gasLimit: 3000000,
        })
    )
      .to.emit(contract, "Deposit")
      .withArgs(signers[1].address, 2);

    expect(await token.balanceOf(signers[1].address)).to.equal(2);

    expect(await contract.getStakeholderAmount(signers[1].address)).to.equal(2);
  });

  it("Create spending", async () => {
    await expect(contract.createSpending(signers[1].address, 1, "some purpose"))
      .to.emit(contract, "NewSpending")
      .withArgs(signers[1].address, 1);
  });

  it("Add an approval vote to a Spending", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });
    await contract.createSpending(signers[1].address, 1, "some purpose");
    await expect(contract.connect(signers[1]).approveSpending(1, true))
      .to.emit(contract, "Vote")
      .withArgs(signers[1].address, true);
  });
});
