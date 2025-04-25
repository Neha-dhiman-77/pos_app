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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  LineChart,
  Calendar, 
  Download, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  ShoppingCart,
  Users
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function SalesReportsContent() {
  const { currentStore } = useStoreSelector();
  const [timeRange, setTimeRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate date range based on selection
  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case "7days":
        return { from: subDays(today, 7), to: today };
      case "30days":
        return { from: subDays(today, 30), to: today };
      case "month":
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case "week":
        return { from: startOfWeek(today), to: endOfWeek(today) };
      default:
        return { from: subDays(today, 7), to: today };
    }
  };
  
  const dateRange = getDateRange();
  
  // Query sales data
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ["/api/sales", currentStore?.id, timeRange],
    enabled: !!currentStore,
  });
  
  // Assuming we would have dedicated endpoints for reporting data
  const { data: salesSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["/api/reports/sales/summary", currentStore?.id, timeRange],
    enabled: !!currentStore && activeTab === "overview",
    // For demo purposes, create mock data based on the actual sales
    select: (data) => {
      if (!salesData) return null;
      
      // Calculate summary stats from sales data
      const totalSales = salesData.reduce((sum: number, sale: any) => 
        sale.status !== "refunded" ? sum + sale.totalAmount : sum, 0);
      
      const totalTransactions = salesData.filter((sale: any) => 
        sale.status !== "refunded").length;
      
      const avgOrderValue = totalTransactions > 0 ? 
        totalSales / totalTransactions : 0;
      
      return {
        totalSales,
        totalTransactions,
        avgOrderValue,
        comparisonPercentage: {
          sales: 12.5,
          transactions: 8.2,
          avgOrder: 2.8
        }
      };
    }
  });
  
  // Sample chart data (would come from API in a real implementation)
  const dailySalesData = [
    { name: "Mon", sales: 3800 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 2780 },
    { name: "Thu", sales: 1890 },
    { name: "Fri", sales: 2390 },
    { name: "Sat", sales: 3490 },
    { name: "Sun", sales: 2490 },
  ];
  
  const paymentMethodData = [
    { name: "Cash", value: 65 },
    { name: "Card", value: 30 },
    { name: "Bank Transfer", value: 5 },
  ];
  
  const COLORS = ['#3f51b5', '#2196f3', '#ff9800', '#f44336'];
  
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Sales Reports" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <div className="flex items-center gap-2">
            <Select 
              defaultValue={timeRange} 
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="week">This week</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing data from {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSummaryLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(salesSummary?.totalSales || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {salesSummary?.comparisonPercentage.sales > 0 ? (
                          <>
                            <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">{salesSummary?.comparisonPercentage.sales}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                            <span className="text-red-500">{Math.abs(salesSummary?.comparisonPercentage.sales || 0)}%</span>
                          </>
                        )}
                        <span className="ml-1">vs. previous period</span>
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSummaryLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {salesSummary?.totalTransactions || 0}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {salesSummary?.comparisonPercentage.transactions > 0 ? (
                          <>
                            <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">{salesSummary?.comparisonPercentage.transactions}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                            <span className="text-red-500">{Math.abs(salesSummary?.comparisonPercentage.transactions || 0)}%</span>
                          </>
                        )}
                        <span className="ml-1">vs. previous period</span>
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isSummaryLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(salesSummary?.avgOrderValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {salesSummary?.comparisonPercentage.avgOrder > 0 ? (
                          <>
                            <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500">{salesSummary?.comparisonPercentage.avgOrder}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                            <span className="text-red-500">{Math.abs(salesSummary?.comparisonPercentage.avgOrder || 0)}%</span>
                          </>
                        )}
                        <span className="ml-1">vs. previous period</span>
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales for the period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailySalesData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="var(--primary)" 
                          fill="rgba(63, 81, 181, 0.1)" 
                          name="Sales"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Sales by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentMethodData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales Transactions</CardTitle>
                <CardDescription>
                  All sales during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isSalesLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          </TableRow>
                        ))
                      ) : !salesData || salesData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No sales transactions found in this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        salesData.map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                            <TableCell>{format(new Date(sale.date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>{sale.customer?.name || "Walk-in Customer"}</TableCell>
                            <TableCell>{sale.paymentMethod}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={sale.status === "completed" ? "outline" : 
                                        sale.status === "pending" ? "secondary" : "destructive"}
                              >
                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                              </Badge>
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
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Products with the highest sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: "Product A", units: 120, revenue: 2500 },
                        { name: "Product B", units: 98, revenue: 1800 },
                        { name: "Product C", units: 86, revenue: 1650 },
                        { name: "Product D", units: 72, revenue: 1450 },
                        { name: "Product E", units: 65, revenue: 1200 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3f51b5" />
                      <YAxis yAxisId="right" orientation="right" stroke="#2196f3" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") return formatCurrency(Number(value));
                          return value;
                        }} 
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="units" name="Units Sold" fill="#3f51b5" />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#2196f3" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>
                  Customers with the highest purchase amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Average Order</TableHead>
                        <TableHead>Loyalty Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Michael Johnson</TableCell>
                        <TableCell className="text-right">8</TableCell>
                        <TableCell className="text-right">$1,254.30</TableCell>
                        <TableCell className="text-right">$156.79</TableCell>
                        <TableCell>120</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sarah Williams</TableCell>
                        <TableCell className="text-right">6</TableCell>
                        <TableCell className="text-right">$985.50</TableCell>
                        <TableCell className="text-right">$164.25</TableCell>
                        <TableCell>85</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Jacob Martinez</TableCell>
                        <TableCell className="text-right">5</TableCell>
                        <TableCell className="text-right">$792.25</TableCell>
                        <TableCell className="text-right">$158.45</TableCell>
                        <TableCell>200</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Emma Thompson</TableCell>
                        <TableCell className="text-right">4</TableCell>
                        <TableCell className="text-right">$654.75</TableCell>
                        <TableCell className="text-right">$163.69</TableCell>
                        <TableCell>50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">David Clark</TableCell>
                        <TableCell className="text-right">3</TableCell>
                        <TableCell className="text-right">$523.80</TableCell>
                        <TableCell className="text-right">$174.60</TableCell>
                        <TableCell>150</TableCell>
                      </TableRow>
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

export default function SalesReportsPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <SalesReportsContent />
      </div>
    </StoreProvider>
  );
}
