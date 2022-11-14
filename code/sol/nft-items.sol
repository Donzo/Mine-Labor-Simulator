// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

//Mine Labor Simulator Item Contract
contract MineLaborSimulatorItems is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Mine Labor Simulator", "MLSI") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        tokenURI(tokenId);
    }

    //Values
    string public armorClass;
    string public description;
    string public imgURL;
    string public itemType;
    string public material;
    string public quality;

    //Build Settings
    bool internal jewelry;
    bool internal helmet;
    bool internal sword;
    bool internal platinum;
    bool internal gold;
    bool internal copper;
    bool internal nickel;
    bool internal iron;

    function setBuild(bool _jewelry, bool _helmet, bool _sword, bool _platinum, bool _gold, bool _copper, bool _nickel, bool _iron) public onlyOwner{
        jewelry = _jewelry;
        helmet = _helmet;
        sword = _sword;
        platinum = _platinum;
        gold = _gold;
        copper = _copper;
        nickel = _nickel;
        iron = _iron;

        if (helmet){
            if (platinum){
                imgURL = "https://minelaborsimulator.com/nft/helmet-platinum.png";
            }
            else if (gold){
                imgURL = "https://minelaborsimulator.com/nft/helmet-gold.png";
            }
            else if (copper){
                imgURL = "https://minelaborsimulator.com/nft/helmet-copper.png";
            }
            else if (nickel){
                imgURL = "https://minelaborsimulator.com/nft/helmet-nickel.png";
            }
            else if (iron){
                imgURL = "https://minelaborsimulator.com/nft/helmet-iron.png";
            }
        }
        else if (jewelry){
            if (platinum){
                imgURL = "https://minelaborsimulator.com/nft/necklace-platinum.png";
            }
            else if (gold){
                imgURL = "https://minelaborsimulator.com/nft/necklace-gold.png";
            }
            else if (copper){
                imgURL = "https://minelaborsimulator.com/nft/necklace-copper.png";
            }
            else if (nickel){
                imgURL = "https://minelaborsimulator.com/nft/necklace-nickel.png";
            }
            else if (iron){
                imgURL = "https://minelaborsimulator.com/nft/necklace-iron.png";
            }
        }
        else if (sword){
            if (platinum){
                imgURL = "https://minelaborsimulator.com/nft/sword-platinum.png";
            }
            else if (gold){
                imgURL = "https://minelaborsimulator.com/nft/sword-gold.png";
            }
            else if (copper){
                imgURL = "https://minelaborsimulator.com/nft/sword-copper.png";
            }
            else if (nickel){
                imgURL = "https://minelaborsimulator.com/nft/sword-nickel.png";
            }
            else if (iron){
                imgURL = "https://minelaborsimulator.com/nft/sword-iron.png";
            }
        }
    }

    function setDescription(string memory _description) public onlyOwner{
        description = _description;
    }
    
    function setValues (string memory _itemType, string memory _material, string memory _quality, string memory _armorClass) public onlyOwner{
        itemType = _itemType;
        material = _material;
        quality = _quality;
        armorClass = _armorClass;
    }
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Mine Labor Simulator Item #', tokenId.toString(), '"'',',
                '"description": ''"', description, '"',',',
                '"external_url": "https://minelaborsimulator.com/"'',',
                '"image": ''"', imgURL, '"',',',
                '"attributes":',
                    '[',
                        '{',
                            '"trait_type": "Item Type"'',', 
                            '"value": ''"', itemType, '"',
                        '}'',',
                        '{',
                            '"trait_type": "Material"'',', 
                            '"value": ''"', material, '"',
                        '}'',',
                        '{',
                            '"trait_type": "Quality"'',',
                            '"max_value": 100'',', 
                            '"value": ', quality,
                        '}'',',
                        '{',
                            '"display_type": "boost_number"'',', 
                            '"trait_type": "Armor Class"'',', 
                            '"max_value": 100'',', 
                            '"value": ', armorClass,
                        '}',
                    ']',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }
}