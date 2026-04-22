// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    /// @notice Transfer fee in basis points (100 = 1%, 1000 = 10%). 0 = no fee.
    uint256 public feeBps;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// @param _feeBps Transfer fee in basis points (0–1000). Set 0 for no fee.
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        uint256 _feeBps
    ) {
        require(_feeBps <= 1000, "Fee cannot exceed 10%");
        name = _name;
        symbol = _symbol;
        feeBps = _feeBps;
        owner = msg.sender;
        totalSupply = _supply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function _applyFee(address from, uint256 amount) internal returns (uint256 net) {
        if (feeBps == 0) return amount;
        uint256 fee = (amount * feeBps) / 10000;
        net = amount - fee;
        balanceOf[owner] += fee;
        emit Transfer(from, owner, fee);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        uint256 net = _applyFee(msg.sender, amount);
        balanceOf[to] += net;
        emit Transfer(msg.sender, to, net);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        uint256 net = _applyFee(from, amount);
        balanceOf[to] += net;
        emit Transfer(from, to, net);
        return true;
    }
}
