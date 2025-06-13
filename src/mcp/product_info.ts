import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the product schema
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string()
});

export type Product = z.infer<typeof ProductSchema>;

// Cache for products to avoid reading file multiple times
let productsCache: Product[] | null = null;

// Function to read products from Excel file
async function readProducts(): Promise<Product[]> {
  if (productsCache) {
    return productsCache;
  }

  const filePath = join(__dirname, '../resources/product_details.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  
  if (!worksheet) {
    throw new Error('Products worksheet not found');
  }

  const products: Product[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row
    
    const product = {
      id: String(row.getCell(1).value),
      name: String(row.getCell(2).value),
      description: String(row.getCell(3).value),
      price: Number(row.getCell(4).value),
      category: String(row.getCell(5).value)
    };
    
    ProductSchema.parse(product);
    products.push(product);
  });
  
  productsCache = products;
  return products;
}

// Function to search products
async function searchProducts(query: string): Promise<Product[]> {
  const products = await readProducts();
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
}

// Function to get product by ID
async function getProductById(id: string): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find(product => product.id === id);
}

// Export the tool functions
export const product_info = {
  searchProducts,
  getProductById,
  getAllProducts: readProducts
}; 