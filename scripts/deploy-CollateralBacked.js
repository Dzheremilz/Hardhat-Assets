/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
const hre = require('hardhat');
const { deployed } = require('./deployed');
const { readJson } = require('./readJson');

const CONTRACT = 'CollateralToken';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const json = await readJson();

  const CBT = await hre.ethers.getContractFactory('CollateralBackedToken');
  const cbt = await CBT.deploy(json[CONTRACT][hre.network.name].address);

  await cbt.deployed();
  await deployed('CollateralBackedToken', hre.network.name, cbt.address);

  const CT = await hre.ethers.getContractFactory('CollateralToken');
  const ct = await CT.attach(json[CONTRACT][hre.network.name].address);
  await ct.addBacker(cbt.address);
  console.log(`Grant Backer Role to ${cbt.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
