// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract WETH is ERC20 {
    using Address for address payable;

    event Deposited(address indexed dst, uint256 amount);
    event Withdrew(address indexed src, uint256 amount);

    constructor() ERC20("Wrapped Ether", "WETH") {}

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        _mint(_msgSender(), msg.value);
        emit Deposited(_msgSender(), msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balanceOf(_msgSender()) >= amount, "WETH: not enough funds to withdraw");
        _burn(_msgSender(), amount);
        payable(_msgSender()).sendValue(amount);
        emit Withdrew(_msgSender(), amount);
    }
}
