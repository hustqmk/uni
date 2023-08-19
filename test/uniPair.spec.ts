import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'
import { BigNumber, bigNumberify } from 'ethers/utils'

import { expandTo18Decimals} from './shared/utils'
import { pairFixture } from './shared/fixtures'
import { AddressZero } from  'ethers/constants'

const MINIMUM_LIQUIDITY = bigNumberify(10).pow(3)

chai.use(solidity)

const overrides = {
    gasLimit: 9999999
  }

describe('MyUniPair', async() => {
    const provider = new MockProvider({
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999
    })

    const [wallet, other ] = provider.getWallets()
    const loadFixture = createFixtureLoader(provider, [wallet])

    let factory: Contract
    let token0: Contract
    let token1: Contract
    let pair: Contract
    beforeEach(async() => {
        const fixture = await loadFixture(pairFixture)
        factory = fixture.factory
        token0 = fixture.token0
        token1 = fixture.token1
        pair = fixture.pair
    })

    it('mint', async() => {
        const token0Amount = expandTo18Decimals(1)
        const token1Amount = expandTo18Decimals(4)

        await token0.transfer(pair.address, token0Amount)
        await token1.transfer(pair.address, token1Amount)

        const expectedLiquidity = expandTo18Decimals(2)
        await expect(pair.mint(wallet.address, overrides))
          .to.emit(pair, 'Transfer')
          .withArgs(AddressZero, AddressZero, MINIMUM_LIQUIDITY)
          .to.emit(pair, 'Transfer')
          .withArgs(AddressZero, wallet.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
          .to.emit(pair, 'Sync')
          .withArgs(token0Amount, token1Amount)
          .to.emit(pair, 'Mint')
          .withArgs(wallet.address, token0Amount, token1Amount)

        expect(await pair.totalSupply()).to.eq(expectedLiquidity)
        expect(await pair.balanceOf(wallet.address)).to.eq(expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        expect(await token0.balanceOf(pair.address)).to.eq(token0Amount)
        expect(await token1.balanceOf(pair.address)).to.eq(token1Amount)
        const reserves = await pair.getReserves()
        expect(reserves[0]).to.eq(token0Amount)
        expect(reserves[1]).to.eq(token1Amount)
    })

    async function addLiquidity(token0Amount: BigNumber, token1Amount: BigNumber) {
        await token0.transfer(pair.address, token0Amount);
        await token1.transfer(pair.address, token1Amount);
        await expect(pair.mint(wallet.address, overrides))
            .to.emit(pair, 'Mint')
            .withArgs(wallet.address, token0Amount, token1Amount);
    }

    const swapTestCases: BigNumber[][] = [
        [1, 5, 10, '1662497915624478906'],
        [1, 10, 5, '453305446940074565']
    ].map(a => a.map(n => (typeof n === 'string' ? bigNumberify(n) : expandTo18Decimals(n))));

    swapTestCases.forEach((swapTestCase, i) => {
        it(`getInputPrice:${i}`, async() => {
            const [swapAmount, token0Amount, token1Amount, expectedOutputAmount] = swapTestCase
            await addLiquidity(token0Amount, token1Amount)
            await expect(token0.transfer(pair.address, swapAmount))
                .to.emit(token0, 'Transfer')
                .withArgs(wallet.address, pair.address, swapAmount);
            expect(await token0.balanceOf(pair.address)).to.eq(token0Amount.add(expandTo18Decimals(1)));
            await expect(pair.swap(0, expectedOutputAmount.add(1), wallet.address, '0x',overrides)).to.be.revertedWith('UNISWAP: K')
            // await pair.swap(0, expectedOutputAmount, wallet.address, '0x', overrides)
        })
    })
})