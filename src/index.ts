#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { loadConfig } from './config.js';
import { ODataClient } from './odata/client.js';
import { registerTools } from './tools/index.js';

const config = loadConfig();
const client = new ODataClient(config);

// serveStdio takes a factory: it builds one server instance per connection.
serveStdio(() => {
  const server = new McpServer(
    { name: 'sap-odata-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );
  registerTools(server, client);
  return server;
});

// Never console.log() in an stdio MCP server — stdout carries the protocol. Use stderr.
console.error(`sap-odata-mcp running on stdio → ${config.SAP_BASE_URL}`);
