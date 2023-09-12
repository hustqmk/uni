pragma solidity >= 0.8.0;

interface IMyUniPair {
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );

    function mint(address to) external returns (uint liquidity);
    function initialize(address, address) external;

}