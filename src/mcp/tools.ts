import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { product_info } from './product_info';
import { z } from 'zod';

export function initializeTools(server: McpServer) {
  server.registerTool('product_info', {
    description: 'Get information about products from the product database',
    inputSchema: {
      query: z.string().optional().describe('Search query to find products by name, description, or category'),
      id: z.string().optional().describe('Product ID to get specific product details')
    },
    outputSchema: {
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      category: z.string()
    }
  }, async (params: { query?: string; id?: string }, extra) => {
    let result;
    if (params.id) {
      const product = product_info.getProductById(params.id);
      if (!product) {
        throw new Error(`Product with ID ${params.id} not found`);
      }
      result = product;
    } else if (params.query) {
      result = product_info.searchProducts(params.query);
    } else {
      result = product_info.getAllProducts();
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  });
} 