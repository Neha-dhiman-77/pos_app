import { 
  users, type User, type InsertUser,
  stores, type Store, type InsertStore,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  units, type Unit, type InsertUnit,
  inventory, type Inventory, type InsertInventory,
  customers, type Customer, type InsertCustomer,
  suppliers, type Supplier, type InsertSupplier,
  sales, type Sale, type InsertSale,
  saleItems, type SaleItem, type InsertSaleItem,
  purchases, type Purchase, type InsertPurchase,
  purchaseItems, type PurchaseItem, type InsertPurchaseItem,
  transfers, type Transfer, type InsertTransfer,
  transferItems, type TransferItem, type InsertTransferItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<Store>): Promise<Store | undefined>;
  listStores(): Promise<Store[]>;
  getDefaultStore(): Promise<Store | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  listProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  listCategories(): Promise<Category[]>;
  
  // Unit operations
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, unit: Partial<Unit>): Promise<Unit | undefined>;
  listUnits(): Promise<Unit[]>;
  
  // Inventory operations
  getInventory(productId: number, storeId: number): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<Inventory>): Promise<Inventory | undefined>;
  listInventory(storeId?: number): Promise<Inventory[]>;
  getLowStockItems(storeId: number): Promise<(Inventory & { product: Product })[]>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  listCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;
  
  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier | undefined>;
  listSuppliers(): Promise<Supplier[]>;
  
  // Sale operations
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;
  updateSaleStatus(id: number, status: string): Promise<Sale | undefined>;
  listSales(storeId?: number): Promise<Sale[]>;
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  getRecentSales(storeId: number, limit: number): Promise<(Sale & { customer?: Customer })[]>;
  
  // Purchase operations
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  listPurchases(storeId?: number): Promise<Purchase[]>;
  getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]>;
  
  // Transfer operations
  getTransfer(id: number): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer, items: InsertTransferItem[]): Promise<Transfer>;
  updateTransferStatus(id: number, status: string): Promise<Transfer | undefined>;
  listTransfers(fromStoreId?: number, toStoreId?: number): Promise<Transfer[]>;
  getTransferItems(transferId: number): Promise<TransferItem[]>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private units: Map<number, Unit>;
  private inventory: Map<number, Inventory>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private sales: Map<number, Sale>;
  private saleItems: Map<number, SaleItem>;
  private purchases: Map<number, Purchase>;
  private purchaseItems: Map<number, PurchaseItem>;
  private transfers: Map<number, Transfer>;
  private transferItems: Map<number, TransferItem>;
  
  // Auto increment IDs
  private userIdCounter: number;
  private storeIdCounter: number;
  private productIdCounter: number;
  private categoryIdCounter: number;
  private unitIdCounter: number;
  private inventoryIdCounter: number;
  private customerIdCounter: number;
  private supplierIdCounter: number;
  private saleIdCounter: number;
  private saleItemIdCounter: number;
  private purchaseIdCounter: number;
  private purchaseItemIdCounter: number;
  private transferIdCounter: number;
  private transferItemIdCounter: number;
  
  // Session store
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.units = new Map();
    this.inventory = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.sales = new Map();
    this.saleItems = new Map();
    this.purchases = new Map();
    this.purchaseItems = new Map();
    this.transfers = new Map();
    this.transferItems = new Map();
    
    this.userIdCounter = 1;
    this.storeIdCounter = 1;
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.unitIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.customerIdCounter = 1;
    this.supplierIdCounter = 1;
    this.saleIdCounter = 1;
    this.saleItemIdCounter = 1;
    this.purchaseIdCounter = 1;
    this.purchaseItemIdCounter = 1;
    this.transferIdCounter = 1;
    this.transferItemIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Create default store
    const defaultStore: InsertStore = {
      name: "Main Store",
      address: "123 Main St, Anytown",
      phone: "555-1234",
      email: "main@propos.com",
      isDefault: true
    };
    this.createStore(defaultStore);
    
    // Create default admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$4qXjITwSVWUECxlLIRLhAeOoQkayFFBB3m0jRKXej9XrG0f.l3GU.", // "admin123"
      fullName: "Admin User",
      email: "admin@propos.com",
      role: "admin",
      storeId: 1,
      active: true
    };
    this.createUser(adminUser);
    
    // Create default categories
    const categories = [
      { name: "Groceries", description: "Food and grocery items" },
      { name: "Electronics", description: "Electronic devices and accessories" },
      { name: "Clothing", description: "Apparel and fashion items" },
      { name: "Home", description: "Home goods and furniture" }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Create default units
    const units = [
      { name: "Piece", shortName: "pc" },
      { name: "Kilogram", shortName: "kg" },
      { name: "Liter", shortName: "L" },
      { name: "Box", shortName: "box" },
      { name: "Pack", shortName: "pack" }
    ];
    
    units.forEach(unit => this.createUnit(unit));
    
    // Create default products
    const products: InsertProduct[] = [
      { name: "Organic Bananas", sku: "PRD-001", barcode: "123456789", description: "Fresh organic bananas", price: 1.99, cost: 1.20, categoryId: 1, unitId: 2, minStock: 10, active: true },
      { name: "Whole Wheat Bread", sku: "PRD-002", barcode: "234567890", description: "Whole grain bread", price: 3.49, cost: 2.00, categoryId: 1, unitId: 1, minStock: 15, active: true },
      { name: "Fresh Milk 1L", sku: "PRD-003", barcode: "345678901", description: "Fresh whole milk", price: 2.99, cost: 1.80, categoryId: 1, unitId: 3, minStock: 25, active: true },
      { name: "Wireless Earbuds", sku: "PRD-004", barcode: "456789012", description: "Bluetooth wireless earbuds", price: 49.99, cost: 30.00, categoryId: 2, unitId: 1, minStock: 5, active: true },
      { name: "Paper Towels", sku: "PRD-005", barcode: "567890123", description: "Pack of 6 paper towel rolls", price: 8.99, cost: 5.50, categoryId: 4, unitId: 5, minStock: 20, active: true }
    ];
    
    products.forEach(product => this.createProduct(product));
    
    // Create inventory for each product in the default store
    const inventoryItems: InsertInventory[] = [
      { productId: 1, storeId: 1, quantity: 2 },  // Low stock
      { productId: 2, storeId: 1, quantity: 3 },  // Low stock
      { productId: 3, storeId: 1, quantity: 12 }, // Low stock
      { productId: 4, storeId: 1, quantity: 10 },
      { productId: 5, storeId: 1, quantity: 8 }   // Low stock
    ];
    
    inventoryItems.forEach(item => this.createInventory(item));
    
    // Create default customers
    const customers: InsertCustomer[] = [
      { name: "Michael Johnson", phone: "555-1001", email: "michael@example.com", address: "456 Oak St", loyaltyPoints: 120 },
      { name: "Sarah Williams", phone: "555-1002", email: "sarah@example.com", address: "789 Pine St", loyaltyPoints: 85 },
      { name: "Jacob Martinez", phone: "555-1003", email: "jacob@example.com", address: "321 Maple St", loyaltyPoints: 200 },
      { name: "Emma Thompson", phone: "555-1004", email: "emma@example.com", address: "654 Cedar St", loyaltyPoints: 50 },
      { name: "David Clark", phone: "555-1005", email: "david@example.com", address: "987 Birch St", loyaltyPoints: 150 }
    ];
    
    customers.forEach(customer => this.createCustomer(customer));
    
    // Create default suppliers
    const suppliers: InsertSupplier[] = [
      { name: "Global Foods Inc.", contactPerson: "John Smith", phone: "555-2001", email: "orders@globalfoods.com", address: "100 Industry Blvd" },
      { name: "Tech Suppliers Ltd.", contactPerson: "Lisa Wang", phone: "555-2002", email: "sales@techsuppliers.com", address: "200 Commerce Dr" },
      { name: "Home Essentials Co.", contactPerson: "Robert Brown", phone: "555-2003", email: "info@homeessentials.com", address: "300 Retail Rd" }
    ];
    
    suppliers.forEach(supplier => this.createSupplier(supplier));
    
    // Create some sample sales data
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    
    const sales: InsertSale[] = [
      { 
        invoiceNumber: "INV-0025", 
        customerId: 1, 
        userId: 1, 
        storeId: 1, 
        date: currentDate, 
        totalAmount: 285.20, 
        discount: 0, 
        tax: 0, 
        paymentMethod: "cash", 
        paymentStatus: "paid", 
        status: "completed" 
      },
      { 
        invoiceNumber: "INV-0024", 
        customerId: 2, 
        userId: 1, 
        storeId: 1, 
        date: currentDate, 
        totalAmount: 68.75, 
        discount: 0, 
        tax: 0, 
        paymentMethod: "card", 
        paymentStatus: "paid", 
        status: "completed" 
      },
      { 
        invoiceNumber: "INV-0023", 
        customerId: 3, 
        userId: 1, 
        storeId: 1, 
        date: currentDate, 
        totalAmount: 172.50, 
        discount: 0, 
        tax: 0, 
        paymentMethod: "card", 
        paymentStatus: "pending", 
        status: "pending" 
      },
      { 
        invoiceNumber: "INV-0022", 
        customerId: 4, 
        userId: 1, 
        storeId: 1, 
        date: yesterday, 
        totalAmount: 43.25, 
        discount: 0, 
        tax: 0, 
        paymentMethod: "cash", 
        paymentStatus: "paid", 
        status: "completed" 
      },
      { 
        invoiceNumber: "INV-0021", 
        customerId: 5, 
        userId: 1, 
        storeId: 1, 
        date: yesterday, 
        totalAmount: 195.30, 
        discount: 0, 
        tax: 0, 
        paymentMethod: "card", 
        paymentStatus: "refunded", 
        status: "refunded" 
      }
    ];
    
    sales.forEach(sale => {
      this.createSale(sale, []);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeIdCounter++;
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }
  
  async updateStore(id: number, storeData: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    
    const updatedStore = { ...store, ...storeData };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }
  
  async listStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }
  
  async getDefaultStore(): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(store => store.isDefault);
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }
  
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.barcode === barcode);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async listProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(lowerQuery) || 
      product.sku.toLowerCase().includes(lowerQuery) || 
      (product.barcode && product.barcode.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async listCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  // Unit operations
  async getUnit(id: number): Promise<Unit | undefined> {
    return this.units.get(id);
  }
  
  async createUnit(unit: InsertUnit): Promise<Unit> {
    const id = this.unitIdCounter++;
    const newUnit: Unit = { ...unit, id };
    this.units.set(id, newUnit);
    return newUnit;
  }
  
  async updateUnit(id: number, unitData: Partial<Unit>): Promise<Unit | undefined> {
    const unit = this.units.get(id);
    if (!unit) return undefined;
    
    const updatedUnit = { ...unit, ...unitData };
    this.units.set(id, updatedUnit);
    return updatedUnit;
  }
  
  async listUnits(): Promise<Unit[]> {
    return Array.from(this.units.values());
  }
  
  // Inventory operations
  async getInventory(productId: number, storeId: number): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(
      inv => inv.productId === productId && inv.storeId === storeId
    );
  }
  
  async createInventory(inventory: InsertInventory): Promise<Inventory> {
    const id = this.inventoryIdCounter++;
    const newInventory: Inventory = { ...inventory, id };
    this.inventory.set(id, newInventory);
    return newInventory;
  }
  
  async updateInventory(id: number, inventoryData: Partial<Inventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory = { ...inventory, ...inventoryData };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }
  
  async listInventory(storeId?: number): Promise<Inventory[]> {
    let inventoryList = Array.from(this.inventory.values());
    
    if (storeId) {
      inventoryList = inventoryList.filter(inv => inv.storeId === storeId);
    }
    
    return inventoryList;
  }
  
  async getLowStockItems(storeId: number): Promise<(Inventory & { product: Product })[]> {
    const inventoryList = await this.listInventory(storeId);
    const lowStockItems: (Inventory & { product: Product })[] = [];
    
    for (const item of inventoryList) {
      const product = await this.getProduct(item.productId);
      if (product && item.quantity <= product.minStock) {
        lowStockItems.push({ ...item, product });
      }
    }
    
    return lowStockItems;
  }
  
  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async listCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) || 
      (customer.phone && customer.phone.includes(query)) || 
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const newSupplier: Supplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }
  
  async updateSupplier(id: number, supplierData: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...supplierData };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  async listSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  // Sale operations
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }
  
  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    const id = this.saleIdCounter++;
    const newSale: Sale = { ...sale, id };
    this.sales.set(id, newSale);
    
    // Add sale items
    for (const item of items) {
      const saleItemId = this.saleItemIdCounter++;
      const newSaleItem: SaleItem = { ...item, id: saleItemId, saleId: id };
      this.saleItems.set(saleItemId, newSaleItem);
      
      // Update inventory
      const inventory = await this.getInventory(item.productId, newSale.storeId);
      if (inventory) {
        await this.updateInventory(inventory.id, { quantity: inventory.quantity - item.quantity });
      }
    }
    
    return newSale;
  }
  
  async updateSaleStatus(id: number, status: string): Promise<Sale | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;
    
    const updatedSale: Sale = { ...sale, status };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }
  
  async listSales(storeId?: number): Promise<Sale[]> {
    let salesList = Array.from(this.sales.values());
    
    if (storeId) {
      salesList = salesList.filter(sale => sale.storeId === storeId);
    }
    
    return salesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return Array.from(this.saleItems.values()).filter(item => item.saleId === saleId);
  }
  
  async getRecentSales(storeId: number, limit: number): Promise<(Sale & { customer?: Customer })[]> {
    const sales = await this.listSales(storeId);
    const recentSales = sales.slice(0, limit);
    
    const salesWithCustomers: (Sale & { customer?: Customer })[] = [];
    
    for (const sale of recentSales) {
      let customer: Customer | undefined;
      if (sale.customerId) {
        customer = await this.getCustomer(sale.customerId);
      }
      
      salesWithCustomers.push({ ...sale, customer });
    }
    
    return salesWithCustomers;
  }
  
  // Purchase operations
  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }
  
  async createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const newPurchase: Purchase = { ...purchase, id };
    this.purchases.set(id, newPurchase);
    
    // Add purchase items
    for (const item of items) {
      const purchaseItemId = this.purchaseItemIdCounter++;
      const newPurchaseItem: PurchaseItem = { ...item, id: purchaseItemId, purchaseId: id };
      this.purchaseItems.set(purchaseItemId, newPurchaseItem);
      
      // Update inventory
      const inventory = await this.getInventory(item.productId, newPurchase.storeId);
      if (inventory) {
        await this.updateInventory(inventory.id, { quantity: inventory.quantity + item.quantity });
      } else {
        await this.createInventory({
          productId: item.productId,
          storeId: newPurchase.storeId,
          quantity: item.quantity
        });
      }
    }
    
    return newPurchase;
  }
  
  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase: Purchase = { ...purchase, status };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }
  
  async listPurchases(storeId?: number): Promise<Purchase[]> {
    let purchasesList = Array.from(this.purchases.values());
    
    if (storeId) {
      purchasesList = purchasesList.filter(purchase => purchase.storeId === storeId);
    }
    
    return purchasesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    return Array.from(this.purchaseItems.values()).filter(item => item.purchaseId === purchaseId);
  }
  
  // Transfer operations
  async getTransfer(id: number): Promise<Transfer | undefined> {
    return this.transfers.get(id);
  }
  
  async createTransfer(transfer: InsertTransfer, items: InsertTransferItem[]): Promise<Transfer> {
    const id = this.transferIdCounter++;
    const newTransfer: Transfer = { ...transfer, id };
    this.transfers.set(id, newTransfer);
    
    // Add transfer items
    for (const item of items) {
      const transferItemId = this.transferItemIdCounter++;
      const newTransferItem: TransferItem = { ...item, id: transferItemId, transferId: id };
      this.transferItems.set(transferItemId, newTransferItem);
      
      // Update inventory for source store (decrease)
      const sourceInventory = await this.getInventory(item.productId, newTransfer.fromStoreId);
      if (sourceInventory) {
        await this.updateInventory(sourceInventory.id, { quantity: sourceInventory.quantity - item.quantity });
      }
      
      // Update inventory for destination store (increase)
      const destInventory = await this.getInventory(item.productId, newTransfer.toStoreId);
      if (destInventory) {
        await this.updateInventory(destInventory.id, { quantity: destInventory.quantity + item.quantity });
      } else {
        await this.createInventory({
          productId: item.productId,
          storeId: newTransfer.toStoreId,
          quantity: item.quantity
        });
      }
    }
    
    return newTransfer;
  }
  
  async updateTransferStatus(id: number, status: string): Promise<Transfer | undefined> {
    const transfer = this.transfers.get(id);
    if (!transfer) return undefined;
    
    const updatedTransfer: Transfer = { ...transfer, status };
    this.transfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
  
  async listTransfers(fromStoreId?: number, toStoreId?: number): Promise<Transfer[]> {
    let transfersList = Array.from(this.transfers.values());
    
    if (fromStoreId) {
      transfersList = transfersList.filter(transfer => transfer.fromStoreId === fromStoreId);
    }
    
    if (toStoreId) {
      transfersList = transfersList.filter(transfer => transfer.toStoreId === toStoreId);
    }
    
    return transfersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getTransferItems(transferId: number): Promise<TransferItem[]> {
    return Array.from(this.transferItems.values()).filter(item => item.transferId === transferId);
  }
}

export const storage = new MemStorage();
