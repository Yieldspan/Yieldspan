// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ETHStakeBridge {
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    mapping(address => uint256) public balances;

    function stakeETH() external payable {
        require(msg.value > 0, "Stake amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function emergencyWithdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    receive() external payable {
        revert("Use stakeETH()");
    }
}
