// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


interface Smelter {
    function smeltOre(uint256, address) external; //Amount and to whom
}

contract FuelSmetler is ConfirmedOwner{

    ISwapRouter public constant swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);

    address internal constant LINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address internal constant WETH9 = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;
    uint24 internal constant poolFee = 3000;

    address public smelterAddress = 0x8175A8b7f18aceE089091eCDef436013B9b86cE0; //This is where the LINK we buy will go.
    uint256 public LINKFee = 1300000000000000000;

    address internal userAddress;

    //Functions to change contract variables.
    function setUserAddress(address _userAddress)public{
        userAddress = _userAddress;
    }
    function changeSmelterAddress(address _smelterAddress) public onlyOwner {
        smelterAddress = _smelterAddress;
    }
    function changeLINKFee(uint256 _LINKFee) public onlyOwner {
        LINKFee = _LINKFee;
    }

    constructor()ConfirmedOwner(msg.sender) payable{}

    function swapExactOutputSingle(uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn) {
        
        require(amountOut >= LINKFee, "You are not swapping for enough LINK."); //Please sir, buy enough LINK to cover the fee.

        TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountInMaximum);
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: WETH9,
                tokenOut: LINK,
                fee: poolFee,
                recipient: address(smelterAddress),
                deadline: block.timestamp + 15,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);

        //Do the LINK request.
        //Smelter smelterContract = Smelter(smelterAddress);
        //smelterContract.smeltOre(oreAmount, address(userAddress));

        //Return spare WETH to the user.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(WETH9, address(swapRouter), 0);
            TransferHelper.safeTransfer(WETH9, userAddress, amountInMaximum - amountIn);
        }
    }

    function getEstimatedETHforLINK(uint wethAmount) external payable returns (uint256) {
        address tokenIn = WETH9;
        address tokenOut = LINK;
        uint24 fee = 3000;
        uint160 sqrtPriceLimitX96 = 0;

        return quoter.quoteExactOutputSingle(
            tokenIn,
            tokenOut,
            fee,
            wethAmount,
            sqrtPriceLimitX96
        );
    }
}