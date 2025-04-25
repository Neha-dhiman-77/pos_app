import { useQuery } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export function LowStockAlert() {
  const { currentStore } = useStoreSelector();
  const [_, setLocation] = useLocation();

  interface LowStockItem {
    id: number;
    productId: number;
    storeId: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      sku: string;
      minStock: number;
    };
  }

  const { data: lowStockItems = [], isLoading } = useQuery<LowStockItem[]>({
    queryKey: ["/api/inventory/low-stock", currentStore?.id],
    enabled: !!currentStore,
  });

  // Navigate to purchases page to create a new purchase order
  const handleCreatePurchaseOrder = () => {
    setLocation("/purchases");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Low Stock Alert</CardTitle>
        <Button variant="secondary" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex items-center p-2 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : (
            lowStockItems.map((item) => {
              const severity = item.quantity === 0 ? "critical" : 
                              item.quantity <= item.product.minStock / 2 ? "high" : "medium";
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center p-2 border rounded-lg", 
                    severity === "critical" ? "border-destructive/40 bg-destructive/5" :
                    severity === "high" ? "border-destructive/20 bg-destructive/5" :
                    "border-warning/20 bg-warning/5"
                  )}
                >
                  <div className="h-10 w-10 rounded bg-white border border-gray-200 flex items-center justify-center mr-3">
                    <AlertTriangle className={cn(
                      "h-5 w-5",
                      severity === "critical" || severity === "high" ? "text-destructive" : "text-warning"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className={cn(
                        "text-sm font-medium",
                        severity === "critical" || severity === "high" ? "text-destructive" : "text-warning"
                      )}>
                        {item.quantity} left
                      </p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-muted-foreground text-xs">SKU: {item.product.sku}</p>
                      <p className="text-xs">Min. Stock: {item.product.minStock}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!isLoading && lowStockItems.length === 0 && (
            <div className="py-4 text-center text-muted-foreground">
              No low stock items found
            </div>
          )}
        </div>
        
        {!isLoading && lowStockItems.length > 0 && (
          <div className="mt-4">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleCreatePurchaseOrder}
            >
              Create Purchase Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
