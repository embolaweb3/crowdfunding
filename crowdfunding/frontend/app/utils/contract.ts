import { ethers } from "ethers";
import { signer } from "./web3";
import contractABI from './abi.json'
import { utils } from "zksync-ethers";


const contractAddress = "0x6a66cf5228475C5312661A2224a42718c5083e79";
const paymasterAddress = "0x667b81F0701083C87e20E29C8fc45Ae5e9e17E2c"
export const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
    type: "General",
    innerInput: new Uint8Array(),
  });

export const crowdfundingContract = new ethers.Contract(contractAddress, contractABI, signer);

