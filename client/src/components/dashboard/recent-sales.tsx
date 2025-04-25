import { useQuery } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentSales() {
  const { currentStore } = useStoreSelector();

  const { data: recentSales = [], isLoading } = useQuery({
    queryKey: ["/api/sales/recent", currentStore?.id, 5],
    enabled: !!currentStore,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Recent Sales</CardTitle>
        <Button variant="secondary" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : (
                recentSales.map((sale: any) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm">{sale.customer?.name || "Walk-in Customer"}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(sale.date)}</td>
                    <td className="px-4 py-3 text-sm">-</td>
                    <td className="px-4 py-3 text-sm font-medium">${sale.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(sale.status)}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              
              {!isLoading && recentSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No recent sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
