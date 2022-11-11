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
		var smeltingContractAddress = '0x9f659Da618419A3BADdB9a2a9cb2bB8a1584237F'; //Gonna need to change this if IT DOESNT WORK CHECK HERE.
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
		ig.game.txtBoxTxt = "The smelter needs LINK. It costs ETH. Pay this much and I will smelt your ORE into a random METAL.";
		let web3 = new Web3(Web3.givenProvider);
		var smeltingContractAddress = '0x9f659Da618419A3BADdB9a2a9cb2bB8a1584237F';	
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
			value: web3.utils.toWei("0.0015", "ether"),
			gas: 1200000,
		}).on('receipt', function(receipt){
			waitForOracle();
			
			ig.game.txtBoxTxt = "I have smelted your ORE. We must wait a little bit to see which metal you mined. .";
			ig.game.textBoxTicker = true;
		});
	}
	async function waitForOracle(){
		let web3 = new Web3(Web3.givenProvider);
		var smeltingContractAddress = '0x9f659Da618419A3BADdB9a2a9cb2bB8a1584237F';	
		var contract = new web3.eth.Contract(abi4, smeltingContractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		
		const changeTextSoon = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "The smoke is still clearing. We will see what you smelted shortly. .";
			}
		}, 15000);
		
		const changeTextSoon2 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Almost done. Give me just another block or two. .";
			}
		}, 30000);
		
		const changeTextSoon3 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Is it just me? It seems like it's taking longer than usual for these blocks to confirm. .";
			}
		}, 45000);
		
		const changeTextSoon4 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Back in my day, blocks were mined by GPUs and consumed a tremendous amount of energy. .";
			}
		}, 60000);
		
		const changeTextSoon5 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "I used to wear an onion on my belt back then because that was the style at the time. .";
			}
		}, 75000);
		
		myRequestID = await contract.methods.lastRequestID.call();
		console.log('myRequestID = ' + myRequestID);
		contract.events.RequestFulfilled({
			filter: {requestId: myRequestID}, // Using an array means OR: e.g. 20 or 23
			fromBlock: "pending"
		}, function(error, event){ console.log(event); })
		.on('data', function(event){
			console.log("data:");
			console.log("random num = " + event.returnValues.randomNum);
			console.log("requestor = " + event.returnValues.requestor); 
			console.log(event); // same results as the optional callback above
			ig.game.textBoxTicker = false;
			var _ranNum = event.returnValues.randomNum;
			var alloyName = "IRON";
			var afterThought = " That's useful for forging weapons. It can also be further refined to make steel.";
			
			if (_ranNum > 94){
				alloyName = "PLATINUM";
				afterThought = " Wow. That's the MOST RARE and valuable metal.";
			}
			else if (_ranNum > 84){
				alloyName = "GOLD";
				afterThought = " That's HARD TO FIND and useful for making jewelry.";
			}
			else if (_ranNum > 64){
				alloyName = "NICKEL";
				afterThought = " That useful for armor plating.";
			}
			else if (_ranNum > 38){
				alloyName = "COPPER";
				afterThought = " That metal has many industrial applications.";
			}

			ig.game.txtBoxTxt = "You smelted " + alloyName + "!" + afterThought;
			ig.game.confirmButtonsExist = false;
			
		})
		.on('changed', function(event){
			console.log("changed:");
			console.log(event); 
			// remove event from local database
		})
		.on('error', console.error);
	}
	
	
</script>
