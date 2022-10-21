// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


contract FetchOreCount is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    string public ore;
    string private userWallet;
    string private apiURLStub;
    bytes32 private jobId;
    uint256 private fee;

    event RequestOreCount(bytes32 indexed requestId, string ore);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = '7d80a6386ef543a3abb52817f6707e3b';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
        apiURLStub = 'https://minelaborsimulator.com/code/php/mint-check.php?wallet=';
    }


    function requestOreCount(string memory queryAddress) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        string memory fullRequest = string.concat(apiURLStub,queryAddress);
        //req.add('get', 'https://minelaborsimulator.com/code/php/mint-check.php?wallet=0xbacb58a5bd0e2df0b3d3e82a1c75ad565a417cd6');
        req.add('get', fullRequest);
        req.add('path', 'ore'); // Chainlink nodes 1.0.0 and later support this format
        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the response in the form of string
     */
    function fulfill(bytes32 _requestId, string memory _ore) public recordChainlinkFulfillment(_requestId) {
        emit RequestOreCount(_requestId, _ore);
        ore = _ore;
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}
