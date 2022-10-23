// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title FMD
 * @dev FMD
 */
contract FMD is ERC20 {

    /**
     * @dev Sets the supply of FMD token
     * @param initialSupply the initial supply of FMD token
     */
    constructor(address _manager, uint256 initialSupply) ERC20("FundToken", "FMD") {
        _mint(_manager, initialSupply * (10**18));
    }
}