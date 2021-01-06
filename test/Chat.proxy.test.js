const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

chai.use(chaiAsPromised);
const assert = chai.assert;

const Chat = artifacts.require('Chat');

contract('Chat (proxy)', async accounts => {
    beforeEach(async function () {
        this.chat = await deployProxy(Chat, { unsafeAllowCustomTypes: true });
    });

    it('should have set the owner', async function () {
        assert.equal(await this.chat.owner(), accounts[0], "owner not set")
    });
});