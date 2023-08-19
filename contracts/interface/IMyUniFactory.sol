pragma solidity >= 0.8.0;

interface IMyUniFactory {
    event PairCreated(address indexed token1, address indexed token2, address pair, uint amount);
    function createPair(address tokenA, address tokenB) external returns(address pair);
}