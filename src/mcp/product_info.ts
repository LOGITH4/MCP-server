import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { z } from "zod";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the product schema based on your Excel headers
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  sku: z.string().optional(),
  type: z.string().optional(),
  shortDescription: z.string().optional(),
  inStock: z.boolean().optional(),
  stock: z.number().optional(),
  regularPrice: z.number().optional(),
  salePrice: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// Cache for products to avoid reading file multiple times
let productsCache: Product[] | null = null;

// Function to read products from Excel file
async function readProducts(): Promise<Product[]> {
  if (productsCache) {
    return productsCache;
  }

  try {
    const filePath = join(__dirname, "../resources/product_details.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("Products worksheet not found");
    }

    const products: Product[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      // Map based on your Excel headers
      const product = {
        id: String(row.getCell(1).value || ""), // ID
        type: String(row.getCell(2).value || ""), // Type
        sku: String(row.getCell(3).value || ""), // SKU
        name: String(row.getCell(5).value || ""), // Name (column 5)
        shortDescription: String(row.getCell(8).value || ""), // Short description
        description: String(row.getCell(9).value || ""), // Description
        inStock: String(row.getCell(19).value || "").toLowerCase() === "yes", // In stock?
        stock: Number(row.getCell(20).value || 0), // Stock
        salePrice: Number(row.getCell(26).value || 0), // Sale price
        regularPrice: Number(row.getCell(27).value || 0), // Regular price
        price: Number(row.getCell(27).value || row.getCell(26).value || 0), // Use regular price, fallback to sale price
        category: String(row.getCell(28).value || ""), // Categories
      };

      // Only add if we have essential data
      if (product.id && product.name) {
        try {
          ProductSchema.parse(product);
          products.push(product);
        } catch (error) {
          console.error(`Error parsing product row ${rowNumber}:`, error);
        }
      }
    });

    productsCache = products;
    return products;
  } catch (error) {
    console.error("Error reading products file:", error);
    throw new Error(`Failed to read products: ${error.message}`);
  }
}

// Function to search products
async function searchProducts(query: string): Promise<Product[]> {
  const products = await readProducts();
  const searchTerm = query.toLowerCase();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm))
  );
}

// Function to get product by ID
async function getProductById(id: string): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find((product) => product.id === id);
}

// Export the tool functions
export const product_info = {
  searchProducts,
  getProductById,
  getAllProducts: readProducts,
};
