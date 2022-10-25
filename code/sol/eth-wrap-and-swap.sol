// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';

interface wETHContract {
    function deposit() external payable;
    function transfer(address, uint) external;
    function withdraw(uint256) external;
    function approve(address, uint) external;
}
interface SwapContract {
    function setUserAddress(address) external;
    function swapExactOutputSingle(uint256, uint256) external;
}

contract EthToOre is ConfirmedOwner{
    wETHContract weth;
    SwapContract swCon;
    
    uint256 private wethBalance;
    address private swapContract;
    uint256 internal linkOut;

    //Set how much LINK you want from the swap contract
    function setLinkOut(uint256 _linkOut) public onlyOwner {
        linkOut = _linkOut;
    }

    constructor(wETHContract _wethAdress, SwapContract _swConAddress)ConfirmedOwner(msg.sender) payable{
        //Enter the address of the WETH contract on deployment
        //0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 - Goerli
        weth = _wethAdress;
        //Enter the address of the swap contract
        //Currently 0xd99190177e3d32Da0Fbb0C567d42783F149dC6be
        swCon = _swConAddress;
        linkOut = 10000000000000000;
    }

    function mintOre() external payable {
        swCon.setUserAddress(msg.sender);
        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkOut, msg.value);
    }
}