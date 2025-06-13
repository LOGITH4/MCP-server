import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { initializeTools } from '../mcp/tools.js';
import http from 'http';

const server = new McpServer({
  name: 'pointnxt_mcp_server',
  version: '1.0.0'
});

console.log('Starting SSE server...');

const httpServer = http.createServer((req, res) => {
  console.log('New connection received');
  const transport = new SSEServerTransport('http://localhost:3000', res);
  initializeTools(server);
  server.connect(transport).catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
});

httpServer.listen(3000, () => {
  console.log('SSE server listening on port 3000');
}); 