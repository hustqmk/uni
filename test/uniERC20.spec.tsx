import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { bigNumberify, hexlify, keccak256, defaultAbiCoder, toUtf8Bytes} from 'ethers/utils'
import { solidity, MockProvider, deployContract} from 'ethereum-waffle'
import { expandTo18Decimals } from './shared/utils'

const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)

import ERC20 from '../build/ERC20.json'

chai.use(solidity)

describe('UNI-ERC20', () => {
  const provider = new MockProvider(
    {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999
    })

  const [wallet, other] = provider.getWallets()

  let token: Contract
  beforeEach(async() => {
    token = await deployContract(wallet, ERC20, [TOTAL_SUPPLY])
  })


  it('name, symbol, decimals, totalsupply', async() => {
    const name = await token.name()
    expect(name).to.eq('MyUni V2');
    expect(await token.symbol()).to.eq('UNIV2');
    expect(await token.decimals()).to.eq(18);
    expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
    expect(await token.DOMAIN_SEPARATOR()).to.eq(
      keccak256(
        defaultAbiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
          [
            keccak256(
              toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
            ),
            keccak256(toUtf8Bytes(name)),
            keccak256(toUtf8Bytes('1')),
            1,
            token.address
          ]
        )
      )
    )
    expect(await token.PERMIT_TYPEHASH()).to.eq(
      keccak256(toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'))
    )
  })

  it('approve', async() => {
    await expect(token.approve(other.address, TEST_AMOUNT))
      .to.emit(token, 'Approval')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
  })

  it('Transfer', async() => {
    await expect(token.transfer(other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })

  it('transFrom', async() => {
    await token.approve(other.address, TEST_AMOUNT)
    await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await token.allowance(wallet.address, other.address)).to.eq(0)
    expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
    expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
  })
})