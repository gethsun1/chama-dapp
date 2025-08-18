const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());
  
  const ChamaFactory = await hre.ethers.getContractFactory("ChamaFactory");
  const contract = await ChamaFactory.deploy();
  
  // Wait for the deployment to be mined
  await contract.waitForDeployment();
  

  console.log("ChamaFactory deployed to:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                         
