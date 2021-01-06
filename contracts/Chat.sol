// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./DarkForest.sol";

contract Chat is OwnableUpgradeable {
    struct Message {
        address author;
        string content;
        uint256 timestamp;
        uint256 numReports;
    }
    event NewMessage(
        uint256 indexed messageId,
        address indexed author,
        string content
    );
    event MessageReported(
        uint256 indexed messageId,
        uint256 numReports
    );

    Whitelist whitelist;
    Message[] public messages;
    uint256 public numMessages;
    mapping(address => mapping(uint256 => bool)) reported;

    function initialize() external initializer {
        OwnableUpgradeable.__Ownable_init();
    }

    modifier onlyWhitelisted() {
        require(
            address(whitelist) != address(0),
            "whitelist contract is not set"
        );
        require(
            whitelist.isWhitelisted(msg.sender),
            "player is not whitelisted"
        );
        _;
    }

    function bulkGetMessages(uint256 startIdx, uint256 endIdx) public view returns (Message[] memory _messages) {
        if (endIdx > numMessages) {
            endIdx = numMessages;
        }
        require(startIdx <= endIdx, "invalid range");
        _messages = new Message[](endIdx - startIdx);
        for (uint256 i = startIdx; i < endIdx; i++) {
            _messages[i - startIdx] = messages[i];
        }
    }

    function hasReported(address _addr, uint256 messageId) public view returns (bool) {
        return reported[_addr][messageId];
    }

    function setWhitelist(address _whitelist) external onlyOwner {
        whitelist = Whitelist(_whitelist);
    }

    function submit(string calldata _content) external onlyWhitelisted returns (uint256 messageId) {
        messages.push(Message(msg.sender, _content, block.timestamp, 0));
        emit NewMessage(numMessages, msg.sender, _content);
        return numMessages++;
    }

    function report(uint256 messageId) external onlyWhitelisted returns (uint256) {
        require(messageId < numMessages, "message does not exist");
        Message storage message = messages[messageId];
        require(msg.sender != message.author, "cannot report own message");
        require(!hasReported(msg.sender, messageId), "message already reported");
        reported[msg.sender][messageId] = true;
        message.numReports++;
        emit MessageReported(messageId, message.numReports);
        return message.numReports;
    }
}
