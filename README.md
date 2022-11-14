# Mine Labor Simulator
Web 3 game and project for the Chainlink Fall 2022 Hackathon. 

<h3>Play Now</h3>
Prove your work by mining blocks at <a href='https://minelaborsimulator.com/' target='_blank'> Mine Labor Simulator</a>. 

<h2>Mint Ore Tokens with ANY API Request</h2>
In this game players break blocks with a pick axe. <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/php/check-for-ore.php' target='_blank'>Some blocks contain ORE tokens</a>. ORE tokens are stored serverside in the database until the player <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/js/mint-ore.php' target='_blank'>MINTs</a> them. 

In order to MINT the ORE tokens, the player <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/sol/eth-wrap-and-swap.sol' target='_blank'>wraps ETH</a> and <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/sol/buyLink.sol' target='_blank'>swaps it for LINK tokens</a>. The LINK tokens are sent to <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/sol/oreQueryAndMint.%10sol' target='_blank'>the MINTING contract</a>, which uses <strong>ANY API to GET the player's ORE balance</strong> and MINTS that amount of ORE tokens. 

<h3>Contracts for MINTING ORE</h3>

The contracts for MINTING ORE have been deployed on Goerli. View them here:

1. <a href='https://goerli.etherscan.io/address/0xd14cCfdA73b3b9e98f872dC51aA05B5b80D900C4#code' target='_blank'>Wrap Eth and Pass to Swap Contract</a>
2. <a href='https://goerli.etherscan.io/address/0xD35c9101485A56A171c038282132556a95504A6E#code' target='_blank'>Swap WETH for LINK Fees Contract</a>
3. <a href='https://goerli.etherscan.io/address/0x0701dba7588e9908c12d88d14aa02297354f9e11#code' target='_blank'>GET Request to the Server Using Chainlink Oracle Contract</a>
4. <a href='https://goerli.etherscan.io/address/0x92C92a9E71a6CFcd39B621eb66804Ac28186849F#code' target='_blank'>Ore Token Contract</a>

After minting the ORE tokens, the players in-game ORE balance drops to zero. The ORE tokens now live in the players Web3 wallet. <strong>But what can the player do with ORE tokens?</strong>


<h2>Smelt Ore with VRF Intgration</h2>

Once the players ORE tokens have been minted into their web3 wallet, they can <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/js/smelt-ore.php' target='_blank'>SMELT their ORE tokens</a>. Players goes to the blacksmith shop in-game. In this shop players are presented with the option to SMELT their ORE tokens.  

The process of SMELTING ORE involves transferring the ORE tokens to <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/sol/smelter.sol' target='_blank'>a smart contract, which makes a Chainlink VRF request</a>. Before doing this, the player swaps some ETH for some LINK to <a href='https://github.com/Donzo/Mine-Labor-Simulator/blob/main/code/sol/load-smelter.sol' target='_blank'>FUEL THE SMELTER</a>.

Once the smelter has been fueled and the player has transferred his or her ORE tokens, the SMELTING contract makes a VRF request. Based on the result, <strong>the SMELTING contract will MINT one of several METAL tokens of varying rarirty: IRON, NICKEL, COPPER, GOLD, or PLATINUM</strong>.

<h3>Contracts for SMELTING ORE</h3>

The contracts for SMELTING ORE been deployed on Goerli. View them here:

1. <a href='https://goerli.etherscan.io/address/0x9f659da618419a3baddb9a2a9cb2bb8a1584237f#code' target='_blank'>Smelting Contract</a>
2. <a href='https://goerli.etherscan.io/address/0x91fe1517fdf17ae2c338602d14a3e156013e61d2#code' target='_blank'>Swap Contract for Smelter</a>
3. <a href='https://goerli.etherscan.io/address/0xd020ee009eba367b279546c9ed47ba49a0bcb159#code' target='_blank'>Iron Token</a>
4. <a href='https://goerli.etherscan.io/address/0x07fc989b730fd2f6fe72c9a3294213cea3da768e#code' target='_blank'>Copper Token</a>
5. <a href='https://goerli.etherscan.io/address/0x2efe634fad801a68b86bbbf153935fd6222a1236#code' target='_blank'>Nickel Token</a>
6. <a href='https://goerli.etherscan.io/address/0x01f1fb3293546e257c7fa94ff04b5ab314bdee50#code' target='_blank'>Gold Token</a>
7. <a href='https://goerli.etherscan.io/address/0xffb97dc57c5d891560aae5af5460fcf69a217e64#code' target='_blank'>Platinum Token</a>

After SMELTING the ORE tokens, the player will no longer have ORE tokens in his or her wallet. Instead the player will receive METAL tokens based on the VRF result. These METAL tokens will live in the player's Web3 wallet. <strong>But what can the player do with METAL tokens?</strong>

<h2>Create NFT ITEMS with VRF Integration</h2>

Once players have METAL tokens created from smelting ORE tokens, they can create NFT Items. These items vary by TYPE, MATERIAL, QUALITY, and COMBAT RATING. The TYPE of item is chosen by the player based on how many METAL tokens he or she is willing to spend. The MATERIAL is determined by which METAL token the player will spend to create the item (IRON, NICKEL, COPPER, GOLD, or PLATINUM). The QUALITY and COMBAT RATING of the items are determined by Chainlink VRF requests. 

<strong>The results of the VRF requests are used in the NFT Item metadata, which is encoded to Base64 and stored onchain.</strong> 


1. <a href='https://goerli.etherscan.io/address/0x54630734636ba61dd1ede7e4481ab0f36abbdf0d#code' target='_blank'>NFT Items Minting Contract</a>
2. <a href='https://goerli.etherscan.io/address/0xcf6646999d5c191058b2e8ab1aa59a03d8c8b43c#code' target='_blank'>NFT Description Generator</a>
