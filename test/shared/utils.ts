import { Contract} from 'ethers'
import { Web3Provider } from 'ethers/providers'
import {
    BigNumber,
    bigNumberify,
    getAddress,
    keccak256,
    defaultAbiCoder,
    toUtf8Bytes,
    solidityPack
} from 'ethers/utils'

export function expandTo18Decimals(amount: number): BigNumber {
  return bigNumberify(amount).mul(bigNumberify(10).pow(18));
}