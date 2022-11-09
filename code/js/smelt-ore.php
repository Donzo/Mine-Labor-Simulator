<script>
	var myRequestID;
	
	async function getOreBalance(){
		
		let web3 = new Web3(Web3.givenProvider);
		var contractAddress = '0x92C92a9E71a6CFcd39B621eb66804Ac28186849F';
		
		var contract = new web3.eth.Contract(abi3, contractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		
		const result = await contract.methods.balanceOf(window['userAccountNumber']).call();
		window.oreInWallet = result;
		const formattedResult = Math.round(web3.utils.fromWei(result) * 100) / 100;
		
		
		 // 29803630997051883414242659
  
 // const format = Web3Client.utils.fromWei(result); // 29803630.997051883414242659

  		console.log("Ore Balance: " + formattedResult);
  		ig.game.pData.oreWalletBalance = formattedResult;
	}
	async function smeltMyOre(){
		
		let web3 = new Web3(Web3.givenProvider);
		var contractAddress = '0x92C92a9E71a6CFcd39B621eb66804Ac28186849F';
		var smeltingContractAddress = '0xe9E49336Df07dC2B3b8Dd1fF8FeA5577fe702FA4'; //Gonna need to change this if IT DOESNT WORK CHECK HERE.
		var contract = new web3.eth.Contract(abi3, contractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		const allowance = await contract.methods.allowance(window['userAccountNumber'], smeltingContractAddress).call();
		
		console.log('my allowance = ' + allowance);
		
		if (parseInt(allowance) < parseInt(window.oreInWallet)){
			console.log('he needs to approve more ORE spend.');
			var amount = 9999999999999999;
			var approveNum =  web3.utils.toWei(amount.toString(), 'ether')
			ig.game.txtBoxTxt = "You have to give me permission to melt your ORE. Please approve this transaction.";
			const approveAmount = await contract.methods.approve(smeltingContractAddress,approveNum).send({
				from: window['userAccountNumber']
			}).on('receipt', function(receipt){
				smeltIt();
			});
		}
		else{
			smeltIt();
		}
		
	}
	async function smeltIt(){
		ig.game.txtBoxTxt = "The smelter is powered by LINK. It costs this much. Once you sign this transaction, I will smelt your ORE into a random METAL.";
		let web3 = new Web3(Web3.givenProvider);
		var smeltingContractAddress = '0xe9E49336Df07dC2B3b8Dd1fF8FeA5577fe702FA4';	
		var contract = new web3.eth.Contract(abi4, smeltingContractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		await contract.methods.loadSmelter('1000000000').send({
		//This the real line but little number above for debugging
		//await contract.methods.loadSmelter(window.oreInWallet).send({
			from: window['userAccountNumber'],
			value: web3.utils.toWei("0.00015", "ether"),
			gas: 1000000,
		}).on('receipt', function(receipt){
			waitForOracle();
			
			ig.game.txtBoxTxt = "I have smelted your ORE. Check your wallet in a few blocks to see which METAL you earned.";
		});
	}
	async function waitForOracle(){
		let web3 = new Web3(Web3.givenProvider);
		var smeltingContractAddress = '0xe9E49336Df07dC2B3b8Dd1fF8FeA5577fe702FA4';	
		var contract = new web3.eth.Contract(abi4, smeltingContractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		
		myRequestID = await contract.methods.lastRequestID.call();
		console.log('myRequestID = ' + myRequestID);
		contract.events.RequestFulfilled({
			filter: {requestId: myRequestID}, // Using an array means OR: e.g. 20 or 23
			fromBlock: 0
		}, function(error, event){ console.log(event); })
		.on('data', function(event){
			console.log(event); // same results as the optional callback above
		})
		.on('changed', function(event){
			// remove event from local database
		})
		.on('error', console.error);
	}
	
	
</script>
