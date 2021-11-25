import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import myEpicNFTAbi from '../src/utils/MyEpicNFT.json'
// Constants
const TWITTER_HANDLE = 'ernestelijah';
const TWITTER_LINK = `https://twitter.com/ernestelijah`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-r84yxrxyl5';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if(!ethereum) {
      console.log('No wallet found, download metamask');
      return;
    }else {
      console.log('Wallet found, connect to metamask', ethereum);
      
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Authorized account found', account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
          let chainId = await ethereum.request({ method: 'eth_chainId' });
          console.log("Connected to chain " + chainId);
          
          // String, hex code of the chainId of the Rinkebey test network
          const rinkebyChainId = "0x4"; 
          if (chainId !== rinkebyChainId) {
            alert("You are not connected to the Rinkeby Test Network!");
          }
    } else {
      console.log('No authorized account found');
    }
  }

  // connect wallet
  const connectWallet = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum) {
        alert("no wallet found, download metamask")
        return;
      }
      // request account access
      const accounts = await ethereum.request({method: 'eth_requestAccounts'})

      console.log("connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
          let chainId = await ethereum.request({ method: 'eth_chainId' });
              console.log("Connected to chain " + chainId);

              // String, hex code of the chainId of the Rinkebey test network
              const rinkebyChainId = "0x4"; 
              if (chainId !== rinkebyChainId) {
                alert("You are not connected to the Rinkeby Test Network!");
              }
    } catch(err) {
      console.log("error", err);
    }
    
    
  }

   // Setup our listener.
   const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    const CONTRACT_ADDRESS = "0xE60502a488611f0ab9B1550106E797C433175E37";
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const CONTRACT_ABI = myEpicNFTAbi.abi;
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0xE28Db484F006acDBb4FE80dDC0db786Df15899ED";
    try{
      const {ethereum} = window;

    if(ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const CONTRACT_ABI = myEpicNFTAbi.abi;
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      console.log("popping wallet open to poay gas fees")
      let nftTxn = await connectedContract.makeAnEpicNFT();

      console.log("mining please wait")
      await nftTxn.wait();

      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    } else {
      console.log("no wallet found, download metamask");
    }

    } catch(err) {
      console.log("error", err);
    }
   
    
   }

   
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (renderNotConnectedContainer()) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
          </button>
          )}
        </div>

          <div>
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >View your NFTs on Open Sea</a>
          </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
