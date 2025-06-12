import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initializeTools } from "./tools";

export const mcpServer = new McpServer({
  name: "pointnxt-mcp",
  version: "1.0.0",
});

initializeTools(mcpServer);
