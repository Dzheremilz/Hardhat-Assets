/* eslint-disable no-unused-expressions */
const { expect } = require('chai');

describe('Collateral', function () {
  let dev, alice, CT, ct, CBT, cbt, tx;

  beforeEach(async function () {
    [dev, alice] = await ethers.getSigners();
    CT = await ethers.getContractFactory('CollateralToken');
    ct = await CT.connect(dev).deploy();
    await ct.deployed();
    CBT = await ethers.getContractFactory('CollateralBackedToken');
    cbt = await CBT.connect(dev).deploy(ct.address);
    await cbt.deployed();

    await ct.addBacker(cbt.address);
  });
  describe('CT', function () {
    describe('Backer Role', function () {
      it('Should add role backer to alice', async function () {
        expect(await ct.isBacker(alice.address), 'false').to.be.false;
        await ct.addBacker(alice.address);
        expect(await ct.isBacker(alice.address), 'true').to.be.true;
        await ct.revokeBacker(alice.address);
        expect(await ct.isBacker(alice.address), 'revoke false').to.be.false;
      });
    });
    describe('Backer Transfer', function () {
      it('Should backer transfer the amount', async function () {
        await ct.addBacker(alice.address);
        await expect(() =>
          ct.connect(alice).backerTransfer(dev.address, ethers.utils.parseEther('10'))
        ).to.changeTokenBalances(
          ct,
          [alice, dev],
          [ethers.utils.parseEther('10'), ethers.utils.parseEther('10').mul(-1)]
        );
      });
    });
  });
  describe('CBT', function () {
    beforeEach(async function () {
      await ct.transfer(alice.address, ethers.utils.parseEther('50'));
    });
    describe('deposit', function () {
      it('Should give CBT to alice', async function () {
        tx = cbt.connect(alice).deposit(ethers.utils.parseEther('20'));
        await expect(() => tx).to.changeTokenBalances(cbt, [alice, cbt], [ethers.utils.parseEther('10'), 0]);
      });
      it('Should transfer CT from alice to cbt', async function () {
        tx = cbt.connect(alice).deposit(ethers.utils.parseEther('20'));
        await expect(() => tx).to.changeTokenBalances(
          ct,
          [alice, cbt],
          [ethers.utils.parseEther('20').mul(-1), ethers.utils.parseEther('20')]
        );
      });
      it('Should revert if not enough CT', async function () {
        await expect(cbt.connect(alice).deposit(ethers.utils.parseEther('60'))).to.be.revertedWith(
          'CollateralBackedToken: You do not have enough CollateralToken'
        );
      });
    });
    describe('withdraw', function () {
      beforeEach(async function () {
        await cbt.connect(alice).deposit(ethers.utils.parseEther('20'));
      });

      it('Should transfer CT from cbt to Alice', async function () {
        expect(await cbt.balanceOf(alice.address), 'balanceOf Alice').to.be.equal(ethers.utils.parseEther('10'));
        tx = cbt.connect(alice).withdraw(ethers.utils.parseEther('10'));
        await expect(() => tx, 'withdraw ct').to.changeTokenBalances(
          ct,
          [alice, cbt],
          [ethers.utils.parseEther('20'), ethers.utils.parseEther('20').mul(-1)]
        );
      });
      it('Should burn CBT of Alice', async function () {
        tx = cbt.connect(alice).withdraw(ethers.utils.parseEther('10'));
        await expect(() => tx, 'withdraw cbt').to.changeTokenBalances(
          cbt,
          [alice, cbt],
          [ethers.utils.parseEther('10').mul(-1), 0]
        );
        expect(await cbt.balanceOf(alice.address), 'balanceOf Alice cbt').to.be.equal(0);
      });
      it('Should revert if not enough CBT', async function () {
        await expect(cbt.withdraw(ethers.utils.parseEther('1'))).to.be.revertedWith(
          'CollateralBackedToken: You do not have enough CollateralBackToken'
        );
      });
    });
  });
});
