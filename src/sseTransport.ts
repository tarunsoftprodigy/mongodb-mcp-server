/* @ts-nocheck */
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import * as http from "http";
import { Request, Response } from "express";

export class SseTransport implements Transport {
  private clients: Response[] = [];
  private server: http.Server;
  private app = express();
  public onMessage: ((message: JSONRPCMessage) => void) | undefined;

  constructor(port: number) {
    this.app.use(express.json());

    // SSE endpoint for client connections
    this.app.get('/sse', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      this.clients.push(res);

      req.on('close', () => {
        this.clients = this.clients.filter(client => client !== res);
      });
    });

    // Endpoint to receive messages from client
    this.app.post('/message', (req, res) => {
      const message: JSONRPCMessage = req.body;
      if (this.onMessage) {
        this.onMessage(message);
      }
      res.sendStatus(200);
    });

    this.server = this.app.listen(port, () => {
      console.log(`SSE server listening on port ${port}`);
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      (client as any).write(`data: ${data}\n\n`);
    }
  }

  async close(): Promise<void> {
    this.server.close();
  }
}
