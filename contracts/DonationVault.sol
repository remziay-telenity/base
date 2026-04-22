// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DonationVault {
    address public owner;
    uint256 public totalDonations;
    uint256 public donorCount;
    mapping(address => uint256) public donorAmount;

    event Donated(address indexed donor, uint256 amount, uint256 newTotal);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable {
        require(msg.value > 0, "Must send ETH");
        if (donorAmount[msg.sender] == 0) donorCount++;
        donorAmount[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit Donated(msg.sender, msg.value, totalDonations);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool ok, ) = payable(owner).call{value: balance}("");
        require(ok, "Withdraw failed");
        emit Withdrawn(owner, balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        if (donorAmount[msg.sender] == 0) donorCount++;
        donorAmount[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit Donated(msg.sender, msg.value, totalDonations);
    }
}
