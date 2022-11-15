<script>
	var gasPriceEstimate;
	var sendEth;
	var myVal;
	
	function prepareMint(){
		let web3 = new Web3(Web3.givenProvider);
		web3.eth.getGasPrice().then((result) => {
			//Get estimated Gas
			gasPriceEstimate = web3.utils.fromWei(result, 'gwei');
			gasPriceEstimate = gasPriceEstimate.toString();
			gasPriceEstimate = gasPriceEstimate.replace('.', '');
	
		}).then(()=>{
            estimateEth();
        })
        .then(()=>{
			var request = new XMLHttpRequest();
			
			request.onreadystatechange = function() {
    			if( request.readyState == request.DONE && request.status == 200 ) {
       				//console.log( 'server', request.getResponseHeader('server') );
       				var dbToken = request.responseText;
       				ig.game.pData.tkn = dbToken;
	       			mintSomeOre();
	       			ig.game.textBox = true;
					ig.game.txtBoxTxt = "Sign this transaction.";
					ig.game.txtBoxTxtSize = 2;
					ig.game.txtBoxHeight = .25;
				}
			
			};
			request.open('GET', 'https://minelaborsimulator.com/code/php/reset-ore-token.php?wallet=' + window['userAccountNumber']);
			request.send();
        });
        
	}
	
	async function estimateEth(){
		let web3 = new Web3(Web3.givenProvider);
		var myContractAddress = '0xD35c9101485A56A171c038282132556a95504A6E';
		var myContract = new web3.eth.Contract(abi2, myContractAddress, {});
		requiredEth = (await myContract.methods.getEstimatedETHforLINK("100000000000000000").call())[0];
		sendEth = Math.ceil(requiredEth * 15000);
	}
	
	async function mintSomeOre(){
						
		let web3 = new Web3(Web3.givenProvider);

		var contractAddress = '0xd14cCfdA73b3b9e98f872dC51aA05B5b80D900C4';
		//sendEth = await estimateEth();
		//sendEth = await sendEth.toString()
		//myVal = web3.utils.toWei(sendEth, "Gwei");
		myVal = web3.utils.toWei("0.001", "ether"),
		
		console.log("zmyVal = " + myVal);
		var contract = new web3.eth.Contract(abi1, contractAddress, {});
			
		//var metadataURI = "https://nftest.net" + pathToMyResults;
		console.log('String(ig.game.pData.tkn) = ' + String(ig.game.pData.tkn));
		contract.methods.mintOre(String(ig.game.pData.tkn)).send({
			from:window['userAccountNumber'],
			value:myVal,
			gas: 600000,
			maxPriorityFeePerGas:5000000000
		}, function(){
			ig.game.textBox = true;
			ig.game.txtBoxTxt = "You are extracting your ORE. .";
			ig.game.txtBoxTxtSize = 2;
			ig.game.txtBoxHeight = .25;
			ig.game.textBoxTicker = true;
			console.log('mining transaction');
		})
		.on('receipt', function(receipt){
    		
    		console.log('Ore Minted.');
    		ig.game.textBox = true;
			ig.game.turnOffTextBox = true;
			ig.game.turnOffTextBoxTimer.set(3);
			ig.game.txtBoxTxtSize = 2;
			ig.game.txtBoxHeight = .25;
			ig.game.pData.ore = 0;
			ig.game.txtBoxTxt = "Success! Transaction Mined. Ore Extracted.";
			ig.game.textBoxTicker = false;
			ig.game.playExtractOre();
			const delayCheckOreBalance = setTimeout(function(){ 
				getOreBalance();
			}, 20000);
			
		});
			
	}
	function refreshToken(){
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
    		if( request.readyState == request.DONE && request.status == 200 ) {
       			var dbToken = request.responseText;
       			console.log( "My new DB token is " + dbToken);
       			ig.game.pData.tkn = dbToken;
			}
			
		};
		request.open('GET', 'https://minelaborsimulator.com/code/php/reset-ore-token.php?wallet=' + window['userAccountNumber']);
		request.send();
	}
	
</script>
