// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CollateralToken.sol";

contract CollateralBackedToken is ERC20 {
    CollateralToken private _token;

    event Deposited(address indexed dst, uint256 amount);
    event Withdrew(address indexed src, uint256 amount);

    constructor(address addressCollateralToken) ERC20("CollateralBackedToken", "CBT") {
        _token = CollateralToken(addressCollateralToken);
    }

    function deposit(uint256 amount) public {
        require(
            _token.balanceOf(_msgSender()) >= amount,
            "CollateralBackedToken: You do not have enough CollateralToken"
        );
        _token.backerTransfer(_msgSender(), amount);
        _mint(_msgSender(), amount / 2);
        emit Deposited(_msgSender(), amount);
    }

    function withdraw(uint256 amount) public {
        require(balanceOf(_msgSender()) >= amount, "CollateralBackedToken: You do not have enough CollateralBackToken");
        _burn(_msgSender(), amount);
        _token.transfer(_msgSender(), amount * 2);
        emit Withdrew(_msgSender(), amount);
    }
}
