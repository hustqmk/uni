pragma solidity>=0.8.0;

import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import '../library/safeMath.sol';
import '../interface/IMyUniPair.sol';
import '../interface/IERC20.sol';

contract testAddLiquid {
    event Transfer(address indexed from, address indexed to, address token, uint value);
    event Approval(address indexed to, uint value);
    event TestPair(address indexed pair);

    using SafeMath for uint;
    address public factory;
    address public cur_pair;

    constructor() public {
        factory = msg.sender;
    }

    function addLiquid(
        address token0,
        address token1,
        uint amount0,
        uint amount1,
        address to
    ) external returns(uint liquid){
        address pair = pairFor(factory, token0, token1);
        cur_pair = pair;
        TransferHelper.safeTransferFrom(token0, msg.sender, pair, amount0);
        emit Transfer(msg.sender, pair, token0, amount0);
        TransferHelper.safeTransferFrom(token1, msg.sender, pair, amount1);
        emit Transfer(msg.sender, pair, token1, amount1);
        uint liquid = IMyUniPair(pair).mint(to);
    }

    function testPair(address factory, address token0, address token1) public {
        address pair = pairFor(factory, token0, token1);
        emit TestPair(pair);
    }

    function pairFor(address factory, address _token0, address _token1) internal pure returns (address pair){
        (address token0, address token1) = _token0 < _token1 ? (_token0, _token1) : (_token1, _token0);
        pair = address(uint160(uint(keccak256(abi.encodePacked(
            hex'ff',
            factory,
            keccak256(abi.encodePacked(token0, token1)),
            hex'443dd177f88c7877dc6f51d296a531b309a78ce45ab0ca3189dd9db7a586a500'
        )))));

    }

    function trans(address token, address to, uint amount) external{
        TransferHelper.safeTransferFrom(token, msg.sender, to, amount);
        emit Transfer(msg.sender, to, token, amount);
    }
}