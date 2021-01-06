// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface Whitelist {
  function isWhitelisted(address _addr) external view returns (bool);
}

contract WhitelistDummy {
  mapping(address => bool) allowedAccounts;

  function isWhitelisted(address _addr) public view returns (bool) {
    return allowedAccounts[_addr];
  }

  function addToWhitelist(address _addr) external {
    allowedAccounts[_addr] = true;
  }

  function removeFromWhitelist(address _addr) external {
    allowedAccounts[_addr] = false;
  }
}
