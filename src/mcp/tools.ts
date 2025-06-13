// tools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { product_info } from "./product_info";
import { z } from "zod";

export function initializeTools(server: McpServer) {
  server.registerTool(
    "product_info",
    {
      description: "Get information about products from the product database",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe(
            "Search query to find products by name, description, or category"
          ),
        id: z
          .string()
          .optional()
          .describe("Product ID to get specific product details"),
      },
      // Remove outputSchema since we might return multiple products or no products
      // The MCP framework will handle the response format automatically
    },
    async (params: { query?: string; id?: string }, extra) => {
      try {
        let result;
        let resultText = "";

        if (params.id) {
          const product = await product_info.getProductById(params.id);
          if (!product) {
            return {
              content: [
                {
                  type: "text",
                  text: `Product with ID ${params.id} not found`,
                },
              ],
            };
          }
          result = product;
          resultText = `Found product:\n${JSON.stringify(result, null, 2)}`;
        } else if (params.query) {
          // Search products
          const products = await product_info.searchProducts(params.query);
          if (products.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No products found for query: ${params.query}`,
                },
              ],
            };
          }
          result = products;
          resultText = `Found ${products.length} product(s):\n${JSON.stringify(
            result,
            null,
            2
          )}`;
        } else {
          const allProducts = await product_info.getAllProducts();
          result = allProducts.slice(0, 10);
          resultText = `Showing first 10 products (total: ${
            allProducts.length
          }):\n${JSON.stringify(result, null, 2)}`;
        }

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      } catch (error) {
        console.error("Error in product_info tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving product information: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
