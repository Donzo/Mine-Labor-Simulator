// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;

interface wETHContract {
    function deposit() external payable;
    function transfer(address, uint) external;
    function withdraw(uint256) external;
    function approve(address, uint) external;
}
interface SwapContract {
    function swapExactOutputSingle(uint256, uint256) external;
    //swapExactOutputSingle(uint256 amountOut, uint256 amountInMaximum) 
}

contract EthWrapper {
    wETHContract weth;
    SwapContract swCon;
    address private swapContract;

    constructor(wETHContract _wethAdress, SwapContract _swConAddress) payable{
        //Enter the address of the WETH contract on deployment
        //0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 - Goerli
        weth = _wethAdress;
        //Enter the address of the swap contract
        //Currently 0x868c89d5fCf030afF39C0c888084E54146967e87
        swCon = _swConAddress;
    }

    function wrapETH() external payable {
        weth.deposit{value: msg.value}();
        weth.transfer(address(swCon), msg.value);
        //swCon.swapExactOutputSingle(20000000000000000, msg.value);
    }
}

