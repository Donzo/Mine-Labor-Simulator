// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import '@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol';

interface oreToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
}
interface ironToken {
    function mint(address, uint256) external;  
    function transferOwnership(address) external; //to
}

//function approve(address spender, uint256 amount) external returns (bool);


contract tokenReceiver is VRFV2WrapperConsumerBase, ConfirmedOwner{

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256 payment);

    address internal oreContractAddress = 0x92C92a9E71a6CFcd39B621eb66804Ac28186849F;
    oreToken oreTokenContract = oreToken(oreContractAddress);

    //Change This if Deploying New IRON contract
    address ironContractAddress = 0xB9F892287D66C1E032DD44592c3c5c6d99681e09;
    ironToken ironTokenContract = ironToken(ironContractAddress);
    
    uint256 public oreCount = 0;
    uint256 public oreAllowance;
    uint256 public s_randomRange;
    uint256 public myNum;
    address public msgSender;
    address public spender;
    bool public mintToken;

    

    struct RequestStatus {
        uint256 paid; // amount paid in link
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 500000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFV2Wrapper.getConfig().maxNumWords.
    uint32 numWords = 1;

    // Address LINK - hardcoded for Goerli
    address linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;

    // address WRAPPER - hardcoded for Goerli
    address wrapperAddress = 0x708701a1DfF4f478de54383E49a627eD4852C816;

    constructor() ConfirmedOwner(msg.sender) VRFV2WrapperConsumerBase(linkAddress, wrapperAddress) {}

    function smeltOre(uint256 _oreAmount)public{
        //Check Allowance
        oreAllowance = oreTokenContract.allowance(msg.sender, address(this));
        require (oreAllowance >= _oreAmount, "Not enough ORE approved for transfer.");
        
        //Get this because we doing some chainlink stuff.
        msgSender = msg.sender;
        oreCount = _oreAmount;

        bool success = oreTokenContract.transferFrom(msg.sender, address(this), _oreAmount);
        if (success){  
            mintToken = true;
            requestRandomWords();
            //Mint token
        }
        else{
            mintToken = false;
            //Do Nothing
        }
    }
    function mintIron(uint256 _amount) private{
        ironTokenContract.mint(msgSender, _amount);
    }
    function transferIronContractOwnership(address _toAddress) public onlyOwner{ //Transfers ownership of the IRON contract.
        ironTokenContract.transferOwnership(_toAddress);
    }

    function requestRandomWords() private returns (uint256 requestId) {
        requestId = requestRandomness(callbackGasLimit, requestConfirmations, numWords);
        s_requests[requestId] = RequestStatus({
            paid: VRF_V2_WRAPPER.calculateRequestPrice(callbackGasLimit),
            randomWords: new uint256[](0),
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].paid > 0, 'request not found');
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        s_randomRange = (_randomWords[0] % 100) + 1;
        testFunc(s_randomRange);
        emit RequestFulfilled(_requestId, _randomWords, s_requests[_requestId].paid);
    }
    function testFunc(uint256 _ranNum) public{
       if (_ranNum < 1000){
           mintIron(oreCount);
       }
    }
    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (
            uint256 paid,
            bool fulfilled,
            uint256[] memory randomWords
        )
    {
        require(s_requests[_requestId].paid > 0, 'request not found');
        RequestStatus memory request = s_requests[_requestId];
        return (request.paid, request.fulfilled, request.randomWords);
    }

    
}