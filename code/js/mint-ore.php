<script>
	var gasPriceEstimate;
	var sendEth;
	var myVal;
	
	function prepareMint(){
		let web3 = new Web3(Web3.givenProvider);
		web3.eth.getGasPrice().then((result) => {
			//Get estimated Gas
			gasPriceEstimate = web3.utils.fromWei(result, 'gwei').toString();
			gasPriceEstimate += 2;
			console.log("1 gasPriceEstimate before to string = " + gasPriceEstimate);
			gasPriceEstimate = gasPriceEstimate.toString();
			gasPriceEstimate = gasPriceEstimate.replace('.', '');
			//console.log("2 gasPriceEstimate = " + gasPriceEstimate);
			
			//from: window['userAccountNumber'],
			//value: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'		
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
       				console.log( "ig.game.pData.tkn " + ig.game.pData.tkn);
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
	//Weth Quoter
	//0xE5935140bA622Ad9780C9d1501e62334b0f5eF2f
	
	/*
	
	
	//Get estimated ETH
			//0xE5935140bA622Ad9780C9d1501e62334b0f5eF2f
			let web3 = new Web3(Web3.givenProvider);
			var contractAddress = '0xE5935140bA622Ad9780C9d1501e62334b0f5eF2f';
			var myContract = new web3.eth.Contract(abi2, contractAddress, {
				const requiredEth = (await myContract.getEstimatedETHforLINK(daiAmount).call())[0];
				const sendEth = requiredEth * 1.1;
				console.log('sendEth = ' + sendEth);
			});
			
			
	
	async function getAmountsOut(){
		const routerContract = new web3.eth.Contract(uniswapABI, '0xE5935140bA622Ad9780C9d1501e62334b0f5eF2f');  
		let result = await routerContract.methods.getAmountsOut(amountIn, path[]).call();
		return result; 
		//amountInMax
	}
	*/

	
	async function estimateEth(){
		let web3 = new Web3(Web3.givenProvider);
		//Old one *works*
		//var contractAddress = '0xEC1171bc44f3C187B579e8b1c0ba237684671C81';
		
		var myContractAddress = '0xD35c9101485A56A171c038282132556a95504A6E';
		var myContract = new web3.eth.Contract(abi2, myContractAddress, {
			//from: window['userAccountNumber'],
			//value: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
		requiredEth = (await myContract.methods.getEstimatedETHforLINK("100000000000000000").call())[0];
		console.log('requiredEth1 = ' + requiredEth)
		sendEth = Math.ceil(requiredEth * 15000);
		//sendEth = sendEth.toString();
        console.log('2sendEth = ' + sendEth)
	}
	

	function mintSomeOre(){
						
		let web3 = new Web3(Web3.givenProvider);
		//Old one *works*
		//var contractAddress = '0xEC1171bc44f3C187B579e8b1c0ba237684671C81';
		
		var contractAddress = '0xd14cCfdA73b3b9e98f872dC51aA05B5b80D900C4';
		
		//sendEth = web3.utils.toWei(sendEth, "Wei");
		//sendEth = sendEth.toString();
		//sendEth = sendEth.replace('.', '');
		//sendEth = 0.1;
		sendEth = sendEth.toString()
		myVal = web3.utils.toWei(sendEth, "Gwei");
		
		console.log("zmyVal = " + myVal);
		var contract = new web3.eth.Contract(abi1, contractAddress, {
			//from: window['userAccountNumber'],
			//myVal: web3.utils.toWei("0.001", "ether"),
			//gas: 1000000,
			//value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
			
		//var metadataURI = "https://nftest.net" + pathToMyResults;
		console.log('String(ig.game.pData.tkn) = ' + String(ig.game.pData.tkn));
		contract.methods.mintOre(String(ig.game.pData.tkn)).send({
			from:window['userAccountNumber'],
			value:myVal,
			gas: 600000,
			gasPrice: gasPriceEstimate,
		}, function(){
			ig.game.textBox = true;
			ig.game.txtBoxTxt = "Extracting ore... Mining...";
			ig.game.txtBoxTxtSize = 2;
			ig.game.txtBoxHeight = .25;
			/*var progressDiv = document.getElementById('progress-div');
			progressDiv.style.margin = ".25em";	
			progressDiv.style.textAlign = "center";	
			progressDiv.style.color = "#FAF566";	
			progressDiv.innerHTML = "Mining Transaction...";
			var loadWheel = document.getElementById('loading-wheel');
			loadWheel.style.display = "flex";
			document.getElementById('connection-in-progress').style.display = 'flex'; */
			console.log('mining transaction');
		})
		.on('receipt', function(receipt){
    		
    		console.log('mined.');
    		
    		ig.game.textBox = true;
			ig.game.turnOffTextBox = true;
			ig.game.turnOffTextBoxTimer.set(2);
			ig.game.txtBoxTxtSize = 2;
			ig.game.txtBoxHeight = .25;
			ig.game.pData.ore = 0;
			ig.game.txtBoxTxt = "Success! Transaction Mined. Ore Extracted.";
			ig.game.checkIfUserHasOre();
			
    		
    		/*/Loading wheel;
			var loadWheel = document.getElementById('loading-wheel');
			var progressDiv = document.getElementById('progress-div');
			progressDiv.style.margin = "1.5em 0em .25em 0em";
			progressDiv.style.color = "lime";	
			progressDiv.innerHTML = "NFT Minted!";
			loadWheel.style.display = 'flex';
			loadWheel.style.display.flexdirection = 'column';
			loadWheel.innerHTML = "<p style='text-align:center;'>Hash: </p><p><a href='" + blockExplorerBase + "" + receipt.transactionHash + "' target='_new'> "+ receipt.transactionHash + "</a></p>";
			*/	
		});
			
	}
	function refreshToken(){
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
    		if( request.readyState == request.DONE && request.status == 200 ) {
       			//console.log( 'server', request.getResponseHeader('server') );
       			var dbToken = request.responseText;
       			console.log( "My new DB token is " + dbToken);
       			ig.game.pData.tkn = dbToken;
			}
			
		};
		request.open('GET', 'https://minelaborsimulator.com/code/php/reset-ore-token.php?wallet=' + window['userAccountNumber']);
		request.send();
	}
	
	async function getAmountInMax() {
		console.log('get amount in max here.')
	}
	
</script>
