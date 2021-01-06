const ABI_URL = "https://raw.githubusercontent.com/adietrichs/darkforest-chat/d2a49e142ddd9f2b1cd7d54c943b82d654f72e48/plugin/Chat.json";
const CONTRACT_ADDRESS = "0xea5C382cfAF7CbBc58b3D5aF452C2587CbBBdBbf";

class Chat {
  chat;

  async render(container) {
    const abi = (await (await fetch(ABI_URL)).json()).abi;
    const Contract = df.contractsAPI.coreContract.__proto__.constructor;
    this.chat = new Contract(CONTRACT_ADDRESS, abi, df.contractsAPI.coreContract.signer);
    console.log(`current messages: ${await this.chat.numMessages()}`);
  }
}

plugin.register(new Chat());