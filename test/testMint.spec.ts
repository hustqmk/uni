import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, deployContract} from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'

describe('UNI-ERC20', () => {
  const provider = new MockProvider(
    {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999
    })

  it('Test 1', async() => {
    const result = 2+3
    expect(result).to.eq(5)
  })
})