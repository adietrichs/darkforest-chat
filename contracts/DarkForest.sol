// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface Whitelist {
  function isWhitelisted(address _addr) external view returns (bool);
}
