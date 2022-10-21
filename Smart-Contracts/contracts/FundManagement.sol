// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./FMD.sol";

/**
 * @title FundManagement
 * @dev Fund Management
 */
contract FundManagement {

    struct Spending {
        string purpose;
        uint256 amt;
        address receiver;
        bool executed;
        // (stakeholder => vote)
        mapping(address => bool) approvals;
        uint256 approvalCount;
    }

    FMD public token;

    uint256 spendingIdCounter;

    address public admin;

    uint256 public minBuy;

    // (stakeholder => amount)
    mapping(address => uint256) public stakeholders;

    // (id => Spending)
    mapping(uint256 => Spending) public spending;

    uint256 public spendingMinVotePercent;

    uint256 public totalTokens;

    address public shareToken;

    event Deposit(address indexed newStakeholder, uint256 depositAmt);
    event Vote(address indexed voter, bool vote);
    event NewSpending(address indexed receiver, uint256 spendingAmt);
    event SpendingExecuted(address indexed executor, uint256 indexed spendingId);


    /**
     * @dev Sets the admin and minBuy
     * @param _admin the address of Fund Manager
     * @param _minBuy the min amt ETH to deposite to become a stakeholder
     */
    constructor(address _admin, uint256 _minBuy) {
        require(_minBuy > 0, "minBuy must be more than 0");
        admin = _admin;
        minBuy = _minBuy;
        spendingIdCounter = 0;
        spendingMinVotePercent = 75;
    }

    /**
     * @dev Sets the share token
     * @param _shareToken the address of FMD
     */
    function setShareToken(address _shareToken) public {
        require(msg.sender == admin, "Caller is not admin");
        shareToken = _shareToken;
        token = FMD(_shareToken);
    }

    /**
     * @dev Deposit money (in ETH) to stakeholder account
     * @param depositAmt the amt to deposit
     */
    function deposit(uint256 depositAmt) public payable {
        require(depositAmt * (10**18) == msg.value, "Deposit amt does not match");
        require(depositAmt >= minBuy, "Deposit amt is less than minBuy");
        stakeholders[msg.sender] += depositAmt; // in ETH
        token.transfer(msg.sender, depositAmt*10);  // in FMD

        emit Deposit(msg.sender, depositAmt);
    }

    /**
     * @dev Admin creates a Spending request
     * @param receiver the receiver of the Spending
     * @param spendingAmt the amt of Spending
     * @param purpose the purpose of Spending
     */
    function createSpending(address receiver, uint256 spendingAmt, string memory purpose) public {
        require(msg.sender == admin, "Caller is not admin");
        require(spendingAmt > 0, "spendingAmt must be more than 0");

        spendingIdCounter += 1;
        Spending storage newSpending = spending[spendingIdCounter];
        newSpending.purpose = purpose;
        newSpending.amt = spendingAmt;
        newSpending.receiver = receiver;
        newSpending.executed = false;
        newSpending.approvalCount = 0;

        emit NewSpending(receiver, spendingAmt);
    }

    /**
     * @dev Stakeholders adds an approval vote to a Spending request
     * @param spendingId the id of Spending to add approval vote
     * @param vote whether or not approve the spending
     */
    function approveSpending(uint256 spendingId, bool vote) public {
        require(spendingId <= spendingIdCounter, "Invalid spendingId");
        spending[spendingId].approvals[msg.sender] = vote;
        if (vote) {
            spending[spendingId].approvalCount += token.balanceOf(msg.sender);
            totalTokens += token.balanceOf(msg.sender);
        }

        emit Vote(msg.sender, vote);
    }

    /**
     * @dev Send money (ETH) to address if there are enough approvals
     * @param spendingId the id of Spending to execute
     */
    function executeSpending(uint256 spendingId) public payable {
        require(msg.sender == admin, "Caller is not admin");
        require(spendingId <= spendingIdCounter, "Invalid spendingId");
        require(msg.value == spending[spendingId].amt * (10**18), "Spending amt must match to msg.value");
        require(spending[spendingId].approvalCount / totalTokens * 100 >= spendingMinVotePercent, "Not enough approvals");

        payable(spending[spendingId].receiver).transfer(msg.value);

        spending[spendingId].executed = true;

        emit SpendingExecuted(msg.sender, spendingId);
    }

    /**
     * @dev Returns the address of FMD
     */
    function getShareToken() public view returns (address) {
        return shareToken;
    }

}