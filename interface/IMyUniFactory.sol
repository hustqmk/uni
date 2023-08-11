pragma solidity >= 0.8.0;

interface IMyUniFactory {
    event pairCreated(address indexed token1, address indexed token2, address pair);
    function createPair(address tokenA, address tokenB) external returns(address pair); 
}