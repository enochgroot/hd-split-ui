import React from 'react';
import { Contract } from "@ethersproject/contracts";
import { One } from "@ethersproject/constants";
import { Body, Button, Header, Image } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { addresses, abis } from "@project/contracts";
import list from "@uniswap/default-token-list";

const WEI = One;
const WAD = WEI.mul(10).pow(18);
// const RAY = WEI.mul(10).pow(27);
// const RAD = WAD.mul(RAY);
const MIN_TARGET_ALLOWANCE = WEI.mul(21000).mul(WAD);
const MAX_TARGET_ALLOWANCE = WEI.mul(30000).mul(WAD);

// for (let i = 0; i < list.tokens.length; i++) {
//   if (list.tokens[i].chainId === 1) {
//     console.log(list.tokens[i].address);
//     (!waiting && provider) ? <ApproveTakeButton provider={provider} name={list.tokens[i].name} address={list.tokens[i].address}/> : null
//   }
// }

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [approved, setApproved] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
 
  async function hasTell(provider) {
    const signer = provider.getSigner();

    const split = new Contract(addresses.split, abis.split, signer);
  
    const daiAddress = await split.dai();
    if (daiAddress === addresses.dai) {
      return true;
    } else {
      return false;
    }
  }

  async function isApproved(provider) {
    // const _hasTell = await hasTell(provider);

    // if (!_hasTell) {
    //    setApproved(true);
    //    return true;
    // } 

    const signer = provider.getSigner();
    const from = await signer.getAddress();

    const dai = new Contract(addresses.dai, abis.erc20, signer);

    const allowance = await dai.allowance(from, addresses.split);
    if (allowance.lt(MIN_TARGET_ALLOWANCE)) {
      // console.log(from + " not approved");
      // console.log({ allowance: allowance.toString() });
      setApproved(false);
      return false;
    } else {
      // console.log(from + " approved");
      // console.log({ allowance: allowance.toString() });
      setApproved(true);
      return true;
    }
  }
 
  async function approve(provider) {
    const signer = provider.getSigner();

    const dai = new Contract(addresses.dai, abis.erc20, signer);

    const daiWithSigner = dai.connect(signer);
    setWaiting(true);
    const tx = await daiWithSigner.approve(addresses.split, MAX_TARGET_ALLOWANCE);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      setApproved(true);
    }
    setWaiting(false);
  }
 
  async function take(provider, address) {
    const signer = provider.getSigner();

    const split = new Contract(addresses.split, abis.split, signer);

    const splitWithSigner = split.connect(signer);
    setWaiting(true);
    const tx = await splitWithSigner.take();
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.error("failed to take()");
    }
    setWaiting(false);
  }
  
  function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
    return (
      <Button
        onClick={() => {
          if (!provider) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
          }
        }}
      >
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
    );
  }
  
  function ApproveTakeButton({ provider, name, address }) {
    isApproved(provider);

    return (
        <Button
            onClick={() => {
              if (approved) {
                take(provider, address);
              } else {
                approve(provider);
              }
            }}
        >
          {approved ? "Take " + name : "Approve"}
        </Button>
    );
  }

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Image src={logo} alt="hashdrop-logo" />
        { waiting ? <p>waiting...</p>: null }
        { (!waiting && provider) ? <ApproveTakeButton provider={provider} name="ETH" address="0x0"/> : null }
      </Body>
    </div>
  );
}

export default App;
