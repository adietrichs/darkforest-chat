const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const assert = chai.assert;

const Chat = artifacts.require('Chat');
const WhitelistDummy = artifacts.require('WhitelistDummy');

contract('Chat', async accounts => {
    beforeEach(async function () {
        this.chat = await Chat.new();
        await this.chat.initialize();
        this.whitelist = await WhitelistDummy.new();
        await this.whitelist.addToWhitelist(accounts[0]);
        await this.whitelist.addToWhitelist(accounts[1]);
    });

    it('should have set the owner', async function () {
        assert.equal(await this.chat.owner(), accounts[0], "owner not set")
    });

    it('should throw if whitelist not set', async function () {
        const messageContent = "Hello, World!";
        await assert.isRejected(
            this.chat.submit(messageContent),
            /whitelist contract is not set/,
            "can post message with whitelist not set"
        );
    });

    it('should throw if not on whitelist', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        const messageContent = "Hello, World!";
        await assert.isRejected(
            this.chat.submit(messageContent, {from: accounts[2]}),
            /player is not whitelisted/,
            "can post message although not on whitelist"
        );
    });

    it('should post and read successfully when on whitelist', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        const messageId = await this.chat.numMessages();
        assert.equal(messageId, 0, "unexpected messageId");
        const messageContent = "Hello, World!";
        await this.chat.submit(messageContent);
        const message = await this.chat.messages(messageId);
        assert.equal(message.author, accounts[0], "invalid message author");
        assert.equal(message.content, messageContent, "invalid message content");
    });

    it('should get all messages via bulkGetMessages', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        await this.chat.submit("preceding message");
        const firstMessageId = (await this.chat.numMessages()).toNumber();
        const messageContents = ["1", "2", "3", "4", "5", "6", "7"];
        for (const messageContent of messageContents) {
            await this.chat.submit(messageContent);
        }
        let startMessageId = firstMessageId;
        let bulkSize = 3;
        while (true) {
            messages = await this.chat.bulkGetMessages(startMessageId, startMessageId + bulkSize);
            for (let index = 0; index < messages.length; index++) {
                assert.equal(messages[index].author, accounts[0], `invalid message author at messageId ${startMessageId + index}`);
                assert.equal(messages[index].content, messageContents[startMessageId + index - firstMessageId], `invalid message content at messageId ${startMessageId + index}`);
            }
            startMessageId += messages.length;
            if (messages.length < bulkSize) {
                break;
            }
        }
        assert.equal(await this.chat.numMessages(), startMessageId, "invalid number of messages");
    });

    it('should throw when reporting non-existing message', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        const messageId = await this.chat.numMessages();
        await assert.isRejected(
            this.chat.report(messageId),
            /message does not exist/,
            "can report non-existing message"
        );
    });

    it('should throw when reporting own message', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        const messageId = await this.chat.numMessages();
        const messageContent = "Hello, World!";
        await this.chat.submit(messageContent);
        await assert.isRejected(
            this.chat.report(messageId),
            /cannot report own message/,
            "can report non-existing message"
        );
    });

    it('should report successfully', async function () {
        await this.chat.setWhitelist(this.whitelist.address);
        const messageId = await this.chat.numMessages();
        const messageContent = "Hello, World!";
        await this.chat.submit(messageContent);
        await this.chat.report(messageId, {from: accounts[1]});
        assert.equal(await this.chat.hasReported(accounts[1], messageId), true, "invalid report status");
        const message = await this.chat.messages(messageId);
        assert.equal(message.numReports, 1, "invalid number of reports");
    });

    it('should throw on duplicate report', async function () {
        const messageId = await this.chat.numMessages();
        await this.chat.setWhitelist(this.whitelist.address);
        const messageContent = "Hello, World!";
        await this.chat.submit(messageContent);
        await this.chat.report(messageId, {from: accounts[1]});
        await assert.isRejected(
            this.chat.report(messageId, {from: accounts[1]}),
            /message already reported/,
            "can report message twice"
        );
    });
});