/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const hre = require('hardhat');
const { deployed } = require('./deployed');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const CT = await hre.ethers.getContractFactory('CollateralToken');
  const ct = await CT.deploy();

  await ct.deployed();

  await deployed('CollateralToken', hre.network.name, ct.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
