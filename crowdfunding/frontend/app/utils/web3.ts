import { ethers } from "ethers";
import { utils,Provider,BrowserProvider } from "zksync-ethers";


let provider: ethers.BrowserProvider;
let signer:any

async function web3(){
  if (typeof window !== "undefined" && typeof ((window as any).ethereum) !== "undefined") {
    provider = new BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    signer =  await provider.getSigner();
  } else {
    console.log("Ethereum wallet not detected");
  }
}

web3()


export { provider, signer };
