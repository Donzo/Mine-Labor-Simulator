// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import '@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol';
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol";

interface itemDescriber {
    function calculateCombatRating(uint256, uint256, uint256)external returns (uint256);
    function describeItem(uint256, uint256, uint256, uint256) external returns (string memory); //QR, CR, Item Type, Material
}
interface itemMaker {
    function setBuild(bool, bool, bool, bool, bool, bool, bool, bool) external; //_jewelry, _helmet, _sword, _platinum, _gold, _copper, _nickel, _iron) 
    function setValues (string memory, string memory, string memory, string memory) external; //_itemType, _material, _quality, _armorClass 
    function setDescription(string memory) external; //owner, spender
    function safeMint(address) external;
    function transferOwnership(address) external; //to
}
interface ironToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
}
interface copperToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
}
interface nickelToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
}
interface goldToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
}
interface platinumToken {
    function transferFrom(address, address, uint) external returns (bool); //from to amount
    function allowance(address, address) external returns (uint256); //owner, spender
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

contract ItemMakerContract is VRFV2WrapperConsumerBase, ConfirmedOwner{
    using Strings for uint256;
    event RequestFulfilled(uint256 requestId, uint256 randomNum1, uint256 randomNum2);

    wETHContract internal constant weth = wETHContract(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
    SwapContract internal constant swCon = SwapContract(0x3cEc895e2802E1A2e731e87A476e63682C7BdF4a);

    address internal itemDescriberContractAddress = 0xE93fDFaB027cb135eF2d8419214498918B7d98E4;
    itemDescriber itemDescriberContract = itemDescriber(itemDescriberContractAddress);

    address internal itemMakerContractAddress = 0x54630734636bA61Dd1Ede7E4481Ab0F36ABBDF0D;
    itemMaker itemMakerContract = itemMaker(itemMakerContractAddress);

    address internal ironContractAddress = 0xd020ee009eBa367b279546C9Ed47Ba49A0Bcb159;
    ironToken iTC = ironToken(ironContractAddress); //Iron Token

    address internal copperContractAddress = 0x07FC989B730Fd2F6Fe72c9A3294213cea3DA768e;
    copperToken cTC = copperToken(copperContractAddress); //Copper Token

    address internal nickelContractAddress = 0x2efe634FAD801A68b86Bbbf153935fd6222A1236;
    nickelToken nTC = nickelToken(nickelContractAddress); //Nickel Token

    address internal goldContractAddress = 0x01F1Fb3293546e257c7fa94fF04B5ab314bdEe50;
    goldToken gTC = goldToken(goldContractAddress); //Gold Token

    address internal platinumContractAddress = 0xffb97Dc57c5D891560aAE5AF5460Fcf69a217E64;
    platinumToken pTC = platinumToken(platinumContractAddress); //Platinum Token

    address internal msgSender;

    uint256 public linkIn = 1300000000000000000;
    uint256 internal whichItem;
    uint256 internal whichMetal;
    uint256 internal flatRanNum1;
    uint256 internal flatRanNum2;
    uint256 internal flatRanNum3;
    uint256 internal ironCount;
    uint256 internal ironAllowance;
    uint256 internal nickelCount;
    uint256 internal nickelAllowance;
    uint256 internal copperCount;
    uint256 internal copperAllowance;
    uint256 internal goldCount;
    uint256 internal goldAllowance;
    uint256 internal platinumCount;
    uint256 internal platinumAllowance;

    string internal combatRating;
    string internal qualityScore;

    uint256 internal jewelryCost;
    uint256 internal helmetCost;
    uint256 internal swordCost;

    string internal fullDesc;
   
    mapping(uint256 => uint256) public mapIdToWord1; //Quality to ID
    mapping(uint256 => uint256) public mapIdToWord2; //CR to ID
    mapping(uint256 => uint256) public mapIdToItem; //ID to Item
    mapping(uint256 => uint256) public mapIdToMetal; //ID to Metal
    mapping(uint256 => address) public mapIdToAddress; //Address to ID
    mapping(uint256 => bool) public mapIdToFulfilled; //Completion Status to ID
    
    uint256 public lastRequestID;

    uint32 callbackGasLimit = 800000;
    uint16 requestConfirmations = 3;
    
    // Address LINK - hardcoded for Goerli
    address linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    // address WRAPPER - hardcoded for Goerli
    address wrapperAddress = 0x708701a1DfF4f478de54383E49a627eD4852C816;

    constructor() ConfirmedOwner(msg.sender) VRFV2WrapperConsumerBase(linkAddress, wrapperAddress) payable{
        jewelryCost = 10000000000000000000;
        helmetCost = 100000000000000000000;
        swordCost = 200000000000000000000;
    }
    function getScoresThenMint(uint256 _whichItem, uint256 _whichMetal) private{
        bool sT = false; //Successful Transfer

        if (_whichItem == 1){     
            if (_whichMetal == 1){
                sT = pTC.transferFrom(msg.sender, address(this), jewelryCost);
            }
            else if (_whichMetal == 2){
                sT = gTC.transferFrom(msg.sender, address(this), jewelryCost);
            }
            else if (_whichMetal == 3){
                sT = cTC.transferFrom(msg.sender, address(this), jewelryCost);
            }
            else if (_whichMetal == 4){
                sT = nTC.transferFrom(msg.sender, address(this), jewelryCost);
            }
            else if (_whichMetal == 5){
                sT = iTC.transferFrom(msg.sender, address(this), jewelryCost);
            }
        }
        else if (_whichItem == 2){     
            if (_whichMetal == 1){
                sT = pTC.transferFrom(msg.sender, address(this), helmetCost);
            }
            else if (_whichMetal == 2){
                sT = gTC.transferFrom(msg.sender, address(this), helmetCost);
            }
            else if (_whichMetal == 3){
                sT = cTC.transferFrom(msg.sender, address(this), helmetCost);
            }
            else if (_whichMetal == 4){
                sT = nTC.transferFrom(msg.sender, address(this), helmetCost);
            }
            else if (_whichMetal == 5){
                sT = iTC.transferFrom(msg.sender, address(this), helmetCost);
            }
        }
        else if (_whichItem == 3){     
            if (_whichMetal == 1){
                sT = pTC.transferFrom(msg.sender, address(this), swordCost);
            }
            else if (_whichMetal == 2){
                sT = gTC.transferFrom(msg.sender, address(this), swordCost);
            }
            else if (_whichMetal == 3){
                sT = cTC.transferFrom(msg.sender, address(this), swordCost);
            }
            else if (_whichMetal == 4){
                sT = nTC.transferFrom(msg.sender, address(this), swordCost);
            }
            else if (_whichMetal == 5){
                sT = iTC.transferFrom(msg.sender, address(this), swordCost);
            }
        }
        
        if (sT){
            whichItem = _whichItem;
            whichMetal = _whichMetal;     
            //Mint Random Token
            requestRandomWords();
        }

    }
    function makeItem(uint256 _whichItem, uint256 _whichMetal) external payable {
        //1 platinum, 2 gold, 3 copper, 4 nickel, 5 iron || 1 jewelry, 2 helmet, 3 sword
        msgSender = msg.sender;
        weth.deposit{value: msg.value}();
        weth.approve(address(swCon), msg.value);
        swCon.swapExactOutputSingle(linkIn, msg.value);

        //Jewelry
        if (_whichItem == 1){
            if (_whichMetal == 1){
                //Check Allowance
                platinumAllowance = pTC.allowance(msg.sender, address(this));
                require (platinumAllowance >= jewelryCost, "Not enough PLATINUM approved.");
                getScoresThenMint(1,1); 
            }
            else if (_whichMetal == 2){
                //Check Allowance
                goldAllowance = gTC.allowance(msg.sender, address(this));
                require (goldAllowance >= jewelryCost, "Not enough GOLD approved.");
                getScoresThenMint(1,2); 
            }
            else if (_whichMetal == 3){
                //Check Allowance
                copperAllowance = cTC.allowance(msg.sender, address(this));
                require (copperAllowance >= jewelryCost, "Not enough COPPER approved."); 
                getScoresThenMint(1,3); 
            }
            else if (_whichMetal == 4){
                //Check Allowance
                nickelAllowance = nTC.allowance(msg.sender, address(this));
                require (nickelAllowance >= jewelryCost, "Not enough NICKEL approved.");
                getScoresThenMint(1,4); 
            }
            else if (_whichMetal == 5){
                //Check Allowance
                ironAllowance = iTC.allowance(msg.sender, address(this));
                require (ironAllowance >= jewelryCost, "Not enough IRON approved.");
                getScoresThenMint(1,5); 
            }
        }
        //Helmet
        else if (_whichItem == 2){
            if (_whichMetal == 1){
                //Check Allowance
                platinumAllowance = pTC.allowance(msg.sender, address(this));
                require (platinumAllowance >= helmetCost, "Not enough PLATINUM approved.");
                getScoresThenMint(2,1); 
            }
            else if (_whichMetal == 2){
                //Check Allowance
                goldAllowance = gTC.allowance(msg.sender, address(this));
                require (goldAllowance >= helmetCost, "Not enough GOLD approved."); 
                getScoresThenMint(2,2); 
            }
            else if (_whichMetal == 3){
                //Check Allowance
                copperAllowance = cTC.allowance(msg.sender, address(this));
                require (copperAllowance >= helmetCost, "Not enough COPPER approved.");
                getScoresThenMint(2,3); 
            }
            else if (_whichMetal == 4){
                //Check Allowance
                nickelAllowance = nTC.allowance(msg.sender, address(this));
                require (nickelAllowance >= helmetCost, "Not enough NICKEL approved.");
                getScoresThenMint(2,4); 
            }
            else if (_whichMetal == 5){
                //Check Allowance
                ironAllowance = iTC.allowance(msg.sender, address(this));
                require (ironAllowance >= helmetCost, "Not enough IRON approved.");
                getScoresThenMint(2,5); 
            }
        }
        //Sword
        else if (_whichItem == 3){
            if (_whichMetal == 1){
                //Check Allowance
                platinumAllowance = pTC.allowance(msg.sender, address(this));
                require (platinumAllowance >= swordCost, "Not enough PLATINUM approved.");
                getScoresThenMint(3,1); 
            }
            else if (_whichMetal == 2){
                //Check Allowance
                goldAllowance = gTC.allowance(msg.sender, address(this));
                require (goldAllowance >= swordCost, "Not enough GOLD approved.");
                getScoresThenMint(3,2);  
            }
            else if (_whichMetal == 3){
                //Check Allowance
                copperAllowance = cTC.allowance(msg.sender, address(this));
                require (copperAllowance >= swordCost, "Not enough COPPER approved."); 
                getScoresThenMint(3,3); 
            }
            else if (_whichMetal == 4){
                //Check Allowance
                nickelAllowance = nTC.allowance(msg.sender, address(this));
                require (nickelAllowance >= swordCost, "Not enough NICKEL approved.");
                getScoresThenMint(3,4); 
            }
            else if (_whichMetal == 5){
                //Check Allowance
                ironAllowance = iTC.allowance(msg.sender, address(this));
                require (ironAllowance >= swordCost, "Not enough IRON approved.");
                getScoresThenMint(3,5); 
            }
        }
    }
    
    function requestRandomWords() private returns (uint256 requestId) {
        requestId = requestRandomness(callbackGasLimit, requestConfirmations, 2);
    
        //New Ones
        mapIdToAddress[requestId] = msg.sender;
        mapIdToItem[requestId] = whichItem;
        mapIdToMetal[requestId] = whichMetal;
        mapIdToFulfilled[requestId] = false;
        lastRequestID = requestId;
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(mapIdToFulfilled[_requestId] == false, 'request fulfilled already');
        mapIdToFulfilled[_requestId] = true;
        flatRanNum1 = (_randomWords[0] % 100) + 1; //Quality
        flatRanNum2 = (_randomWords[1] % 60) + 1; //Combat Rating
        mapIdToWord1[_requestId] = flatRanNum1; //Store it.
        mapIdToWord2[_requestId] = flatRanNum2; //Store it.
        mintItem(_requestId);
        emit RequestFulfilled(_requestId, flatRanNum1, flatRanNum2); //ID, NUM1, NUM2
    }

    function mintItem(uint256 _requestId) private{
        
        //Call Describe Function Here;
        uint256 totalCR = itemDescriberContract.calculateCombatRating(mapIdToWord1[_requestId], mapIdToWord2[_requestId], mapIdToMetal[_requestId]); //uint256 _qualityRating, uint256 _combatRating, uint256 _itemMaterial
        fullDesc = itemDescriberContract.describeItem(mapIdToWord1[_requestId], mapIdToWord2[_requestId],mapIdToItem[_requestId],mapIdToMetal[_requestId]);   //QR, CR, Item Type, Material);

        //Set Description
        itemMakerContract.setDescription(fullDesc);
        
        //Stringify These for Base64 Conversion in Item Metadata
        qualityScore = mapIdToWord1[_requestId].toString();
        combatRating = totalCR.toString();

       //Jewelry
       if (mapIdToItem[_requestId] == 1){
           if (mapIdToMetal[_requestId] == 1){
               itemMakerContract.setBuild(true, false, false, true, false, false, false, false); //_jewelry, _helmet, _sword, _platinum, _gold, _copper, _nickel, _iron)
               itemMakerContract.setValues ("Jewelry", "Platinum", qualityScore, combatRating); //_itemType, _material, _quality, _armorClass
           }
           else if (mapIdToMetal[_requestId] == 2){
               itemMakerContract.setBuild(true, false, false, false, true, false, false, false);
               itemMakerContract.setValues ("Jewelry", "Gold", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 3){
               itemMakerContract.setBuild(true, false, false, false, false, true, false, false);
               itemMakerContract.setValues ("Jewelry", "Copper", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 4){
               itemMakerContract.setBuild(true, false, false, false, false, false, true, false);
               itemMakerContract.setValues ("Jewelry", "Nickel", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 5){
               itemMakerContract.setBuild(true, false, false, false, false, false, false, true);
               itemMakerContract.setValues ("Jewelry", "Iron", qualityScore, combatRating);
           }   
       }
       //Helmet
       else if (mapIdToItem[_requestId] == 2){
           if (mapIdToMetal[_requestId] == 1){
               itemMakerContract.setBuild(false, true, false, true, false, false, false, false); //_jewelry, _helmet, _sword, _platinum, _gold, _copper, _nickel, _iron)
               itemMakerContract.setValues ("Helmet", "Platinum", qualityScore, combatRating); //_itemType, _material, _quality, _armorClass
           }
           else if (mapIdToMetal[_requestId] == 2){
               itemMakerContract.setBuild(false, true, false, false, true, false, false, false);
               itemMakerContract.setValues ("Helmet", "Gold", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 3){
               itemMakerContract.setBuild(false, true, false, false, false, true, false, false);
               itemMakerContract.setValues ("Helmet", "Copper", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 4){
               itemMakerContract.setBuild(false, true, false, false, false, false, true, false);
               itemMakerContract.setValues ("Helmet", "Nickel", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 5){
               itemMakerContract.setBuild(false, true, false, false, false, false, false, true);
               itemMakerContract.setValues ("Helmet", "Iron", qualityScore, combatRating);
           }  
       }
       //Sword
       else if (mapIdToItem[_requestId] == 3){
           if (mapIdToMetal[_requestId] == 1){
               itemMakerContract.setBuild(false, false, true, true, false, false, false, false); 
               itemMakerContract.setValues ("Sword", "Platinum", qualityScore, combatRating); 
           }
           else if (mapIdToMetal[_requestId] == 2){
               itemMakerContract.setBuild(false, false, true, false, true, false, false, false);
               itemMakerContract.setValues ("Sword", "Gold", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 3){
               itemMakerContract.setBuild(false, false, true, false, false, true, false, false);
               itemMakerContract.setValues ("Sword", "Copper", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 4){
               itemMakerContract.setBuild(false, false, true, false, false, false, true, false);
               itemMakerContract.setValues ("Sword", "Nickel", qualityScore, combatRating);
           }
           else if (mapIdToMetal[_requestId] == 5){
               itemMakerContract.setBuild(false, false, true, false, false, false, false, true);
               itemMakerContract.setValues ("Sword", "Iron", qualityScore, combatRating);
           }  
       }
       itemMakerContract.safeMint(mapIdToAddress[_requestId]);
       withdrawLink();
    }
    function setLinkIn(uint256 _linkIn) public onlyOwner {
        linkIn = _linkIn;
    }
    function changeItemMakerContractOwnership(address _newOwner) public onlyOwner{
        itemMakerContract.transferOwnership(_newOwner);
    }
    function changeItemMakerContract(address _itemMakerContractAddress) public onlyOwner {
        itemMakerContractAddress = _itemMakerContractAddress;
    }
    function changeItemDescriberContract(address _itemDescriberContractAddress) public onlyOwner {
        itemDescriberContractAddress = _itemDescriberContractAddress;
    }
    function setJewleryCost(uint256 _jewelryCost) public onlyOwner{
        jewelryCost = _jewelryCost;
    }
    function setHelmetCost(uint256 _helmetCost) public onlyOwner{
        helmetCost = _helmetCost;
    }
    function setSwordCost(uint256 _swordCost) public onlyOwner{
        swordCost = _swordCost;
    }
    function withdrawLink() public {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(link.transfer(address(owner()), link.balanceOf(address(this))), 'Unable to transfer');
    }
}