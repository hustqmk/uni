pragma solidity >= 0.8.0;

import '../interface/IMyUniFactory.sol';
import './MyUniPair.sol';

contract MyUniFactory is IMyUniFactory {
    address[] public allPairs;

    mapping(address => mapping(address => address)) public getPair;

    bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(MyUniPair).creationCode));

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "MyUni: Same Address");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB):(tokenB, tokenA);
        require(token0 != address(0), "MyUni: Can not create pair to zero address");
        require(getPair[token0][token1] == address(0), "MyUni: pair exists");

        bytes memory bytecode = type(MyUniPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));

        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        IMyUniPair(pair).init(token0, token1);
        emit pairCreated(token0, token1, pair);
    }
}