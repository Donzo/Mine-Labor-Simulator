// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.13;

interface WethLike {
    function deposit() external payable;
    function transfer(address, uint) external;
    function withdraw(uint256) external;
}


contract EthWrapper {
  WethLike weth;

  constructor(WethLike weth_) payable{
    weth = weth_;
  }

  function wrapETH() external payable {
   // payable(this).transfer(msg.value);
    weth.deposit{value: msg.value}();
   // weth.transfer(msg.value);
    //weth.deposit.value(msg.value)();
    weth.transfer(address(this), msg.value);
  }

}

