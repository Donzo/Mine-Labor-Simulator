// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


interface OreQ {
    function requestOreCount(address) external;
}

contract BuyLink is ConfirmedOwner{

    ISwapRouter public immutable swapRouter;

    address public constant LINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address public constant WETH9 = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;
    //This is where the LINK we buy will go.
    address internal OreQuery = 0x3Ec661189DfC6778e5a2940507406b0A59190d49;
    address internal userAddress;
    uint256 internal LINKFee = 10000000000000000;

    uint24 public constant poolFee = 3000;

    //Functions to change contract variables.
    function setUserAddress(address _userAddress)public{
        userAddress = _userAddress;
    }
    function changeOreQuery(address _OreQuery) public onlyOwner {
        OreQuery = _OreQuery;
    }
    function changeLINKFee(uint256 _LINKFee) public onlyOwner {
        LINKFee = _LINKFee;
    }

    constructor(ISwapRouter _swapRouter)ConfirmedOwner(msg.sender) {
        swapRouter = _swapRouter;
        //Goerli - 0xE592427A0AEce92De3Edee1F18E0157C05861564
    }

    function swapExactOutputSingle(uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn) {
        
        //Please sir, buy enough LINK to cover the fee.
        require(amountOut >= LINKFee);

        TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountInMaximum);
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: WETH9,
                tokenOut: LINK,
                fee: poolFee,
                recipient: address(OreQuery),
                deadline: block.timestamp + 15,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);

        //Do the LINK request.
        OreQ oreQueryContract = OreQ(OreQuery);
        oreQueryContract.requestOreCount(address(userAddress));
   
        //Return spare WETH to the user.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(WETH9, address(swapRouter), 0);
            TransferHelper.safeTransfer(WETH9, userAddress, amountInMaximum - amountIn);
        }
    }
}
