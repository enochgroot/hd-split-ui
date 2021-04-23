import React from 'react';
import { Contract } from "@ethersproject/contracts";
import { parseFixed, formatFixed } from "@ethersproject/bignumber";
import { Zero, One } from "@ethersproject/constants";
import { Body, Button, Header, Image, Actions, Input, TokenBalance } from "./components";
import logo from "./hashdrop_logo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { addresses, abis } from "@project/contracts";
import tokenList from "@uniswap/default-token-list";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const CHAIN_ID = 1;
const MAX_EXPENSE = 3000;
const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

const WEI = One;
const ILL = WEI.mul(10).pow(16);
const WAD = WEI.mul(10).pow(18);
const MIN_TARGET_ALLOWANCE = WEI.mul(2000).mul(WAD);
const MAX_TARGET_ALLOWANCE = WEI.mul(5000).mul(WAD);

tokenList.tokens.unshift({
  chainId: CHAIN_ID,
  address: null,
  symbol: 'ETH'
});

let reverseMapping = {
  'ETH': tokenList.tokens[0]
};

let tokenSelect  = [];
for (let i = 0; i < tokenList.tokens.length; i++) {
  if (tokenList.tokens[i].chainId === CHAIN_ID) {
    tokenSelect.push(tokenList.tokens[i].symbol);
    reverseMapping[tokenList.tokens[i].symbol] = tokenList.tokens[i];
  }
}
const defaultToken = tokenSelect[0];

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [canTell, setCanTell] = React.useState(false);
  const [balance, setBalance] = React.useState("0.00");
  const [approved, setApproved] = React.useState(false);
  const [token, setToken] = React.useState(defaultToken);
  const [waiting, setWaiting] = React.useState(false);
  const [daiValue, setDaiValue] = React.useState("");
 
  async function tokenBalance(provider, tokenAddress) {
    let dec = 18;
    const signer = provider.getSigner();
    const split = new Contract(addresses.split, abis.split, signer);

    let bal = Zero;
    let splitBal = Zero;
    let splitRawBal = Zero;
    if (tokenAddress === null) {
      bal = await split.balance(signer.getAddress(), EMPTY_ADDRESS);
      splitBal = await split.total(EMPTY_ADDRESS);
      splitRawBal = await provider.getBalance(addresses.split);
    } else {
      const coin = new Contract(tokenAddress, abis.erc20, signer);
      dec = await coin.decimals();
      bal = await split.balance(signer.getAddress(), tokenAddress);
      splitBal = await split.total(tokenAddress);
      splitRawBal = await coin.balanceOf(addresses.split);
    }
    
    let bps = Zero;
    if (splitRawBal.sub(splitBal).gt(0)) {
      for(let i = 0; i < 100; i++) {
        let folk = await split.folks(i);
        if (folk === await signer.getAddress()) {
          bps = await split.bps(i);
          break;
        }
      }
    }
    bal = bal.add(splitRawBal.sub(splitBal).mul(bps).div(10000));

    setBalance(formatFixed(bal, dec));
  }

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
    const _hasTell = await hasTell(provider);

    if (!_hasTell) {
       setApproved(true);
       return true;
    } 

    setCanTell(true);

    const signer = provider.getSigner();
    const from = await signer.getAddress();

    const dai = new Contract(addresses.dai, abis.erc20, signer);

    const allowance = await dai.allowance(from, addresses.split);
    if (allowance.lt(MIN_TARGET_ALLOWANCE)) {
      setApproved(false);
      return false;
    } else {
      setApproved(true);
      return true;
    }
  }
 
  async function approve(provider) {
    const signer = provider.getSigner();

    const dai = new Contract(addresses.dai, abis.erc20, signer);
    try {
      setWaiting(true);
      const tx = await dai.approve(addresses.split, MAX_TARGET_ALLOWANCE);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setApproved(true);
      }
    } catch (err) {
      console.error(err);
    }
    setWaiting(false);
  }
 
  async function take(provider, tokenAddress) {
    const signer = provider.getSigner();

    if (balance === '0.0') {
      console.log("0 balance, won't take");
      return;
    }

    const split = new Contract(addresses.split, abis.split, signer);
    try {
      setWaiting(true);
      let tx;
      if (tokenAddress === null) {
        tx = await split["take()"]();
      } else {
        tx = await split["take(address)"](tokenAddress);
      }
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        // success, but nothing to do
      }
    } catch (err) {
      console.error(err);
    }
    setWaiting(false);
  }
 
  async function tell(provider) {
    const signer = provider.getSigner();

    const value = parseFixed(daiValue, 2);
    const wad = value.mul(ILL);

    if(value.div(10**2).gt(MAX_EXPENSE)) {
      setDaiValue(""); 
      console.error(
        formatFixed(value, 2) + " value too large (<=" + MAX_EXPENSE + ")"
      );
      return;
    }

    const split = new Contract(addresses.split, abis.split, signer);
    try {
      setWaiting(true);
      let tx;
      tx = await split.tell(wad);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setDaiValue("");
      }
    } catch (err) {
      console.error(err);
    }
    setWaiting(false);
  }
  
  function TokenSelect(selection) {
    setToken(selection.label);
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
  
  function ApproveTakeButton({ provider, token }) {
    isApproved(provider);

    return (
        <Button
            onClick={() => {
              if (approved) {
                take(provider, reverseMapping[token].address);
              } else {
                approve(provider);
              }
            }}
        >
          {approved ? "Withdraw" : "Approve"}
        </Button>
    );
  }
  
  function ExpenseButton({ provider }) {
    return (
        <Button
            onClick={() => {
              if (daiValue !== "") {
                tell(provider);
              }
            }}
        >
         Expense
        </Button>
    );
  }

  function Balance({ provider, token }) {
    tokenBalance(provider, reverseMapping[token].address);

    return (
      <TokenBalance>Balance: {balance}</TokenBalance>
    );
  }

  function daiChange(event) {
    setDaiValue(event.target.value);
  }

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <Image src={logo} alt="hashdrop-logo" />
        { waiting ? <p>waiting...</p>: null }
        { (!waiting && provider && approved && token) ? <Balance provider={provider} token={token} /> : null }
        <Actions>
          { (!waiting && provider && approved) ? <Dropdown options={tokenSelect} onChange={TokenSelect} value={defaultToken} placeholder="Select an token" /> : null }
          { (!waiting && provider && token) ? <ApproveTakeButton provider={provider} token={token} /> : null }
        </Actions>
        <Actions>
          { (!waiting && provider && canTell) ? <Input type="text" value={daiValue} onChange={daiChange}/> : null }
          { (!waiting && provider && canTell) ? <ExpenseButton provider={provider} token={token} /> : null }
        </Actions>
      </Body>
    </div>
  );
}

export default App;
