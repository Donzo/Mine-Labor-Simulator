// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';


interface OreToken {
    function mint(address, uint256) external;  
    function transferOwnership(address) external; //from and to
}

contract FetchOreCountStringAndMint is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;
    
    address private oreContractAddress;
    address private userWalletAddress;
    bytes32 private jobId;
    string private apiURLStub;
    string public oreString;
    string public queryString;
    string private userToken;
    uint256 private fee;
    uint256 public ore;

    constructor() ConfirmedOwner(msg.sender) {

        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);        
        oreContractAddress = 0x92C92a9E71a6CFcd39B621eb66804Ac28186849F;

        jobId = '7d80a6386ef543a3abb52817f6707e3b';
        fee = (1 * LINK_DIVISIBILITY) / 10; 
        apiURLStub = "https://minelaborsimulator.com/code/php/mint-check.php?wallet=";
    }
    function requestOreCount(address _queryAddress, string memory _userToken) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        userToken = _userToken; //Get DB Token
        userWalletAddress = _queryAddress; //Get Query Address

        string memory prefix = "0x"; //Form Prefix for Wallet Address
        string memory addressToString = toAsciiString(_queryAddress); //Turn Address into String for Concatination
        string memory pQueryAddress = string.concat(prefix,addressToString); //Join Prefix and Stringified Wallet Address        
        string memory fullRequest = string.concat(apiURLStub,pQueryAddress); //Join Query Stub with Address String to Query
        string memory utPrefix = "&tkn="; //Name GET for DB Token
        string memory fullUserToken = string.concat(utPrefix,userToken); //Join GET and DB Token
        string memory fullRequestWithToken = string.concat(fullRequest,fullUserToken); //Join request with DB token
        
        //Store full request for testing purposes
        queryString = fullRequestWithToken;
        
        req.add('get', fullRequestWithToken);
        req.add('path', '0,ore'); 

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }
    function fulfill(bytes32 _requestId, string memory _ore) public recordChainlinkFulfillment(_requestId) {
        oreString = _ore;
        uint256 oreConverted = stringToUint(_ore);
        ore = oreConverted;
        //Mint if More Than 1 Ore
        if (ore > 0){
            ore *= 1000000000000000000;
            OreToken oreContract = OreToken(oreContractAddress);
            oreContract.mint(userWalletAddress, ore);
        }

    }
    function transferOreContractOwnership(address _toAddress) public onlyOwner{ //Transfers ownership of the ORE contract.
           OreToken oreContract = OreToken(oreContractAddress);
           oreContract.transferOwnership(_toAddress);
    }

    function newAPIStub(string memory _apiURLStub)public onlyOwner{ //Maybe need a new API query stub.
        apiURLStub = _apiURLStub;
    }
    //Turns address into a string 1
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }
    //Turns address into a string 2
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    //Turns string to uint
    function stringToUint(string memory s) public pure returns (uint) {
        bytes memory b = bytes(s);
        uint result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }
    //Withdraws Link from this contract
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }
}