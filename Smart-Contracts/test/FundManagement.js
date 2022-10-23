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
    token = await deployContract(signers[0], FMD, [contract.address, 1000]);
    await contract.setShareToken(token.address);
  });

  it("Return correct shareToken", async () => {
    expect(await contract.getShareToken()).to.equal(token.address);
  });

  it("Deposit 0.2 ETH to the fund", async () => {
    await expect(
      contract.connect(signers[1]).deposit(2, {
        value: ethers.utils.parseEther("0.2"),
        gasLimit: 3000000,
      })
    )
      .to.emit(contract, "Deposit")
      .withArgs(signers[1].address, 2);

    expect(await contract.getStakeholderAmount(signers[1].address)).to.equal(2);
  });

  it("Deposit amount does not match actual ETH transferred", async () => {
    await expect(
      contract.connect(signers[1]).deposit(1, {
        value: ethers.utils.parseEther("2"),
        gasLimit: 3000000,
      })
    ).to.be.revertedWith("Deposit amt does not match");
  });

  it("Deposit amount is more than supply", async () => {
    await contract.connect(signers[1]).deposit(500, {
      value: ethers.utils.parseEther("50"),
      gasLimit: 3000000,
    });
    await expect(
      contract.connect(signers[2]).deposit(501, {
        value: ethers.utils.parseEther("50.1"),
        gasLimit: 3000000,
      })
    ).to.be.revertedWith("Not enough supply");
  });

  it("Withdraw 0.1 ETH from contract", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });
    await token
      .connect(signers[1])
      .approve(contract.address, ethers.utils.parseEther("1.0"));

    await expect(
      contract.connect(signers[1]).withdraw(1, { gasLimit: 3000000 })
    )
      .to.emit(contract, "Withdraw")
      .withArgs(signers[1].address, 1);
    expect(await contract.getStakeholderAmount(signers[1].address)).to.equal(1);
  });

  it("Withdraw 0 ETH from contract", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });
    await token
      .connect(signers[1])
      .approve(contract.address, ethers.utils.parseEther("1.0"));

    await expect(
      contract.connect(signers[1]).withdraw(0, { gasLimit: 3000000 })
    ).revertedWith("withdrawAmt should be more than 0");
  });

  it("Withdraw 0.1 ETH from contract by non-stakeholder", async () => {
    await expect(
      contract.connect(signers[2]).withdraw(1, { gasLimit: 3000000 })
    ).revertedWith("Stakeholder does not exist");
  });

  it("Withdraw 0.1 ETH from contract without enough allowance", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await expect(
      contract.connect(signers[1]).withdraw(1, { gasLimit: 3000000 })
    ).revertedWith("Number of tokens approved is not enough");
  });

  it("Withdraw more than deposited amount", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });
    await token
      .connect(signers[1])
      .approve(contract.address, ethers.utils.parseEther("3.0"));

    await expect(
      contract.connect(signers[1]).withdraw(3, { gasLimit: 3000000 })
    ).revertedWith("Can't withdraw more than the amt you deposited");
  });

  it("Create spending", async () => {
    await expect(contract.createSpending(signers[1].address, 1, "some purpose"))
      .to.emit(contract, "NewSpending")
      .withArgs(signers[1].address, 1);
  });

  it("Create spending with non-admin account", async () => {
    await expect(
      contract
        .connect(signers[2])
        .createSpending(signers[1].address, 1, "some purpose")
    ).to.be.revertedWith("Caller is not admin");
  });

  it("Create spending with spendingAmt = 0", async () => {
    await expect(
      contract.createSpending(signers[1].address, 0, "some purpose")
    ).to.be.revertedWith("spendingAmt must be more than 0");
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

  it("Add an approval vote to a Spending that does not exist", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await expect(
      contract.connect(signers[1]).approveSpending(10, true)
    ).to.be.revertedWith("Invalid spendingId");
  });

  it("Add an approval vote to a Spending by a non-stakeholder account", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await expect(
      contract.connect(signers[2]).approveSpending(1, true)
    ).to.be.revertedWith("Stakeholder does not exist");
  });

  it("Execute spending", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await contract.connect(signers[1]).approveSpending(1, true);

    await expect(contract.executeSpending(1, { value: 0, gasLimit: 3000000 }))
      .to.emit(contract, "SpendingExecuted")
      .withArgs(signers[0].address, 1);
  });

  it("Execute spending with non-admin account", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await contract.connect(signers[1]).approveSpending(1, true);

    await expect(
      contract.connect(signers[2]).executeSpending(1, { gasLimit: 3000000 })
    ).to.be.revertedWith("Caller is not admin");
  });

  it("Execute spending with invalid spendingId provided", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await contract.connect(signers[1]).approveSpending(1, true);

    await expect(
      contract.executeSpending(10, { gasLimit: 3000000 })
    ).to.be.revertedWith("Invalid spendingId");
  });

  it("Execute spending without enough approvals", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await expect(
      contract.executeSpending(1, { gasLimit: 3000000 })
    ).to.be.revertedWith("Not enough approvals");
  });

  it("Execute the executed spending", async () => {
    await contract
      .connect(signers[1])
      .deposit(2, { value: ethers.utils.parseEther("0.2"), gasLimit: 3000000 });

    await contract.createSpending(signers[1].address, 1, "some purpose");

    await contract.connect(signers[1]).approveSpending(1, true);

    await contract.executeSpending(1, { gasLimit: 3000000 });

    await expect(
      contract.executeSpending(1, { gasLimit: 3000000 })
    ).to.be.revertedWith("This spending was executed");
  });
});
