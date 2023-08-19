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

export function getCreate2Address(factoryAddress: string,
  [tokenA, tokenB]: [string, string],
  bytecode: string
): string {
  const [token0, token1] = tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]
  const create2Inputs = [
    '0xff',
    factoryAddress,
    keccak256(solidityPack(['address', 'address'], [token0, token1])),
    keccak256(bytecode)
  ]

  const sanitizedInputs = `0x${create2Inputs.map(i=>i.slice(2)).join('')}`
  return getAddress(`0x${keccak256(sanitizedInputs).slice(-40)}`)
}