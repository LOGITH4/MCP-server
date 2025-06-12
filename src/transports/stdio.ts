import { API_DOMAINS } from "../config";
import { connectionsBySessionId, globalSessionId } from "../mcp/connections";
import { mcpServer } from "../mcp/index";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";

const transport = new StdioServerTransport();

(async () => {
  try {
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (!userEmail || !userPassword) {
      throw new Error("User email and password is required in ENV");
    }

    const url = `${API_DOMAINS.POINTNXT}/v1/external/auth/login`;
    const data = (
      await axios.post(url, { email: userEmail, password: userPassword })
    ).data;

    const sellerToken = data.token as string;

    connectionsBySessionId[globalSessionId] = { transport, sellerToken };
    await mcpServer.connect(transport);
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.error({
        success: false,
        error: err.response?.data,
      });
    } else if (err instanceof Error) {
      console.error({
        success: false,
        error: err.message,
      });
    }

    process.exit(1);
  }
})();
