require("dotenv").config();

async function main() {
  const { ADDRESS } = process.env;
  const FMD = await ethers.getContractFactory("FMD");
  const FundManagement = await ethers.getContractFactory("FundManagement");
  const fund_management = await FundManagement.deploy(ADDRESS, 1);
  const fmd_token = await FMD.deploy(fund_management.address, 1000000);
  await fund_management.setShareToken(fmd_token.address);
  console.log("FundManagement is deployed at address: ", fund_management.address);
  console.log("FMD token is deployed at address: ", fmd_token.address);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });