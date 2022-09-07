import React, { useEffect, useState } from "react";
import githubLogo from "./assets/github-logo.svg";
import "./App.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from './utils/MyEpicGame.json';
import SelectCharacter from "./Components/SelectCharacter";
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator";

// Constantes
const GITHUB_HANDLE = "diegobarretoo";
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /*
   * Já que esse método vai levar um tempo, lembre-se de declará-lo como async
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Parece que você não tem a metamask instalada!");
        /*
        * Nós configuramos o isLoading aqui porque usamos o return na proxima linha
        */
        setIsLoading(false);
        return;
      } else {
        console.log("Nós temos o objeto ethereum", ethereum);

        /*
         * Checa se estamos autorizados a acessar a carteira do usuário.
         */
        const accounts = await ethereum.request({ method: "eth_accounts" });

        /*
         * Usuário pode ter múltiplas contas autorizadas, pegamos a primeira se estiver ali!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Carteira conectada::", account);
          setCurrentAccount(account);
        } else {
          console.log("Não encontramos uma carteira conectada");
        }
      }
    } catch (error) {
      console.log(error);
    }

    /*
    * Nós lançamos a propriedade de estado depois de toda lógica da função
    */
    setIsLoading(false);
  };

  // Métodos de renderização
  const renderContent = () => {
    /*
    * Se esse app estiver carregando, renderize o indicador de carregamento
    */
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            // src="https://thumbs.gfycat.com/AnchoredPleasedBergerpicard-size_restricted.gif"
            // src="https://media3.giphy.com/media/9Datyx69PxYYT7au0e/giphy.gif"
            src="https://64.media.tumblr.com/62052098c3ed44fbb60917c548db4906/tumblr_ny8p27WHJq1ro8ysbo1_500.gifv"
            alt="Shredder Gif"
          />
          
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua carteira para começar
          </button>
        </div>
      );
      
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }  
  };

  /*
   * Implementa o seu método connectWallet aqui
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Instale a MetaMask!");
        return;
      }

      /*
       * Método chique para pedir acesso para a conta.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! Isso deve escrever o endereço público uma vez que autorizarmos Metamask.
       */
      console.log("Contectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== "4") {
        alert("Please connect to Rinkeby!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    /*
    * Quando nosso componente for montado, tenha certeza de configurar o estado de carregamento
    */
    setIsLoading(true);

    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    /*
     * A função que vamos chamar que interage com nosso contrato inteligente
     */
    const fetchNFTMetadata = async () => {
      console.log("Verificando pelo personagem NFT no endereço:", currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("Usuário tem um personagem NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("Nenhum personagem NFT foi encontrado", txn);
      }

      /*
      * Uma vez que tivermos acabado a busca, configure o estado de carregamento para falso.
      */
      setIsLoading(false);
    };
  
    /*
     * Nós so queremos rodar isso se tivermos uma wallet conectada
     */
    if (currentAccount) {
      console.log("Conta Atual:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Batalhas no Metaverso ⚔️</p>
          <p className="sub-text">Junte os amigos e proteja o Metaverso!!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Github Logo" className="github-logo" src={githubLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${GITHUB_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;