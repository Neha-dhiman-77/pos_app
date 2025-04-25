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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, Plus, Minus } from "lucide-react";

function InventoryContent() {
  const { currentStore } = useStoreSelector();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory", currentStore?.id, searchTerm],
    enabled: !!currentStore,
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Inventory" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <h2 className="text-lg text-muted-foreground">
            {currentStore?.name || "All Stores"}
          </h2>
        </div>
        
        <div className="grid gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Stock Levels</CardTitle>
                <div className="relative max-w-sm">
                  <Input
                    placeholder="Search by product name or SKU..."
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
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No inventory items found for this store.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory.map((item: any) => {
                        const stockStatus = item.quantity <= 0 ? "out-of-stock" :
                                          item.quantity <= item.product?.minStock ? "low" : "normal";
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product?.sku}</TableCell>
                            <TableCell>{item.product?.name}</TableCell>
                            <TableCell>${item.product?.price?.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-24 flex justify-between items-center">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-full"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-medium">{item.quantity}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-full"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {stockStatus === "out-of-stock" && (
                                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                  <AlertTriangle className="h-3 w-3" />
                                  Out of Stock
                                </Badge>
                              )}
                              {stockStatus === "low" && (
                                <Badge variant="warning" className="flex items-center gap-1 w-fit bg-warning/10 text-warning border-warning/20">
                                  <AlertTriangle className="h-3 w-3" />
                                  Low Stock
                                </Badge>
                              )}
                              {stockStatus === "normal" && (
                                <Badge variant="outline" className="flex items-center gap-1 w-fit bg-emerald-50 text-emerald-700 border-emerald-200">
                                  In Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">Adjust</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <InventoryContent />
      </div>
    </StoreProvider>
  );
}
