const { expect, use } = require('chai');
const {deployContract, MockProvider, solidity} = require('ethereum-waffle');

use(solidity);

const FundManagement = require('../artifacts/contracts/FundManagement.sol/FundManagement.json');
const FMD = require('../artifacts/contracts/FMD.sol/FMD.json');

describe("FundManagement", () => {
    const [admin, user1, user2] = new MockProvider().getWallets();
    let contract;
    let token;

    beforeEach(async () => {
        contract = await deployContract(admin, FundManagement, [admin.address, 1]);
        token = await deployContract(admin, FMD, [contract.address, 1000000]);
        await contract.setShareToken(token.address);
    });
    
    it("Should return correct shareToken", async () => {
        expect(await contract.getShareToken()).to.equal(token.address);
    });
});