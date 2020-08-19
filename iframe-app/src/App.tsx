import React from "react";
import * as connext from "@connext/client";
import { IConnextClient, JsonRpcRequest, ChannelMethods } from "@connext/types";
import { utils } from "ethers";

class App extends React.Component {
  private channel: IConnextClient | undefined;
  private parentOrigin: string | undefined;

  async handleRequest(request: JsonRpcRequest) {
    const channel = this.channel as IConnextClient;
    let result: any | undefined;
    switch (request.method) {
      case "connext_publicIdentifier":
        result = { publicIdentifier: channel.publicIdentifier };
        break;
      case "connext_deposit":
        result = {
          txhash: (
            await channel.deposit({
              amount: utils.parseEther(request.params.amount).toString(),
              assetId: request.params.assetId,
            })
          ).transaction.hash,
        };
        break;
      case "connext_withdraw":
        result = {
          txhash: (
            await channel.withdraw({
              recipient: request.params.recipient,
              amount: utils.parseEther(request.params.amount).toString(),
              assetId: request.params.assetId,
            })
          ).transaction.hash,
        };
        break;
      case "connext_balance":
        result = {
          balance: "",
        };
        break;
      case "connext_transfer":
        result = {
          paymentId: "",
        };
        break;
      case "connext_getTransactionHistory":
        result = {
          transactions: [],
        };
        break;
    }
    if (request.method.startsWith("chan_")) {
      result = await channel.channelProvider.send(
        request.method as ChannelMethods,
        request.params
      );
    }
    if (typeof result === "undefined") {
      throw new Error(`Failed to responde to request method:${request.method}`);
    }
    return result;
  }

  async handleIncomingMessages(e: MessageEvent) {
    if (e.origin !== this.parentOrigin) return;
    const request = JSON.parse(e.data);
    let response: any;
    try {
      const result = await this.handleRequest(request);
      response = {
        id: request.id,
        result,
      };
    } catch (e) {
      response = {
        id: request.id,
        error: {
          message: e.message,
        },
      };
    }
    window.parent.postMessage(JSON.stringify(response), this.parentOrigin);
  }

  async componentDidMount() {
    this.parentOrigin = new URL(document.referrer).origin;
    this.channel = await connext.connect("rinkeby");
    window.addEventListener(
      "message",
      (e) => this.handleIncomingMessages(e),
      true
    );
    window.parent.postMessage("event:iframe-initialized", this.parentOrigin);
  }

  render() {
    return (
      <div className="App">
        <div className="Content">Test</div>
      </div>
    );
  }
}

export default App;
