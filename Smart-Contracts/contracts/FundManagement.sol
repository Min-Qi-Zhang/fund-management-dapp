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
    event Withdraw(address indexed stakeholder, uint256 withdrawAmt);
    event Vote(address indexed voter, bool vote);
    event NewSpending(address indexed receiver, uint256 spendingAmt);
    event SpendingExecuted(address indexed executor, uint256 indexed spendingId);


    /**
     * @dev Sets the admin and minBuy
     * @param _admin the address of Fund Manager
     * @param _minBuy the min number of 0.1 ETH to deposit to become a stakeholder
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
     * @param depositAmt the count of 0.1 ETH to deposit
     */
    function deposit(uint256 depositAmt) public payable {
        require(depositAmt * (10**17) == msg.value, "Deposit amt does not match");
        require(depositAmt * (10**18) <= token.balanceOf(address(this)), "Not enough supply");
        require(depositAmt >= minBuy, "Deposit amt is less than minBuy");
        stakeholders[msg.sender] += depositAmt; // count of 0.1 ETH
        totalTokens += depositAmt;
        token.transfer(msg.sender, depositAmt * (10**18));  // in FMD

        emit Deposit(msg.sender, depositAmt);
    }

    /**
     * @dev Withdraw ETH out from contract
     * @param withdrawAmt the amount to withdraw (number of 0.1 ETH)
     */
    function withdraw(uint256 withdrawAmt) public {
        require(withdrawAmt > 0, "withdrawAmt should be more than 0");
        require(token.balanceOf(msg.sender) > 0, "Stakeholder does not exist");
        require(token.allowance(msg.sender, address(this)) >= withdrawAmt * (10**18), "Number of tokens approved is not enough");
        require(token.balanceOf(msg.sender) >= withdrawAmt * (10**18), "Can't withdraw more than the amt you deposited");
        require(address(this).balance >= withdrawAmt * (10**17), "Not enough ETH in contract");
        stakeholders[msg.sender] -= withdrawAmt;
        totalTokens -= withdrawAmt;
        token.transferFrom(msg.sender, address(this), withdrawAmt * (10**18));
        payable(msg.sender).transfer(withdrawAmt * (10**17));
        emit Withdraw(msg.sender, withdrawAmt);
    }

    /**
     * @dev Admin creates a Spending request
     * @param receiver the receiver of the Spending
     * @param spendingAmt the amt (of 0.1 ETH) of Spending
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
        require(token.balanceOf(msg.sender) > 0, "Stakeholder does not exist");
        spending[spendingId].approvals[msg.sender] = vote;
        if (vote) {
            spending[spendingId].approvalCount += token.balanceOf(msg.sender);
        }

        emit Vote(msg.sender, vote);
    }

    /**
     * @dev Send money (ETH) to address if there are enough approvals
     * @param spendingId the id of Spending to execute
     */
    function executeSpending(uint256 spendingId) public {
        require(msg.sender == admin, "Caller is not admin");
        require(spendingId <= spendingIdCounter, "Invalid spendingId");
        require(totalTokens > 0 && spending[spendingId].approvalCount / totalTokens * 100 >= spendingMinVotePercent, "Not enough approvals");
        require(!spending[spendingId].executed, "This spending was executed");

        payable(spending[spendingId].receiver).transfer(spending[spendingId].amt * (10**17));

        spending[spendingId].executed = true;

        emit SpendingExecuted(msg.sender, spendingId);
    }

    /**
     * @dev Returns the address of FMD
     */
    function getShareToken() public view returns (address) {
        return shareToken;
    }

    /**
     * @dev Returns the token amount of a stakeholder
     * @param stakeholder the address of stakeholder
     */
    function getStakeholderAmount(address stakeholder) public view returns (uint256) {
        return stakeholders[stakeholder];
    }

}