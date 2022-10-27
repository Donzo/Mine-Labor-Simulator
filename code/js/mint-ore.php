<script>
	function prepareMint(){
		
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
    		if( request.readyState == request.DONE && request.status == 200 ) {
       			//console.log( 'server', request.getResponseHeader('server') );
       			var dbToken = request.responseText;
       			ig.game.pData.tkn = dbToken;
       			console.log( "ig.game.pData.tkn " + ig.game.pData.tkn);
       			mintOre();
			}
			
		};
		request.open('GET', 'https://minelaborsimulator.com/code/php/reset-ore-token.php?wallet=' + window['userAccountNumber']);
		request.send();
	}
	function mintOre(){
						
		let web3 = new Web3(Web3.givenProvider);
		var contractAddress = '0xEC1171bc44f3C187B579e8b1c0ba237684671C81';
		
		var contract = new web3.eth.Contract(abi1, contractAddress, {
			from: window['userAccountNumber'],
			value:web3.utils.toWei("0.05", "ether")
			//gasPrice: '20000000000'
		});
			
		//var metadataURI = "https://nftest.net" + pathToMyResults;
			
		contract.methods.mintOre(String(ig.game.pData.tkn)).send({
			queryAddress:window['userAccountNumber'],
		}, function(){
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
