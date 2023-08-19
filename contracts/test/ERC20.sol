pragma solidity >=0.8.0;

import '../MyUniERC20.sol';

contract ERC20 is MyUniERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}