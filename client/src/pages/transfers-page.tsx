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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Plus, Repeat, Check, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Product, Store } from "@shared/schema";

// Transfer item schema for form validation
const transferItemSchema = z.object({
  productId: z.number().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// New transfer schema for form validation
const newTransferSchema = z.object({
  fromStoreId: z.number().min(1, "Source store is required"),
  toStoreId: z.number().min(1, "Destination store is required"),
  items: z.array(transferItemSchema).min(1, "At least one item is required"),
});

type TransferFormValues = z.infer<typeof newTransferSchema>;

function TransfersContent() {
  const { currentStore } = useStoreSelector();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewTransferDialogOpen, setIsNewTransferDialogOpen] = useState(false);
  const [transferItems, setTransferItems] = useState<{ productId: number; quantity: number; productName?: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  
  // Query transfers
  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["/api/transfers", currentStore?.id, searchTerm],
    enabled: !!currentStore,
  });
  
  // Query stores for transfer form
  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });
  
  // Query products for transfer form
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // Query inventory for product quantities
  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory", currentStore?.id],
    enabled: !!currentStore,
  });
  
  // Update transfer status mutation
  const updateTransferStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/transfers/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The transfer status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create transfer mutation
  const createTransfer = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      const transferData = {
        ...data,
        reference: `TRF-${Date.now().toString().slice(-6)}`,
      };
      const response = await apiRequest("POST", "/api/transfers", transferData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer created",
        description: "The stock transfer has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsNewTransferDialogOpen(false);
      setTransferItems([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to create transfer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(newTransferSchema),
    defaultValues: {
      fromStoreId: currentStore?.id || 0,
      toStoreId: 0,
      items: [],
    },
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (id: number, status: string) => {
    updateTransferStatus.mutate({ id, status });
  };
  
  const handleNewTransfer = () => {
    form.reset({
      fromStoreId: currentStore?.id || 0,
      toStoreId: 0,
      items: [],
    });
    setTransferItems([]);
    setIsNewTransferDialogOpen(true);
  };
  
  const handleAddItem = () => {
    if (!selectedProductId || productQuantity <= 0) return;
    
    const product = products.find((p: Product) => p.id === selectedProductId);
    if (!product) return;
    
    const newItem = {
      productId: selectedProductId,
      quantity: productQuantity,
      productName: product.name,
    };
    
    setTransferItems([...transferItems, newItem]);
    setSelectedProductId(null);
    setProductQuantity(1);
  };
  
  const handleRemoveItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };
  
  const onSubmitTransfer = (data: TransferFormValues) => {
    if (data.fromStoreId === data.toStoreId) {
      form.setError("toStoreId", {
        type: "manual",
        message: "Source and destination stores must be different",
      });
      return;
    }
    
    if (transferItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the transfer.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      ...data,
      items: transferItems,
    };
    
    createTransfer.mutate(formData);
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
      <Header title="Stock Transfers" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <Button onClick={handleNewTransfer}>
            <Plus className="mr-2 h-4 w-4" /> New Transfer
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>All Transfers</CardTitle>
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
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Date</TableHead>
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
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No transfers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transfers.map((transfer: any) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.reference}</TableCell>
                        <TableCell>{transfer.fromStore?.name || `Store #${transfer.fromStoreId}`}</TableCell>
                        <TableCell>{transfer.toStore?.name || `Store #${transfer.toStoreId}`}</TableCell>
                        <TableCell>{formatDate(transfer.date)}</TableCell>
                        <TableCell>{getBadgeVariant(transfer.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {transfer.status === "pending" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(transfer.id, "completed")}
                                >
                                  Complete
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(transfer.id, "canceled")}
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
        
        {/* New Transfer Dialog */}
        <Dialog open={isNewTransferDialogOpen} onOpenChange={setIsNewTransferDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Stock Transfer</DialogTitle>
              <DialogDescription>
                Transfer stock from one store to another.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitTransfer)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromStoreId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Store</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store: Store) => (
                              <SelectItem key={store.id} value={store.id.toString()}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="toStoreId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Store</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store: Store) => (
                              <SelectItem 
                                key={store.id} 
                                value={store.id.toString()}
                                disabled={store.id === form.getValues().fromStoreId}
                              >
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => setSelectedProductId(Number(value))}
                        value={selectedProductId?.toString() || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product: Product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-28">
                      <FormLabel>Quantity</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Number(e.target.value))}
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={handleAddItem}
                      disabled={!selectedProductId || productQuantity <= 0}
                    >
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transferItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                              No items added to transfer. Add some items above.
                            </TableCell>
                          </TableRow>
                        ) : (
                          transferItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewTransferDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={transferItems.length === 0 || createTransfer.isPending}
                  >
                    {createTransfer.isPending ? "Creating Transfer..." : "Create Transfer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function TransfersPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <TransfersContent />
      </div>
    </StoreProvider>
  );
}
