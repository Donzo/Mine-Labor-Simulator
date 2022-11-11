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
interface copperToken {
    function mint(address, uint256) external;  
    function transferOwnership(address) external; //to
}
interface nickelToken {
    function mint(address, uint256) external;  
    function transferOwnership(address) external; //to
}
interface goldToken {
    function mint(address, uint256) external;  
    function transferOwnership(address) external; //to
}
interface platinumToken {
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

contract SmeltingContract is VRFV2WrapperConsumerBase, ConfirmedOwner{

    event RequestFulfilled(uint256 requestId, uint256 randomNum, address requestor);

    wETHContract internal constant weth = wETHContract(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
    SwapContract internal constant swCon = SwapContract(0x91Fe1517FDf17Ae2C338602d14A3E156013E61d2);

    address internal oreContractAddress = 0x92C92a9E71a6CFcd39B621eb66804Ac28186849F;
    oreToken oreTokenContract = oreToken(oreContractAddress);

    address internal ironContractAddress = 0xd020ee009eBa367b279546C9Ed47Ba49A0Bcb159;
    ironToken ironTokenContract = ironToken(ironContractAddress);

    address internal copperContractAddress = 0x07FC989B730Fd2F6Fe72c9A3294213cea3DA768e;
    copperToken copperTokenContract = copperToken(copperContractAddress);

    address internal nickelContractAddress = 0x2efe634FAD801A68b86Bbbf153935fd6222A1236;
    nickelToken nickelTokenContract = nickelToken(nickelContractAddress);

    address internal goldContractAddress = 0x01F1Fb3293546e257c7fa94fF04B5ab314bdEe50;
    goldToken goldTokenContract = goldToken(goldContractAddress);

    address internal platinumContractAddress = 0xffb97Dc57c5D891560aAE5AF5460Fcf69a217E64;
    platinumToken platinumTokenContract = platinumToken(platinumContractAddress);

    uint256 public linkIn = 1300000000000000000;
    uint256 internal flatRanNum;
    uint256 internal oreCount;
    uint256 internal oreAllowance;
   
    mapping(uint256 => uint256) public mapIdToWords; //Results to ID
    mapping(uint256 => uint256) public mapIdToOreAmount; //Ore Amount to ID
    mapping(uint256 => address) public mapIdToAddress; //Address to ID
    mapping(uint256 => bool) public mapIdToFulfilled; //Completion Status to ID
    
    uint256 public lastRequestID;

    uint32 callbackGasLimit = 800000;
    uint16 requestConfirmations = 3;
    
    // Address LINK - hardcoded for Goerli
    address linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    // address WRAPPER - hardcoded for Goerli
    address wrapperAddress = 0x708701a1DfF4f478de54383E49a627eD4852C816;

    constructor() ConfirmedOwner(msg.sender) VRFV2WrapperConsumerBase(linkAddress, wrapperAddress) payable{}

    function loadSmelter(uint256 _oreAmount) external payable {
        //Check Allowance
        oreAllowance = oreTokenContract.allowance(msg.sender, address(this));
        require (oreAllowance >= _oreAmount, "Not enough ORE approved.");

        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkIn, msg.value);
        smeltOre(_oreAmount);
    }

    function smeltOre(uint256 _oreAmount)private{
        //Get this because we doing some chainlink stuff.
        oreCount = _oreAmount;

        bool successfulTransfer = oreTokenContract.transferFrom(msg.sender, address(this), _oreAmount);
        
        if (successfulTransfer){  
            //Mint Random Token
            requestRandomWords();
        }
    }
    
    function setLinkIn(uint256 _linkIn) public onlyOwner {
        linkIn = _linkIn;
    }
    
    function requestRandomWords() private returns (uint256 requestId) {
        requestId = requestRandomness(callbackGasLimit, requestConfirmations, 1);
    
        //New Ones
        mapIdToAddress[requestId] = msg.sender;
        mapIdToOreAmount[requestId] = oreCount;
        mapIdToFulfilled[requestId] = false;
        lastRequestID = requestId;
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(mapIdToFulfilled[_requestId] == false, 'request fulfilled already');
        mapIdToFulfilled[_requestId] = true;
        flatRanNum = (_randomWords[0] % 100) + 1; //Flatten the random number.
        mapIdToWords[_requestId] = flatRanNum; //Store it.
        mintAlloy(mapIdToWords[_requestId], mapIdToOreAmount[_requestId], mapIdToAddress[_requestId]);
        emit RequestFulfilled(_requestId, flatRanNum, mapIdToAddress[_requestId]); //ID, NUM, Requestor
    }

    function mintAlloy(uint256 _ranNum, uint256 _mintAmount, address _msgSender) private{
       if (_ranNum > 94){
           mintPlatinum(_msgSender, _mintAmount);
       }
       else if (_ranNum > 84){
          mintGold(_msgSender, _mintAmount); 
       }
       else if (_ranNum > 64){
          mintNickel(_msgSender, _mintAmount); 
       }
       else if (_ranNum > 38){
          mintCopper(_msgSender, _mintAmount); 
       }
       else{
          mintIron(_msgSender, _mintAmount); 
       }
       withdrawLink();
    }
    
    ////////////////.   ALLOY FUNCTIONS   ./////////////////////

    //IRON
    function mintIron(address _msgSender, uint256 _amount) private{
        ironTokenContract.mint(_msgSender, _amount);
    }
    function transferIronContractOwnership(address _toAddress) public onlyOwner{
        ironTokenContract.transferOwnership(_toAddress);
    }
    function changeIronContractAddress(address _ironContractAddress) public onlyOwner {
        ironContractAddress = _ironContractAddress;
    }
    //COPPER
    function mintCopper(address _msgSender, uint256 _amount) private{
        copperTokenContract.mint(_msgSender, _amount);
    }
    function transferCopperContractOwnership(address _toAddress) public onlyOwner{
        copperTokenContract.transferOwnership(_toAddress);
    }
    function changeCopperContractAddress(address _copperContractAddress) public onlyOwner {
        copperContractAddress = _copperContractAddress;
    }
    //NICKEL
    function mintNickel(address _msgSender, uint256 _amount) private{
        nickelTokenContract.mint(_msgSender, _amount);
    }
    function transferNickelContractOwnership(address _toAddress) public onlyOwner{
        nickelTokenContract.transferOwnership(_toAddress);
    }
    function changeNickelContractAddress(address _nickelContractAddress) public onlyOwner {
        nickelContractAddress = _nickelContractAddress;
    }
    //GOLD
    function mintGold(address _msgSender, uint256 _amount) private{
        goldTokenContract.mint(_msgSender, _amount);
    }
    function transferGoldContractOwnership(address _toAddress) public onlyOwner{
        goldTokenContract.transferOwnership(_toAddress);
    }
    function changeGoldContractAddress(address _goldContractAddress) public onlyOwner {
        goldContractAddress = _goldContractAddress;
    }
    //Platinum
    function mintPlatinum(address _msgSender, uint256 _amount) private{
        platinumTokenContract.mint(_msgSender, _amount);
    }
    function transferPlatinumContractOwnership(address _toAddress) public onlyOwner{
        platinumTokenContract.transferOwnership(_toAddress);
    }
    function changePlatinumContractAddress(address _platinumContractAddress) public onlyOwner {
        platinumContractAddress = _platinumContractAddress;
    }

    function withdrawLink() public {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(link.transfer(address(owner()), link.balanceOf(address(this))), 'Unable to transfer');
    }
}