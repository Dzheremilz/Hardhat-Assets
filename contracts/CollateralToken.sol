// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CollateralToken is ERC20, AccessControl {
    bytes32 public constant BACKER_ROLE = keccak256("BACKER_ROLE");

    event BackerAdded(address indexed account);
    event BackerRevoked(address indexed account);
    event BackerTransfered(address indexed backer, address indexed account, uint256 amount);

    constructor() ERC20("CollateralToken", "CT") {
        _mint(msg.sender, 1000000000 * 10**18);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addBacker(address account) public {
        grantRole(BACKER_ROLE, account);
        emit BackerAdded(account);
    }

    function revokeBacker(address account) public {
        revokeRole(BACKER_ROLE, account);
        emit BackerRevoked(account);
    }

    function backerTransfer(address account, uint256 amount) public onlyRole(BACKER_ROLE) {
        require(balanceOf(account) >= amount, "CollateralToken: this account do not have enough funds");
        _transfer(account, msg.sender, amount);
        emit BackerTransfered(msg.sender, account, amount);
    }

    function isBacker(address account) public view returns (bool) {
        return hasRole(BACKER_ROLE, account);
    }
}
