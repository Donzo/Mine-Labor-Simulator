// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';

contract FetchOreCount is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public ore;
    bytes32 private jobId;
    uint256 private fee;
    string private userWallet;
    string public apiURLStub;

    event RequestOreCount(bytes32 indexed requestId, uint256 volume);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = 'ca98366cc7314957b8c012c72f05aeeb';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
        apiURLStub = 'https://minelaborsimulator.com/code/php/mint-check.php?&INT=true&wallet=';
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestOreCount(string memory queryAddress) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        //req.add('get', 'https://minelaborsimulator.com/code/php/mint-check.php?wallet=0xbacb58a5bd0e2df0b3d3e82a1c75ad565a417cd6&uINT=true');
        string memory fullRequest = string.concat(apiURLStub,queryAddress);
        //req.add('get', 'https://minelaborsimulator.com/code/php/mint-check.php?wallet=0xbacb58a5bd0e2df0b3d3e82a1c75ad565a417cd6');
        req.add('get', fullRequest);
        req.add('path', 'ore'); // Chainlink nodes 1.0.0 and later support this format

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _ore) public recordChainlinkFulfillment(_requestId) {
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
