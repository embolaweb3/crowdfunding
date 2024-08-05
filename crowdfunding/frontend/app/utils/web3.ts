import { ethers } from "ethers";

let provider: ethers.BrowserProvider;
let signer:any

async function web3(){
  if (typeof window !== "undefined" && typeof ((window as any).ethereum) !== "undefined") {
    provider = new ethers.BrowserProvider((window as any).ethereum);
    signer =  await provider.getSigner();
  } else {
    console.log("Ethereum wallet not detected");
  }
}

web3()


export { provider, signer };
