<script>
	var metalTokenBalance;
	
	async function getMetalsBalance(){
		
		let web3 = new Web3(Web3.givenProvider);
		
		//Get Iron
		var ironContractAddress = '0xd020ee009eBa367b279546C9Ed47Ba49A0Bcb159';
		var ironContract = new web3.eth.Contract(abi3, ironContractAddress, {});
		const result = await ironContract.methods.balanceOf(window['userAccountNumber']).call();
		window.ironInWallet = result;
		const ironInWalletFlat = Math.round(web3.utils.fromWei(result) * 100) / 100;
  		//console.log("ironInWallet: " + ironInWalletFlat);
  		ig.game.pData.ironBalance = ironInWalletFlat;
  		
  		//Get Copper
		var copperContractAddress = '0x07FC989B730Fd2F6Fe72c9A3294213cea3DA768e';
		var copperContract = new web3.eth.Contract(abi3, copperContractAddress, {});
		const result2 = await copperContract.methods.balanceOf(window['userAccountNumber']).call();
		window.copperInWallet = result2;
		const copperInWalletFlat = Math.round(web3.utils.fromWei(result2) * 100) / 100;
  		//console.log("copperInWallet: " + copperInWalletFlat);
  		ig.game.pData.copperBalance = copperInWalletFlat;
  		
  		//Get Nickel
		var nickelContractAddress = '0x2efe634FAD801A68b86Bbbf153935fd6222A1236';
		var nickelContract = new web3.eth.Contract(abi3, nickelContractAddress, {});
		const result3 = await nickelContract.methods.balanceOf(window['userAccountNumber']).call();
		window.nickelInWallet = result3;
		const nickelInWalletFlat = Math.round(web3.utils.fromWei(result3) * 100) / 100;
  		//console.log("nickelInWallet: " + nickelInWalletFlat);
  		ig.game.pData.nickelBalance = nickelInWalletFlat;
  		
  		//Get Gold
		var goldContractAddress = '0x01F1Fb3293546e257c7fa94fF04B5ab314bdEe50';
		var goldContract = new web3.eth.Contract(abi3, goldContractAddress, {});
		const result4 = await goldContract.methods.balanceOf(window['userAccountNumber']).call();
		window.goldInWallet = result4;
		const goldInWalletFlat = Math.round(web3.utils.fromWei(result4) * 100) / 100;
  		//console.log("goldInWallet: " + goldInWalletFlat);
  		ig.game.pData.goldBalance = goldInWalletFlat;
  		
  		//Get Platinum
  		var platinumContractAddress = '0xffb97Dc57c5D891560aAE5AF5460Fcf69a217E64';
		var platinumContract = new web3.eth.Contract(abi3, platinumContractAddress, {});
		const result5 = await platinumContract.methods.balanceOf(window['userAccountNumber']).call();
		window.platinumInWallet = result5;
		const platinumInWalletFlat = Math.round(web3.utils.fromWei(result5) * 100) / 100;
  		//console.log("platinumInWallet: " + platinumInWalletFlat);
  		ig.game.pData.platinumBalance = platinumInWalletFlat;
	}
	
	async function checkAllowance(item, metal){
		
		let web3 = new Web3(Web3.givenProvider);
		var contractAddress;
		
		if (metal == 'platinum'){
			contractAddress = '0xffb97Dc57c5D891560aAE5AF5460Fcf69a217E64';
			metalTokenBalance = window.platinumInWallet;
		}
		else if (metal == 'gold'){
			contractAddress = '0x01F1Fb3293546e257c7fa94fF04B5ab314bdEe50';
			metalTokenBalance = window.goldInWallet;
		}
		else if (metal == 'copper'){
			contractAddress = '0x07FC989B730Fd2F6Fe72c9A3294213cea3DA768e';
			metalTokenBalance = window.copperInWallet;
		}
		else if (metal == 'nickel'){
			contractAddress = '0x2efe634FAD801A68b86Bbbf153935fd6222A1236';
			metalTokenBalance = window.nickelInWallet;
		}
		else if (metal == 'iron'){
			contractAddress = '0xd020ee009eBa367b279546C9Ed47Ba49A0Bcb159';
			metalTokenBalance = window.ironInWallet;
		}
		//console.log('metal = ' + metal + ' and contractAddress = ' + contractAddress)
		var itemMakerContractAddress = '0x232ec3316BebCdf62f8ad81f1e1Ee9d5cA8898dA'; //Gonna need to change this if IT DOESNT WORK CHECK HERE.
		var contract = new web3.eth.Contract(abi3, contractAddress, {});
		const allowance = await contract.methods.allowance(window['userAccountNumber'], itemMakerContractAddress).call();
		//console.log('my ' + metal + ' allowance = ' + allowance);
		
		
		
		if (parseInt(allowance) < parseInt(metalTokenBalance)){
			console.log('he needs to approve more ' + metal + ' to spend.');
			var amount = 9999999999999999;
			var approveNum =  web3.utils.toWei(amount.toString(), 'ether')
			ig.game.txtBoxTxt = "I need permission to spend your " + metal + ". Sign here.";
			const approveAmount = await contract.methods.approve(itemMakerContractAddress,approveNum).send({
				from: window['userAccountNumber']
			}).on('receipt', function(receipt){
				makeIt(item, metal);
			});
		}
		else{
			makeIt(item, metal);
		}
		
	}
	async function makeIt(item, metal){
		ig.game.txtBoxTxt = "We must buy some LINK to make your " + metal + " " + item + ". Sign here to pay for it.";
		
		var thisItem;
		var thisMetal;
		
		
		//Set Item Var
		if (item == "necklace"){
			thisItem = 1;
		}
		else if (item == "helmet"){
			thisItem = 2;
		}
		else if (item == "sword"){
			thisItem = 3;
		}
		//Set Metal Var
		if (metal == "platinum"){
			thisMetal = 1;
		}
		else if (metal == "gold"){
			thisMetal = 2;
		}
		else if (metal == "copper"){
			thisMetal = 3;
		}
		else if (metal == "nickel"){
			thisMetal = 4;
		}
		else if (metal == "iron"){
			thisMetal = 5;
		}
		
		
		let web3 = new Web3(Web3.givenProvider);
		var itemMakerContractAddress = '0x232ec3316BebCdf62f8ad81f1e1Ee9d5cA8898dA';	
		var contract = new web3.eth.Contract(abi5, itemMakerContractAddress, {});
		await contract.methods.makeItem(thisItem, thisMetal).send({
			from: window['userAccountNumber'],
			//value: web3.utils.toWei(sendEth, "ether"),
			value: web3.utils.toWei("0.02", "ether"),
			gas: 1500000,
			maxPriorityFeePerGas:5000000000
			
		}).on('receipt', function(receipt){
			waitForOracle2();
			
			ig.game.txtBoxTxt = "I have created your ITEM. But it's too hot to hold right now. .";
			ig.game.textBoxTicker = true;
		});
	}
	async function waitForOracle2(){
		ig.game.confirmButtonsExist = false;
		
		let web3 = new Web3(Web3.givenProvider);
		var itemMakerContractAddress = '0x232ec3316BebCdf62f8ad81f1e1Ee9d5cA8898dA';	
		var contract = new web3.eth.Contract(abi5, itemMakerContractAddress, {});
		 
		const changeTextSoon = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "I can't wait to see your item. .";
			}
		}, 15000);
		
		const changeTextSoon2 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "It's going to be so cool. .";
			}
		}, 30000);
		
		const changeTextSoon3 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "It's cooling down right now. .";
			}
		}, 45000);
		
		const changeTextSoon4 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "You're going to love this item. .";
			}
		}, 60000);
		
		const changeTextSoon5 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Hold on now, almost done. .";
			}
		}, 75000);
		
		const changeTextSoon6 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Just give me one second. I have some food stuck in my beard. .";
			}
		}, 90000);
		
		const changeTextSoon7 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "Ok, ok this time for real. .";
			}
		}, 105000);
		
		const changeTextSoon8 = setTimeout(function(){ 
			if (ig.game.textBoxTicker){
				ig.game.txtBoxTxt = "I think it's ready. .";
			}
		}, 120000);
		
		myRequestID = await contract.methods.lastRequestID.call();
		console.log('myRequestID = ' + myRequestID);
		contract.events.RequestFulfilled({
			filter: {requestId: myRequestID}, 
			fromBlock: "pending"
		}, function(error, event){ console.log(event); })
		.on('data', function(event){
			//console.log("random num1 = " + event.returnValues.randomNum1);
			//console.log("random num2 = " + event.returnValues.randomNum2);
			console.log(event); 
			ig.game.textBoxTicker = false;
			ig.game.playSmeltOre();
			var _quality = event.returnValues.randomNum1;
			var _combatRating = event.returnValues.randomNum2;
			
			ig.game.txtBoxTxt = "Your item has a quality rating of " + _quality + " and a combat rating of " + _combatRating + "!";
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