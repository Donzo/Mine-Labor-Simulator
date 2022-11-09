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
interface wETHContract {
    function deposit() external payable;
    function transfer(address, uint) external;
    function withdraw(uint256) external;
    function approve(address, uint) external;
}
interface SwapContract {
    function setUserAddress(address) external;
    function setOreAmount(uint256) external;
    function swapExactOutputSingle(uint256, uint256) external;
}

contract smeltingContract is VRFV2WrapperConsumerBase, ConfirmedOwner{

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords, uint256 payment);

    wETHContract public constant weth = wETHContract(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
    SwapContract public constant swCon = SwapContract(0x91Fe1517FDf17Ae2C338602d14A3E156013E61d2);

    address internal oreContractAddress = 0x92C92a9E71a6CFcd39B621eb66804Ac28186849F;
    oreToken oreTokenContract = oreToken(oreContractAddress);

    address public ironContractAddress = 0xd020ee009eBa367b279546C9Ed47Ba49A0Bcb159;
    ironToken ironTokenContract = ironToken(ironContractAddress);

    uint256 internal linkIn = 1300000000000000000;
    uint256 public oreCount = 0;
    uint256 public oreAllowance;
    uint256 public s_randomRange;
    uint256 public myNum;
    address public msgSender;
    address public spender;

    function setLinkIn(uint256 _linkIn) public onlyOwner {
        linkIn = _linkIn;
    }

    struct RequestStatus {
        uint256 paid; // amount paid in link
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256[] randomWords;
    }
    //Old one
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
    
    //New one
    mapping(uint256 => uint256) public mapIdToWords; //Maps Results to ID
    mapping(uint256 => uint256) public mapIdToOreAmount; //Map Ore Amount to ID
    mapping(uint256 => address) public mapIdToAddress; //Maps the address
    
    uint256 public s_requestId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    uint32 callbackGasLimit = 800000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // Address LINK - hardcoded for Goerli
    address linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    // address WRAPPER - hardcoded for Goerli
    address wrapperAddress = 0x708701a1DfF4f478de54383E49a627eD4852C816;

    constructor() ConfirmedOwner(msg.sender) VRFV2WrapperConsumerBase(linkAddress, wrapperAddress) payable{}

    function loadSmelter(uint256 _oreAmount) external payable {
        //Check Allowance
        oreAllowance = oreTokenContract.allowance(msg.sender, address(this));
        require (oreAllowance >= _oreAmount, "Not enough ORE approved for transfer2 .");

        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkIn, msg.value);
        smeltOre(_oreAmount);
    }

    function smeltOre(uint256 _oreAmount)private{
        //Get this because we doing some chainlink stuff.
        msgSender = msg.sender;
        oreCount = _oreAmount;

        bool successfulTransfer = oreTokenContract.transferFrom(msg.sender, address(this), _oreAmount);
        
        if (successfulTransfer){  
            //Mint token
            requestRandomWords();
        }
    }
    
    function mintIron(address _msgSender, uint256 _amount) private{
        ironTokenContract.mint(_msgSender, _amount);
    }
    function transferIronContractOwnership(address _toAddress) public onlyOwner{ //Transfers ownership of the IRON contract.
        ironTokenContract.transferOwnership(_toAddress);
    }
    function changeIronContractAddress(address _ironContractAddress) public onlyOwner {
        ironContractAddress = _ironContractAddress;
    }

    function requestRandomWords() private returns (uint256 requestId) {
        requestId = requestRandomness(callbackGasLimit, requestConfirmations, numWords);
        s_requests[requestId] = RequestStatus({
            paid: VRF_V2_WRAPPER.calculateRequestPrice(callbackGasLimit),
            randomWords: new uint256[](0),
            fulfilled: false
        });
        //Old Ones
        requestIds.push(requestId);
        lastRequestId = requestId;
        
        //New Ones
        mapIdToAddress[requestId] = msg.sender;
        mapIdToOreAmount[requestId] = oreCount;
        // Store the latest requestId for this example.
        s_requestId = requestId;

        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].paid > 0, 'request not found');
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords; //Old one
        s_randomRange = (_randomWords[0] % 100) + 1;
        mapIdToWords[_requestId] = s_randomRange; // New one
        mintAlloy(mapIdToWords[_requestId], mapIdToOreAmount[_requestId], mapIdToAddress[_requestId]);
        emit RequestFulfilled(_requestId, _randomWords, s_requests[_requestId].paid);
    }
    function mintAlloy(uint256 _ranNum, uint256 _mintAmount, address _msgSender) public{
       if (_ranNum < 1000){
           mintIron(_msgSender, _mintAmount);
           withdrawLink();
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

    function withdrawLink() public {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(link.transfer(address(owner()), link.balanceOf(address(this))), 'Unable to transfer');
    }

    
}