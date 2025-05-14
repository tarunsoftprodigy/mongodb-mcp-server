declare module '@modelcontextprotocol/sdk/shared/transport.js' {
  export interface Transport {
    send(message: any): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export interface JSONRPCMessage {
    // Define properties as needed
  }
}

declare module "express";
declare module "http";
