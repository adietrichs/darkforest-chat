const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Chat = artifacts.require('Chat');

module.exports = async deployer => {
    await deployProxy(Chat, { deployer, unsafeAllowCustomTypes: true });
};
