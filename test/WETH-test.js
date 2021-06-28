/* eslint-disable no-undef */
const { expect } = require('chai');

describe('WETH', function () {
  let dev, alice, WETH, weth, tx;

  beforeEach(async function () {
    [dev, alice] = await ethers.getSigners();
    WETH = await ethers.getContractFactory('WETH');
    weth = await WETH.connect(dev).deploy();
    await weth.deployed();
  });
  describe('Deployment', function () {
    it('Should have name Wrapped Ether', async function () {
      expect(await weth.name()).to.equal('Wrapped Ether');
    });
    it('Should have symbol WETH', async function () {
      expect(await weth.symbol()).to.equal('WETH');
    });
    it('Should have total supply 0', async function () {
      expect(await weth.totalSupply()).to.equal(0);
    });
  });
  describe('receive', function () {
    it('Should give the good amount of WETH', async function () {
      tx = alice.sendTransaction({ to: weth.address, value: ethers.utils.parseEther('2') });
      await expect(() => tx, 'sendTransaction').to.changeEtherBalances(
        [weth, alice],
        [ethers.utils.parseEther('2'), ethers.utils.parseEther('2').mul(-1)]
      );
      expect(await weth.balanceOf(alice.address), 'alice balance').to.equal(ethers.utils.parseEther('2'));
      await expect(tx, 'event').to.emit(weth, 'Deposited').withArgs(alice.address, ethers.utils.parseEther('2'));
    });
  });
  describe('deposit', function () {
    it('Should give the good amount of WETH', async function () {
      tx = weth.connect(alice).deposit({ value: ethers.utils.parseEther('5') });
      await expect(() => tx, 'deposit').to.changeEtherBalances(
        [weth, alice],
        [ethers.utils.parseEther('5'), ethers.utils.parseEther('5').mul(-1)]
      );
      expect(await weth.balanceOf(alice.address), 'alice balance').to.equal(ethers.utils.parseEther('5'));
      await expect(tx, 'event').to.emit(weth, 'Deposited').withArgs(alice.address, ethers.utils.parseEther('5'));
    });
  });
  describe('withdraw', function () {
    beforeEach(async function () {
      await weth.connect(alice).deposit({ value: ethers.utils.parseEther('10') });
    });

    it('Should give back the same amount of ETH', async function () {
      tx = weth.connect(alice).withdraw(ethers.utils.parseEther('8'));
      await expect(() => tx, 'withdraw').to.changeEtherBalances(
        [alice, weth],
        [ethers.utils.parseEther('8'), ethers.utils.parseEther('8').mul(-1)]
      );
      expect(await weth.balanceOf(alice.address), 'alice balance').to.equal(ethers.utils.parseEther('2'));
    });
    it('Should emit a withdrew event', async function () {
      await expect(weth.connect(alice).withdraw(ethers.utils.parseEther('10')))
        .to.emit(weth, 'Withdrew')
        .withArgs(alice.address, ethers.utils.parseEther('10'));
    });
    it('Should revert if amount > balance', async function () {
      await weth.connect(alice).withdraw(ethers.utils.parseEther('10'));
      await expect(weth.connect(alice).withdraw(ethers.utils.parseEther('10'))).to.be.revertedWith(
        'WETH: not enough funds to withdraw'
      );
    });
  });
});
