import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Input
} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Printer,
  DollarSign,
  FileScan,
  Save
} from "lucide-react";

// Type for cart item
interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Form schema for payment
const paymentSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  customerId: z.number().optional(),
});

export function POSTerminal() {
  const { currentStore } = useStoreSelector();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State for cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Total amount in cart
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Payment form
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "cash",
      customerId: undefined,
    },
  });
  
  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Query products when search term changes
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/products", searchTerm],
    enabled: searchTerm.length > 1,
  });
  
  // Query customers for associating with sale
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });
  
  // Create sale mutation
  const createSale = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      // Clear cart after successful sale
      setCart([]);
      setIsPaymentDialogOpen(false);
      
      toast({
        title: "Sale completed",
        description: "The sale has been processed successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/sales/recent"] });
    },
    onError: (error) => {
      toast({
        title: "Sale failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle product search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Add product to cart
  const addToCart = (product: any) => {
    setCart(currentCart => {
      // Check if product is already in cart
      const existingItemIndex = currentCart.findIndex(
        item => item.productId === product.id
      );
      
      if (existingItemIndex >= 0) {
        // Increment quantity if already in cart
        const updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += 1;
        updatedCart[existingItemIndex].subtotal = 
          updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price;
        return updatedCart;
      } else {
        // Add new item to cart
        return [
          ...currentCart,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            subtotal: product.price,
          },
        ];
      }
    });
    
    // Clear search after adding
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Update item quantity in cart
  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setCart(currentCart => {
      const updatedCart = [...currentCart];
      updatedCart[index].quantity = newQuantity;
      updatedCart[index].subtotal = updatedCart[index].price * newQuantity;
      return updatedCart;
    });
  };
  
  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(currentCart => currentCart.filter((_, i) => i !== index));
  };
  
  // Handle payment
  const handlePayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to the cart before proceeding to payment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPaymentDialogOpen(true);
  };
  
  // Process sale
  const processSale = (data: z.infer<typeof paymentSchema>) => {
    if (!currentStore) {
      toast({
        title: "Store not selected",
        description: "Please select a store before processing the sale.",
        variant: "destructive",
      });
      return;
    }
    
    const saleData = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: data.customerId,
      storeId: currentStore.id,
      totalAmount: cartTotal,
      paymentMethod: data.paymentMethod,
      paymentStatus: "paid",
      status: "completed",
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.subtotal,
      })),
    };
    
    createSale.mutate(saleData);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Left Side - Product Search and Results */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="mb-4 relative">
              <Input
                ref={searchInputRef}
                placeholder="Search products by name, SKU or barcode..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Products</h3>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <FileScan className="h-4 w-4" />
                Scan
              </Button>
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              {searchTerm && searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {searchResults.map((product: any) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-start text-left"
                      onClick={() => addToCart(product)}
                    >
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="text-primary text-sm">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        SKU: {product.sku}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right Side - Cart and Payment */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Current Sale</h3>
              <Button variant="outline" className="gap-1" onClick={() => setCart([])}>
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No items in cart
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="h-8 px-3 flex items-center justify-center border-y">
                              {item.quantity}
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-lg font-medium mb-4">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button className="gap-2" onClick={handlePayment}>
                  <DollarSign className="h-4 w-4" />
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(processSale)} className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={paymentForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer (Optional)</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value) || undefined)}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Walk-in Customer</SelectItem>
                              {customers.map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={paymentForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Total Amount</FormLabel>
                    <div className="h-10 px-3 rounded-md border border-input bg-background flex items-center text-lg font-medium">
                      ${cartTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSale.isPending}>
                  {createSale.isPending ? "Processing..." : "Complete Sale"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
