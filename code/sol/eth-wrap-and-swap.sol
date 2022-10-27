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
    function setUserToken(string memory) external;
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
        //Currently 0x1194cd23DeF7B540EE44c5308eEdb26167869D59
        swCon = _swConAddress;
        linkOut = 10000000000000000;
    }

    function mintOre(string memory _userToken) external payable {
        swCon.setUserAddress(msg.sender);
        swCon.setUserToken(_userToken);
        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkOut, msg.value);
    }
}