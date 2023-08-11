pragma solidity>=0.8.0;

import '../interface/IMyUniPair.sol';
import './MyUniERC20.sol';
import '../interface/IERC20.sol';
import '../library/safeMath.sol';
import '../library/Math.sol';
import '../library/UQ112x112.sol';

contract MyUniPair is IMyUniPair, MyUniERC20{
    using SafeMath  for uint;
    using UQ112x112 for uint224;

    event Sync(uint112 reserve0, uint112 reserve1);
    address public factory;
    address public token0;
    address public token1;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast;

    uint32 public constant MINIMUM_LIQUIDITY = 10**3;
    uint112 public constant UINT112_MAX = 2**112 - 1;

    constructor() public {
        factory = msg.sender;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function initialize(address _token0, address _token1) external override {
        require(msg.sender == factory, "MyUniswap: only factory can call it.");
        token0 = _token0;
        token1 = _token1;
    }

    function _update(uint _balance0, uint _balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(_balance0 <= UINT112_MAX && _balance1 <= UINT112_MAX, 'UNISWAP: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast;
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }

        reserve0 = uint112(_balance0);
        reserve1 = uint112(_balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }

    function mint(address to) external override returns (uint liquidity){
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        uint amount0 = balance0.sub(_reserve0);
        uint amount1 = balance1.sub(_reserve1);

        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'UNISWAP: INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);

        _update(balance0, balance1, _reserve0, _reserve1);
    }
}