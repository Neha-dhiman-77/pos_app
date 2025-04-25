import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertStoreSchema, 
  insertProductSchema, 
  insertCategorySchema, 
  insertUnitSchema, 
  insertCustomerSchema, 
  insertSupplierSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  insertPurchaseSchema,
  insertPurchaseItemSchema,
  insertTransferSchema,
  insertTransferItemSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Stores API
  app.get("/api/stores", ensureAuthenticated, async (req, res) => {
    try {
      const stores = await storage.listStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve stores" });
    }
  });

  app.get("/api/stores/default", ensureAuthenticated, async (req, res) => {
    try {
      const store = await storage.getDefaultStore();
      if (!store) {
        return res.status(404).json({ message: "Default store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve default store" });
    }
  });

  app.get("/api/stores/:id", ensureAuthenticated, async (req, res) => {
    try {
      const store = await storage.getStore(parseInt(req.params.id));
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve store" });
    }
  });

  app.post("/api/stores", ensureAuthenticated, async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  app.put("/api/stores/:id", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const storeData = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(storeId, storeData);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update store" });
    }
  });

  // Products API
  app.get("/api/products", ensureAuthenticated, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      
      if (search) {
        const products = await storage.searchProducts(search);
        return res.json(products);
      }
      
      const products = await storage.listProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });

  app.get("/api/products/:id", ensureAuthenticated, async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve product" });
    }
  });

  app.post("/api/products", ensureAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", ensureAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Categories API
  app.get("/api/categories", ensureAuthenticated, async (req, res) => {
    try {
      const categories = await storage.listCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  app.post("/api/categories", ensureAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Units API
  app.get("/api/units", ensureAuthenticated, async (req, res) => {
    try {
      const units = await storage.listUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve units" });
    }
  });

  app.post("/api/units", ensureAuthenticated, async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(unitData);
      res.status(201).json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid unit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create unit" });
    }
  });

  // Inventory API
  app.get("/api/inventory", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const inventory = await storage.listInventory(storeId);
      
      // Get product details for each inventory item
      const fullInventory = await Promise.all(inventory.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(fullInventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve inventory" });
    }
  });

  app.get("/api/inventory/low-stock", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : 1; // Default to first store
      const lowStockItems = await storage.getLowStockItems(storeId);
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve low stock items" });
    }
  });

  // Customers API
  app.get("/api/customers", ensureAuthenticated, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      
      if (search) {
        const customers = await storage.searchCustomers(search);
        return res.json(customers);
      }
      
      const customers = await storage.listCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve customers" });
    }
  });

  app.get("/api/customers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve customer" });
    }
  });

  app.post("/api/customers", ensureAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(customerId, customerData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Suppliers API
  app.get("/api/suppliers", ensureAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.listSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve suppliers" });
    }
  });

  app.get("/api/suppliers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve supplier" });
    }
  });

  app.post("/api/suppliers", ensureAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(supplierId, supplierData);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  // Sales API
  app.get("/api/sales", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const sales = await storage.listSales(storeId);
      
      // Expand customer details
      const salesWithDetails = await Promise.all(sales.map(async (sale) => {
        let customer = undefined;
        if (sale.customerId) {
          customer = await storage.getCustomer(sale.customerId);
        }
        return {
          ...sale,
          customer
        };
      }));
      
      res.json(salesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve sales" });
    }
  });

  app.get("/api/sales/recent", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : 1; // Default to first store
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const recentSales = await storage.getRecentSales(storeId, limit);
      res.json(recentSales);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recent sales" });
    }
  });

  app.get("/api/sales/:id", ensureAuthenticated, async (req, res) => {
    try {
      const sale = await storage.getSale(parseInt(req.params.id));
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      // Get sale items
      const items = await storage.getSaleItems(sale.id);
      
      // Get customer if exists
      let customer = undefined;
      if (sale.customerId) {
        customer = await storage.getCustomer(sale.customerId);
      }
      
      res.json({
        ...sale,
        items,
        customer
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve sale" });
    }
  });

  app.post("/api/sales", ensureAuthenticated, async (req, res) => {
    try {
      // Validate sale data
      const { items, ...saleData } = req.body;
      
      const validatedSaleData = insertSaleSchema.parse({
        ...saleData,
        userId: req.user?.id || 1, // Use authenticated user ID
      });
      
      // Validate sale items
      const validatedItems = items.map((item: any) => insertSaleItemSchema.omit({ id: true, saleId: true }).parse(item));
      
      // Create the sale with items
      const sale = await storage.createSale(validatedSaleData, validatedItems);
      const saleItems = await storage.getSaleItems(sale.id);
      
      res.status(201).json({
        ...sale,
        items: saleItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["completed", "pending", "refunded"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const sale = await storage.updateSaleStatus(saleId, status);
      
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sale status" });
    }
  });

  // Purchases API
  app.get("/api/purchases", ensureAuthenticated, async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const purchases = await storage.listPurchases(storeId);
      
      // Expand supplier details
      const purchasesWithDetails = await Promise.all(purchases.map(async (purchase) => {
        let supplier = undefined;
        if (purchase.supplierId) {
          supplier = await storage.getSupplier(purchase.supplierId);
        }
        return {
          ...purchase,
          supplier
        };
      }));
      
      res.json(purchasesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve purchases" });
    }
  });

  app.get("/api/purchases/:id", ensureAuthenticated, async (req, res) => {
    try {
      const purchase = await storage.getPurchase(parseInt(req.params.id));
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      // Get purchase items
      const items = await storage.getPurchaseItems(purchase.id);
      
      // Get supplier if exists
      let supplier = undefined;
      if (purchase.supplierId) {
        supplier = await storage.getSupplier(purchase.supplierId);
      }
      
      res.json({
        ...purchase,
        items,
        supplier
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve purchase" });
    }
  });

  app.post("/api/purchases", ensureAuthenticated, async (req, res) => {
    try {
      // Validate purchase data
      const { items, ...purchaseData } = req.body;
      
      const validatedPurchaseData = insertPurchaseSchema.parse({
        ...purchaseData,
        userId: req.user?.id || 1, // Use authenticated user ID
      });
      
      // Validate purchase items
      const validatedItems = items.map((item: any) => insertPurchaseItemSchema.omit({ id: true, purchaseId: true }).parse(item));
      
      // Create the purchase with items
      const purchase = await storage.createPurchase(validatedPurchaseData, validatedItems);
      const purchaseItems = await storage.getPurchaseItems(purchase.id);
      
      res.status(201).json({
        ...purchase,
        items: purchaseItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  app.put("/api/purchases/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["completed", "pending", "canceled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const purchase = await storage.updatePurchaseStatus(purchaseId, status);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Failed to update purchase status" });
    }
  });

  // Transfers API
  app.get("/api/transfers", ensureAuthenticated, async (req, res) => {
    try {
      const fromStoreId = req.query.fromStoreId ? parseInt(req.query.fromStoreId as string) : undefined;
      const toStoreId = req.query.toStoreId ? parseInt(req.query.toStoreId as string) : undefined;
      
      const transfers = await storage.listTransfers(fromStoreId, toStoreId);
      
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve transfers" });
    }
  });

  app.get("/api/transfers/:id", ensureAuthenticated, async (req, res) => {
    try {
      const transfer = await storage.getTransfer(parseInt(req.params.id));
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      
      // Get transfer items
      const items = await storage.getTransferItems(transfer.id);
      
      // Get from and to stores
      const fromStore = await storage.getStore(transfer.fromStoreId);
      const toStore = await storage.getStore(transfer.toStoreId);
      
      res.json({
        ...transfer,
        items,
        fromStore,
        toStore
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve transfer" });
    }
  });

  app.post("/api/transfers", ensureAuthenticated, async (req, res) => {
    try {
      // Validate transfer data
      const { items, ...transferData } = req.body;
      
      const validatedTransferData = insertTransferSchema.parse({
        ...transferData,
        userId: req.user?.id || 1, // Use authenticated user ID
      });
      
      // Validate transfer items
      const validatedItems = items.map((item: any) => insertTransferItemSchema.omit({ id: true, transferId: true }).parse(item));
      
      // Create the transfer with items
      const transfer = await storage.createTransfer(validatedTransferData, validatedItems);
      const transferItems = await storage.getTransferItems(transfer.id);
      
      res.status(201).json({
        ...transfer,
        items: transferItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transfer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transfer" });
    }
  });

  app.put("/api/transfers/:id/status", ensureAuthenticated, async (req, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["completed", "pending", "canceled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const transfer = await storage.updateTransferStatus(transferId, status);
      
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transfer status" });
    }
  });

  // Users API
  app.get("/api/users", ensureAuthenticated, async (req, res) => {
    try {
      const users = await storage.listUsers();
      
      // Remove password from response
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
