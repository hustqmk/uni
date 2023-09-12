import { Contract, Wallet } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { deployContract } from 'ethereum-waffle'
import { expandTo18Decimals, remove18Decimals} from './utils'

import MyUniFactory from '../../build/MyUniFactory.json'
import ERC20 from '../../build/ERC20.json'
import MyUniPair from '../../build/MyUniPair.json'

interface FactoryFixture {
    factory: Contract
}

interface PairFixture extends FactoryFixture {
    token0: Contract
    token1: Contract
    pair: Contract
}

const overrides = {
    gasLimit: 9999999
}

export async function factoryFixture(_: Web3Provider, [wallet]: Wallet[]) : Promise<FactoryFixture> {
    const factory = await deployContract(wallet, MyUniFactory, [wallet.address], overrides)
    return {factory}
}

export async function pairFixture(provider: Web3Provider, [wallet] : Wallet[]): Promise<PairFixture> {
    const { factory } = await factoryFixture(provider, [wallet])

    const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)
    const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)], overrides)

    // tokenA.on('Transfer', (from, to , value) => {
    //     console.log("[TokenA]: ", from, to , remove18Decimals(value));
    // })

    // tokenB.on('Transfer', (from, to, value) => {
    //     console.log("[TokenB]: ", from, to, remove18Decimals(value));
    // })

    await factory.createPair(tokenA.address, tokenB.address, overrides)
    const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
    const pair = new Contract(pairAddress, JSON.stringify(MyUniPair.abi), provider).connect(wallet)

    // pair.on('Mint', (to, amountIn0, amountIn1, liquidity) => {
    //     console.log("[Mint]: ", to, amountIn0, amountIn1, liquidity);
    // })

    const token0Address = (await pair.token0()).address
    const token0 = tokenA.address === token0Address ? tokenA : tokenB
    const token1 = tokenA.address === token0Address ? tokenB : tokenA

    return { factory, token0, token1, pair }
}