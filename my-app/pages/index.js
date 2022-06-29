import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import web3Modal, { providers } from "web3modal"
import { BigNumber, Contract, utils } from 'ethers'

export default function Home() {
  const zero = BigNumber.from(0)
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero)
  const [loading, setLoading] = useState(false);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();

    if (!chainId == 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change the network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true)
    } catch (err) {
      console.error(err)
    }
  }

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract (
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const value = 0.001*amount;

      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);
      tx.wait();
      setLoading(false);
    } catch (err) {
      console.error(err)
    }
  }

  const renderButton = () => {
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input 
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />  
          <button 
            className={styles.button} 
            disabled={!(tokenAmount > 0)} 
            onClick={() => mintCryptoDevToken(tokenAmount)} 
          >
            Mint Tokens
          </button>
        </div>
      </div> 
    ) 
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new web3Modal ({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [])

  return (
    <div>
      <Head>
      <title> Crypto Devs ICO </title>
      <meta name="description" content="ICO-dApp" />
      <link ref="icon" href="./favicon.ico" />
      </Head>
      <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs ICO</h1>
        <div className={styles.description}>
          You can claim or mint Crypto Dev tokens here
        </div>
        {walletConnected ? (
          <div>
            <div className={styles.description}>
              You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto Dev Tokens
            </div>
            <div className={styles.description}>
              Overall {utils.formatEther(tokensMinted)}/1000 have been minted
            </div>
          </div>
        ) : (
          <button onClick={connectWallet} className={styles.button}>
            Connect your Wallet
          </button>
        )}
      </div>
      </div>
    </div>
  )
}
