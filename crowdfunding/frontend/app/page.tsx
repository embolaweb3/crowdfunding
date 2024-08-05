"use client"

import { useEffect, useState } from "react";
import {crowdfundingContract,paymasterParams,contractAddress,paymasterAddress} from "../app/utils/contract";
import { Container, Button, Card, Form, Modal, Row, Col } from "react-bootstrap";
import { FaEthereum, FaDonate, FaTimes, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import contractABI from './utils/abi.json'
import { utils,Provider,BrowserProvider } from "zksync-ethers";


type Campaign = {
  creator: string;
  goalAmount: any;
  deadline: number;
  fundsRaised: any;
  isSuccessful: boolean;
  isWithdrawn: boolean;
  isCanceled: boolean;
};

const Home: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [goalAmount, setGoalAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [modalShow, setModalShow] = useState(false);
  const [newOwner, setNewOwner] = useState<string>("");
  const [extendTime, setExtendTime] = useState<string>("");

  let wallet:any
  if(typeof window !=='undefined'){
    wallet = (window as any).ethereum
        
}

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
  
    const provider =  new BrowserProvider(wallet)
    await provider.send('eth_requestAccounts', []);

    const signer = await provider.getSigner()

    const crowdfundingContract = new ethers.Contract(contractAddress,contractABI,signer);
    const campaignCount = await crowdfundingContract.campaignCount();
    const campaigns: Campaign[] = [];
    for (let i = 0; i < campaignCount.toString(); i++) {
      const campaign = await crowdfundingContract.getCampaignDetails(i);
      campaigns.push({
        creator: campaign[0],
        goalAmount: campaign[1],
        deadline: campaign[2].toNumber(),
        fundsRaised: campaign[3],
        isSuccessful: campaign[4],
        isWithdrawn: campaign[5],
        isCanceled: campaign[6],
      });
    }
    setCampaigns(campaigns);
  };

  const createCampaign = async () => {
    const provider =  new BrowserProvider(wallet)
    const zk = new Provider("https://sepolia.era.zksync.dev")
    const signer = await provider.getSigner()
    const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
      type: "General",
      innerInput: new Uint8Array(),
    });
  
    let amount = ethers.parseEther(goalAmount.toString())

    const crowdfundingContract = new ethers.Contract(contractAddress,contractABI,signer);

    const gasLimit = await crowdfundingContract.createCampaign
    .estimateGas(amount,{
     customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });
  //  console.log(gasLimit)

   const tx = await crowdfundingContract.createCampaign(10,{
      maxPriorityFeePerGas: 0,
      maxFeePerGas: await zk.getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    });

    console.log(tx)

    await tx.wait();
    loadCampaigns();
  };

  const withdrawFunds = async (campaignId: number) => {
    const gasLimit = await crowdfundingContract.withdrawFunds
    .estimateGas(campaignId,{
     customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });

   const tx = await crowdfundingContract
      .withdrawFunds(campaignId,{
      maxPriorityFeePerGas: ethers.toBigInt(0),
      maxFeePerGas: await new Provider("https://sepolia.era.zksync.dev").getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    });

    await tx.wait();
    loadCampaigns();
  };

  const getRefund = async (campaignId: number) => {
    const tx = await crowdfundingContract.getRefund(campaignId);
    await tx.wait();
    loadCampaigns();
  };

  const cancelCampaign = async (campaignId: number) => {

    const gasLimit = await crowdfundingContract.cancelCampaign
    .estimateGas(campaignId,{
     customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });

   const tx = await crowdfundingContract
      .cancelCampaign(campaignId,{
      maxPriorityFeePerGas: ethers.toBigInt(0),
      maxFeePerGas: await new Provider("https://sepolia.era.zksync.dev").getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    })

    await tx.wait();
    loadCampaigns();
  };

  const transferOwnership = async (campaignId: number) => {

    const gasLimit = await crowdfundingContract.transferOwnership
    .estimateGas(campaignId,newOwner,{
     customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });

   const tx = await crowdfundingContract
      .transferOwnership(campaignId,newOwner,{
      maxPriorityFeePerGas: ethers.toBigInt(0),
      maxFeePerGas: await new Provider("https://sepolia.era.zksync.dev").getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    })
    await tx.wait();
    loadCampaigns();
  };

  const extendDeadline = async (campaignId: number) => {
    const gasLimit = await crowdfundingContract.extendDeadline
    .estimateGas(campaignId,extendTime,{
     customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });

   const tx = await crowdfundingContract
      .extendDeadline(campaignId,extendTime,{
      maxPriorityFeePerGas: ethers.toBigInt(0),
      maxFeePerGas: await new Provider("https://sepolia.era.zksync.dev").getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    })
    await tx.wait();
    loadCampaigns();
  };

  const contributeToCampaign = async (campaignId: number, amount: string) => {
  
    const gasLimit = await crowdfundingContract.contribute
    .estimateGas(campaignId,{
      value :  ethers.parseEther(amount),
      customData: {
       gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
       paymasterParams: paymasterParams,
     },
   });

   const tx = await crowdfundingContract
      .contribute(campaignId,{
      value :  ethers.parseEther(amount),
      maxPriorityFeePerGas: ethers.toBigInt(0),
      maxFeePerGas: await new Provider("https://sepolia.era.zksync.dev").getGasPrice(),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    })
    await tx.wait();

    loadCampaigns();
  };

  return (
      <Container className="my-5">
        <h1 className="text-center mb-4">Decentralized Crowdfunding</h1>
        <Form className="mb-5 p-4" style={{ background: '#fff', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
          <Form.Group className="mb-3">
            <Form.Label>Goal Amount (in Wei)</Form.Label>
            <Form.Control
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
          </Form.Group>
          {/* <Form.Group className="mb-3">
            <Form.Label>Duration (in seconds)</Form.Label>
            <Form.Control
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Form.Group> */}
          <Button onClick={createCampaign} className="mb-4" style={{ background: '#ff7e5f', borderColor: '#ff7e5f' }}>
            Create Campaign
          </Button>
        </Form>
        <Row className="justify-content-center">
          {campaigns.map((campaign, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card className="p-3">
                  <Card.Body>
                    <Card.Title><FaDonate /> Campaign #{index}</Card.Title>
                    <Card.Text>
                      Goal: {ethers.formatEther(campaign.goalAmount)} ETH
                    </Card.Text>
                    <Card.Text>
                      Funds Raised: {ethers.formatEther(campaign.fundsRaised)} ETH
                    </Card.Text>
                    <Card.Text>
                      Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}
                    </Card.Text>
                    <Button variant="primary" className="mr-2 mb-2" onClick={() => contributeToCampaign(index, "0.1")}>
                      <FaEthereum /> Contribute
                    </Button>
                    <Button variant="danger" className="mr-2 mb-2" onClick={() => cancelCampaign(index)}>
                      <FaTimes /> Cancel
                    </Button>
                    <Button variant="secondary" className="mb-2" onClick={() => setModalShow(true)}>
                      <FaEdit /> Manage
                    </Button>

                    <Modal show={modalShow} onHide={() => setModalShow(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>Manage Campaign #{index}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>New Owner Address</Form.Label>
                            <Form.Control
                              type="text"
                              value={newOwner}
                              onChange={(e) => setNewOwner(e.target.value)}
                            />
                          </Form.Group>
                          <Button onClick={() => transferOwnership(index)} className="mb-3">
                            Transfer Ownership
                          </Button>
                        </Form>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Extend Time (in seconds)</Form.Label>
                            <Form.Control
                              type="number"
                              value={extendTime}
                              onChange={(e) => setExtendTime(e.target.value)}
                            />
                          </Form.Group>
                          <Button onClick={() => extendDeadline(index)} className="mb-3">
                            Extend Deadline
                          </Button>
                        </Form>
                        <Button onClick={() => withdrawFunds(index)} className="mb-3">
                          Withdraw Funds
                        </Button>
                        <Button onClick={() => getRefund(index)} className="mb-3">
                          Get Refund
                        </Button>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setModalShow(false)}>
                          Close
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
  );
};

export default Home;
