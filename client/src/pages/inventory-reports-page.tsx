import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { StoreProvider } from "@/hooks/use-store-selector";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  LineChart,
  Package, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  FileText,
  ChevronDown
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function InventoryReportsContent() {
  const { currentStore } = useStoreSelector();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Query inventory data for current store
  const { data: inventory = [], isLoading: isInventoryLoading } = useQuery({
    queryKey: ["/api/inventory", currentStore?.id],
    enabled: !!currentStore,
  });
  
  // Calculate low stock counts
  const lowStockCount = inventory.filter((item: any) => 
    item.quantity <= (item.product?.minStock || 0)).length;
  
  const outOfStockCount = inventory.filter((item: any) => 
    item.quantity <= 0).length;
  
  // Sample chart data (would be from API in real implementation)
  const stockLevelsByCategory = [
    { name: "Groceries", value: 65 },
    { name: "Electronics", value: 15 },
    { name: "Clothing", value: 10 },
    { name: "Home", value: 10 },
  ];
  
  const stockMovementData = [
    { date: "Jan", inflow: 120, outflow: 80 },
    { date: "Feb", inflow: 150, outflow: 100 },
    { date: "Mar", inflow: 180, outflow: 160 },
    { date: "Apr", inflow: 170, outflow: 145 },
    { date: "May", inflow: 200, outflow: 175 },
    { date: "Jun", inflow: 220, outflow: 190 },
  ];
  
  const topMovingItems = [
    { id: 1, name: "Organic Bananas", sku: "PRD-001", sold: 245, restocked: 300 },
    { id: 2, name: "Whole Wheat Bread", sku: "PRD-002", sold: 180, restocked: 200 },
    { id: 3, name: "Fresh Milk 1L", sku: "PRD-003", sold: 150, restocked: 175 },
    { id: 4, name: "Wireless Earbuds", sku: "PRD-004", sold: 85, restocked: 100 },
    { id: 5, name: "Paper Towels", sku: "PRD-005", sold: 75, restocked: 100 },
  ];
  
  const COLORS = ['#3f51b5', '#2196f3', '#ff9800', '#f44336'];
  
  const getStockStatusBadge = (quantity: number, minStock: number) => {
    if (quantity <= 0) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> Out of Stock
      </Badge>;
    } else if (quantity <= minStock) {
      return <Badge variant="warning" className="flex items-center gap-1 bg-warning/10 text-warning border-warning/20">
        <AlertTriangle className="h-3 w-3" /> Low Stock
      </Badge>;
    } else {
      return <Badge variant="outline" className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle className="h-3 w-3" /> In Stock
      </Badge>;
    }
  };
  
  const getStockLevel = (quantity: number, minStock: number) => {
    const safeStock = minStock * 2; // Target "full stock" level
    const percentage = Math.min(100, Math.round((quantity / safeStock) * 100));
    return percentage;
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Inventory Reports" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Reports</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Reports <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Stock Level Report</DropdownMenuItem>
                <DropdownMenuItem>Low Stock Report</DropdownMenuItem>
                <DropdownMenuItem>Stock Movement Report</DropdownMenuItem>
                <DropdownMenuItem>Inventory Valuation</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
            <TabsTrigger value="movement">Stock Movement</TabsTrigger>
            <TabsTrigger value="valuation">Inventory Valuation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isInventoryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{inventory.length}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  {isInventoryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  {isInventoryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isInventoryLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <div className="text-2xl font-bold">$24,586.00</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Levels by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockLevelsByCategory}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stockLevelsByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement</CardTitle>
                  <CardDescription>Inflow vs Outflow over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={stockMovementData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="inflow" 
                          name="Stock In" 
                          stroke="#3f51b5" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="outflow" 
                          name="Stock Out" 
                          stroke="#f44336" 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Moving Items</CardTitle>
                <CardDescription>Products with highest sales and restocking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                        <TableHead className="text-right">Units Restocked</TableHead>
                        <TableHead className="text-right">Net Movement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topMovingItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell className="text-right">{item.sold}</TableCell>
                          <TableCell className="text-right">{item.restocked}</TableCell>
                          <TableCell className="text-right">
                            {item.restocked - item.sold > 0 ? (
                              <span className="text-emerald-500">+{item.restocked - item.sold}</span>
                            ) : (
                              <span className="text-destructive">{item.restocked - item.sold}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stock-levels">
            <Card>
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>
                  Inventory levels across all products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="text-right">Min. Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stock Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isInventoryLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          </TableRow>
                        ))
                      ) : !inventory || inventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No inventory items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        inventory.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product?.name}</TableCell>
                            <TableCell>{item.product?.sku}</TableCell>
                            <TableCell>{item.product?.categoryName || "-"}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.product?.minStock || 0}</TableCell>
                            <TableCell>
                              {getStockStatusBadge(item.quantity, item.product?.minStock || 0)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={getStockLevel(item.quantity, item.product?.minStock || 10)} 
                                  className="h-2"
                                />
                                <span className="text-xs text-muted-foreground w-8">
                                  {getStockLevel(item.quantity, item.product?.minStock || 10)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="movement">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement Analysis</CardTitle>
                <CardDescription>
                  Track inventory inflows and outflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={stockMovementData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inflow" name="Stock In" fill="#3f51b5" />
                      <Bar dataKey="outflow" name="Stock Out" fill="#f44336" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Stock In</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,040 units</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Stock Out</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">850 units</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Net Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">+190 units</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Jun 15, 2023</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Stock In</Badge>
                        </TableCell>
                        <TableCell>PO-0012</TableCell>
                        <TableCell>Organic Bananas</TableCell>
                        <TableCell className="text-right">+50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jun 14, 2023</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700">Stock Out</Badge>
                        </TableCell>
                        <TableCell>INV-0024</TableCell>
                        <TableCell>Whole Wheat Bread</TableCell>
                        <TableCell className="text-right">-25</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jun 14, 2023</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Stock In</Badge>
                        </TableCell>
                        <TableCell>TRF-0008</TableCell>
                        <TableCell>Fresh Milk 1L</TableCell>
                        <TableCell className="text-right">+30</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jun 13, 2023</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-red-50 text-red-700">Stock Out</Badge>
                        </TableCell>
                        <TableCell>INV-0023</TableCell>
                        <TableCell>Wireless Earbuds</TableCell>
                        <TableCell className="text-right">-5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Jun 12, 2023</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Stock In</Badge>
                        </TableCell>
                        <TableCell>PO-0011</TableCell>
                        <TableCell>Paper Towels</TableCell>
                        <TableCell className="text-right">+40</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="valuation">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Valuation</CardTitle>
                <CardDescription>
                  Current value of inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$24,586.00</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Average Item Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$32.78</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Highest Value Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Electronics</div>
                      <div className="text-sm text-muted-foreground">$8,450.00</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Cost Per Unit</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isInventoryLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : !inventory || inventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No inventory items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        inventory.map((item: any) => {
                          const totalValue = (item.quantity || 0) * (item.product?.cost || 0);
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product?.name}</TableCell>
                              <TableCell>{item.product?.sku}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.product?.cost?.toFixed(2) || '0.00'}</TableCell>
                              <TableCell className="text-right">${totalValue.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function InventoryReportsPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <InventoryReportsContent />
      </div>
    </StoreProvider>
  );
}
