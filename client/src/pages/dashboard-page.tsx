import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { StoreProvider } from "@/hooks/use-store-selector";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StorePerformance } from "@/components/dashboard/store-performance";
import { 
  ShoppingBag, 
  ShoppingBasket, 
  PackageOpen, 
  TrendingUp 
} from "lucide-react";

function DashboardContent() {
  const { currentStore } = useStoreSelector();

  // Sales statistics
  const { data: recentSales = [] } = useQuery({
    queryKey: ["/api/sales/recent", currentStore?.id],
    enabled: !!currentStore,
  });

  // Low stock items
  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["/api/inventory/low-stock", currentStore?.id],
    enabled: !!currentStore,
  });

  // Calculate today's sales
  const todaySales = recentSales.reduce((sum, sale) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    if (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear() &&
      sale.status !== "refunded"
    ) {
      return sum + sale.totalAmount;
    }
    return sum;
  }, 0);

  // Count items sold today
  const itemsSold = recentSales.reduce((count, sale) => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    if (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear() &&
      sale.status !== "refunded"
    ) {
      // This is an approximation since we don't have the actual items count
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Today's Sales"
            value={`$${todaySales.toFixed(2)}`}
            change={{
              value: "12.5%",
              type: "increase",
              label: "vs yesterday"
            }}
            icon={ShoppingBag}
            iconColor="primary"
          />
          
          <StatCard
            title="Items Sold"
            value={itemsSold}
            change={{
              value: "8.2%",
              type: "increase",
              label: "vs yesterday"
            }}
            icon={ShoppingBasket}
            iconColor="secondary"
          />
          
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length}
            change={{
              value: `${lowStockItems.length > 0 ? lowStockItems.length : 0} new`,
              type: "increase",
              label: "since yesterday"
            }}
            icon={PackageOpen}
            iconColor="warning"
          />
          
          <StatCard
            title="Profit Margin"
            value="32.8%"
            change={{
              value: "1.2%",
              type: "decrease",
              label: "vs last week"
            }}
            icon={TrendingUp}
            iconColor="success"
          />
        </div>
        
        {/* Recent Sales and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <RecentSales />
          </div>
          
          <div>
            <LowStockAlert />
          </div>
        </div>
        
        {/* Quick Actions and Store Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickActions />
          <StorePerformance />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <DashboardContent />
      </div>
    </StoreProvider>
  );
}
