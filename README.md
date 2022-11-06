# Mine-Labor-Simulator
Web 3 game and project for Chainlink Fall 2022 Hackathon. 

Prove your work by mining blocks at <a href='https://minelaborsimulator.com/' target='_blank'> Mine Labor Simulator</a>. 

The player smashes mining blocks repeatedly with a pick axe. It is hard work. Some blocks contain ORE tokens. You can mint the ORE tokens that you mine. 

I wanted the players to pay for the cost of minting the token, so they buy LINK onchain and send it to the contract with the oracle. This contract owns the ORE token contract and will mint it for the requesting player with a successful request.

The contracts have been deployed on Goerli. View them here:

1. <a href='https://goerli.etherscan.io/address/0xd14cCfdA73b3b9e98f872dC51aA05B5b80D900C4#code' target='_blank'>Wrap Eth and Pass to Swap Contract</a>
2. <a href='https://goerli.etherscan.io/address/0xD35c9101485A56A171c038282132556a95504A6E#code' target='_blank'>Swap WETH for LINK Fees Contract</a>
3. <a href='https://goerli.etherscan.io/address/0x6eBA23766A6F905BD0C70Aec6180BE182caCD4f7#code' target='_blank'>GET Request to the Server Using Chainlink Oracle Contract</a>
4. <a href='https://goerli.etherscan.io/address/0x92C92a9E71a6CFcd39B621eb66804Ac28186849F#code' target='_blank'>Ore Token Contract</a>

I am thinking about an ORE release schedule, where ORE becomes harder to mine as supply grows. I also want to create more serverside checks to protect the integrity of the ORE supply. But the next step for me is to integrate VRF so the player can smelt ORE into random elements like iron, copper, or gold.

<h2>VRF Intgration into ORE Smelting</h2>
The game will use Chainlink VRFs to smelt ORE tokens. Here are some of the contracts that I am using:

1. <a href='https://goerli.etherscan.io/address/0xd020ee009eba367b279546c9ed47ba49a0bcb159#code' target='_blank'>Iron Token</a>
2. <a href='https://goerli.etherscan.io/address/0x91fe1517fdf17ae2c338602d14a3e156013e61d2#code' target='_blank'>Buy Link for Smelter</a>

More to come soon.
