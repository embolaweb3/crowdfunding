import { deployContract, getWallet, getProvider } from "./utils";
import * as ethers from "ethers";

export default async function () {
   await deployContract("Crowdfunding",[]);
  const paymaster = await deployContract("CrowdFundingPaymaster");

  const paymasterAddress = await paymaster.getAddress();

  // Supplying paymaster with ETH
  console.log("Funding paymaster with ETH...");
  const wallet = getWallet();
  await (
    await wallet.sendTransaction({
      to: paymasterAddress,
      value: ethers.parseEther("0.05"),
    })
  ).wait();

  const provider = getProvider();
  const paymasterBalance = await provider.getBalance(paymasterAddress);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  console.log(`Done!`);
}