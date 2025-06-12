import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z as zod } from "zod";
import axios from "axios";
import { connectionsBySessionId, globalSessionId } from "./connections";
import { AxiosError } from "axios";
import { API_DOMAINS } from "../config.js";

export function initializeTools(server: McpServer) {
  
} 