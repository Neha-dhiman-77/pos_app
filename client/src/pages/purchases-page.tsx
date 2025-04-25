import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { StoreProvider } from "@/hooks/use-store-selector";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Eye, Plus, Check, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

function PurchasesContent() {
  const { currentStore } = useStoreSelector();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Query purchases
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["/api/purchases", currentStore?.id, searchTerm],
    enabled: !!currentStore,
  });
  
  // Update purchase status mutation
  const updatePurchaseStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/purchases/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The purchase status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (id: number, status: string) => {
    updatePurchaseStatus.mutate({ id, status });
  };
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"><Check className="h-3 w-3" /> Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"><XCircle className="h-3 w-3" /> Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Purchases" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Purchase Order
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>All Purchases</CardTitle>
              <div className="relative max-w-sm">
                <Input
                  placeholder="Search by reference..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No purchase orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.map((purchase: any) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.reference}</TableCell>
                        <TableCell>{purchase.supplier?.name || "N/A"}</TableCell>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell className="text-right">${purchase.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{getBadgeVariant(purchase.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {purchase.status === "pending" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(purchase.id, "completed")}
                                >
                                  Complete
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(purchase.id, "canceled")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
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
      </main>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <PurchasesContent />
      </div>
    </StoreProvider>
  );
}
