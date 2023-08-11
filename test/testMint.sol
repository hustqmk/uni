pragma solidity>=0.8.0;

import "../interface/IMyUniPair.sol";
import "../contract/MyUniPair.sol";

contract testMint{
    function mint_to(address _from, address _to) external {
        IMyUniPair(_from).mint(_to);
    }
}