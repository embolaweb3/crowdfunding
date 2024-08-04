import { expect, assert } from 'chai';
import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import * as ethers from "ethers";

import { time } from "@nomicfoundation/hardhat-network-helpers";

// Utility functions to convert time units into seconds
function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

function hoursToSeconds(hours: number): number {
  return hours * 60 * 60;
}

function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

describe("Crowdfunding", function () {
  let crowdfunding: Contract;
  let owner: Wallet;
  let addr1: Wallet;
  let addr2: Wallet;

  beforeEach(async function () {
    addr1 = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    addr2 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    owner = getWallet(LOCAL_RICH_WALLETS[2].privateKey);

    crowdfunding = await deployContract("Crowdfunding", [], { wallet: owner, silent: true });

  });

  it("Should create a campaign", async function () {

    await (crowdfunding.connect(owner)as Contract).createCampaign(100)

    const campaign = await crowdfunding.getCampaignDetails(0);
    expect(campaign[0]).to.equal(owner.address);
    expect(campaign[1].toString()).to.equal('100');
  });

  it("Should allow contributions to a campaign", async function () {
    await (crowdfunding.connect(owner)as Contract).createCampaign(80)
    await (crowdfunding.connect(addr1) as Contract).contribute(0, { value: 50 })

    const campaign = await crowdfunding.getCampaignDetails(0);
    expect(campaign[1].toString()).to.equal('80');
    expect(campaign[3].toString()).to.equal('50');

  });


  it("Should allow the campaign creator to cancel the campaign", async function () {
    await (crowdfunding.connect(addr2)as Contract).createCampaign(80)
    await (crowdfunding.connect(addr2)as Contract).cancelCampaign(0);

    const campaign = await crowdfunding.getCampaignDetails(0);
    expect(campaign[6]).to.be.true;
  });

  it("Should allow the campaign creator to transfer ownership", async function () {
    await (crowdfunding.connect(addr2)as Contract).createCampaign(80)
    await (crowdfunding.connect(addr2)as Contract).transferOwnership(0, addr1.address);

    const campaign = await crowdfunding.getCampaignDetails(0);
    expect(campaign[0]).to.equal(addr1.address);
  });


});
