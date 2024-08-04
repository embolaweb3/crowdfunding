// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Campaign {
        address payable creator;
        uint goalAmount;
        uint deadline;
        uint fundsRaised;
        bool isSuccessful;
        bool isWithdrawn;
        bool isCanceled;
    }

    mapping(uint => Campaign) public campaigns;
    uint public campaignCount = 0;

    mapping(uint => mapping(address => uint)) public contributions;
    mapping(uint => address[]) public contributors;

    event CampaignCreated(uint campaignId, address creator, uint goalAmount, uint deadline);
    event ContributionReceived(uint campaignId, address contributor, uint amount);
    event FundsWithdrawn(uint campaignId, address creator, uint amount);
    event CampaignCanceled(uint campaignId, address creator);
    event OwnershipTransferred(uint campaignId, address oldOwner, address newOwner);
    event DeadlineExtended(uint campaignId, uint newDeadline);

    modifier onlyCreator(uint _campaignId) {
        require(msg.sender == campaigns[_campaignId].creator, "Only the campaign creator can call this.");
        _;
    }

    modifier campaignExists(uint _campaignId) {
        require(_campaignId < campaignCount, "Campaign does not exist.");
        _;
    }

    modifier campaignActive(uint _campaignId) {
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign is no longer active.");
        _;
    }

    modifier campaignNotCanceled(uint _campaignId) {
        require(!campaigns[_campaignId].isCanceled, "Campaign is canceled.");
        _;
    }

    function createCampaign(uint _goalAmount) external {
        require(_goalAmount > 0, "Goal amount should be greater than zero.");

        uint fixedDuration = 5 minutes; // Fixed deadline of 5 minutes

        campaigns[campaignCount] = Campaign({
            creator: payable(msg.sender),
            goalAmount: _goalAmount,
            deadline: block.timestamp + fixedDuration,
            fundsRaised: 0,
            isSuccessful: false,
            isWithdrawn: false,
            isCanceled: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _goalAmount, block.timestamp + fixedDuration);
        campaignCount++;
    }

    function contribute(uint _campaignId) external payable campaignExists(_campaignId) campaignActive(_campaignId) campaignNotCanceled(_campaignId) {
        require(msg.value > 0, "Contribution should be greater than zero.");

        Campaign storage campaign = campaigns[_campaignId];
        campaign.fundsRaised += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;
        contributors[_campaignId].push(msg.sender);

        emit ContributionReceived(_campaignId, msg.sender, msg.value);

        if (campaign.fundsRaised >= campaign.goalAmount) {
            campaign.isSuccessful = true;
        }
    }

    function withdrawFunds(uint _campaignId) external onlyCreator(_campaignId) campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign is still active.");
        require(campaign.isSuccessful, "Campaign did not reach its goal.");
        require(!campaign.isWithdrawn, "Funds already withdrawn.");
        require(!campaign.isCanceled, "Campaign is canceled.");

        campaign.isWithdrawn = true;
        (bool success, ) = campaign.creator.call{ value: campaign.fundsRaised }("");
        require(success, "Transfer failed.");

        emit FundsWithdrawn(_campaignId, campaign.creator, campaign.fundsRaised);
    }

    function getRefund(uint _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp >= campaign.deadline, "Campaign is still active.");
        require(!campaign.isSuccessful, "Campaign reached its goal.");
        require(!campaign.isCanceled, "Campaign is canceled.");

        uint amountContributed = contributions[_campaignId][msg.sender];
        require(amountContributed > 0, "No contributions found.");

        contributions[_campaignId][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{ value: amountContributed }("");
        require(success, "Refund transfer failed.");
    }

    function cancelCampaign(uint _campaignId) external onlyCreator(_campaignId) campaignExists(_campaignId) campaignNotCanceled(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(block.timestamp < campaign.deadline, "Campaign is no longer active.");
        require(campaign.fundsRaised < campaign.goalAmount, "Campaign has already reached its goal.");

        campaign.isCanceled = true;

        emit CampaignCanceled(_campaignId, msg.sender);
    }

    function transferOwnership(uint _campaignId, address newOwner) external onlyCreator(_campaignId) campaignExists(_campaignId) {
        require(newOwner != address(0), "New owner address cannot be zero.");

        address oldOwner = campaigns[_campaignId].creator;
        campaigns[_campaignId].creator = payable(newOwner);

        emit OwnershipTransferred(_campaignId, oldOwner, newOwner);
    }

    function extendDeadline(uint _campaignId, uint newDuration) external onlyCreator(_campaignId) campaignExists(_campaignId) campaignActive(_campaignId) {
        require(newDuration > 0, "New duration should be greater than zero.");

        campaigns[_campaignId].deadline += newDuration;

        emit DeadlineExtended(_campaignId, campaigns[_campaignId].deadline);
    }

    function getCampaignDetails(uint _campaignId) external view campaignExists(_campaignId) returns (address, uint, uint, uint, bool, bool, bool) {
        Campaign memory campaign = campaigns[_campaignId];
        return (campaign.creator, campaign.goalAmount, campaign.deadline, campaign.fundsRaised, campaign.isSuccessful, campaign.isWithdrawn, campaign.isCanceled);
    }
}
