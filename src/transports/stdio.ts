import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeTools } from '../mcp/tools.js';

console.log('Starting stdio server...');

const server = new McpServer({
  name: 'pointnxt_mcp_server',
  version: '1.0.0'
});

const transport = new StdioServerTransport();

initializeTools(server);

server.connect(transport).catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

console.log('Stdio server started successfully');
