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

    wETHContract public constant weth = wETHContract(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
    SwapContract public constant swCon = SwapContract(0xD35c9101485A56A171c038282132556a95504A6E);

    uint256 private wethBalance;
    address private swapContract;
    uint256 internal linkOut = 100000000000000000;

    //Set how much LINK you want from the swap contract
    function setLinkOut(uint256 _linkOut) public onlyOwner {
        linkOut = _linkOut;
    }

    constructor()ConfirmedOwner(msg.sender) payable{ }

    function mintOre(string memory _userToken) external payable {
        swCon.setUserAddress(msg.sender);
        swCon.setUserToken(_userToken);
        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkOut, msg.value);
    }
}