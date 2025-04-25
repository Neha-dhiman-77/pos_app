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
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Store as StoreIcon, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Home
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Store, insertStoreSchema } from "@shared/schema";

// Form schema for store
const storeSchema = insertStoreSchema.extend({
  isDefault: z.boolean().default(false),
});

type StoreFormValues = z.infer<typeof storeSchema>;

function StoresContent() {
  const { currentStore, setCurrentStore } = useStoreSelector();
  const { toast } = useToast();
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
  const [isDeleteStoreDialogOpen, setIsDeleteStoreDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  // Query stores
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["/api/stores"],
  });
  
  // Form setup
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      isDefault: false,
    },
  });
  
  // Create store mutation
  const createStore = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      const response = await apiRequest("POST", "/api/stores", data);
      return response.json();
    },
    onSuccess: (newStore) => {
      toast({
        title: "Store created",
        description: "The store has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsAddStoreDialogOpen(false);
      form.reset();
      
      // If this is the first store, set it as current
      if (stores.length === 0) {
        setCurrentStore(newStore);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create store",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update store mutation
  const updateStore = useMutation({
    mutationFn: async (data: StoreFormValues & { id: number }) => {
      const { id, ...storeData } = data;
      const response = await apiRequest("PUT", `/api/stores/${id}`, storeData);
      return response.json();
    },
    onSuccess: (updatedStore) => {
      toast({
        title: "Store updated",
        description: "The store has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsEditStoreDialogOpen(false);
      
      // If current store was updated, update the current store
      if (currentStore && currentStore.id === updatedStore.id) {
        setCurrentStore(updatedStore);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update store",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete store mutation
  const deleteStore = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsDeleteStoreDialogOpen(false);
      
      // If current store was deleted, set a different store as current
      if (currentStore && selectedStore && currentStore.id === selectedStore.id) {
        const remainingStores = stores.filter(s => s.id !== selectedStore.id);
        if (remainingStores.length > 0) {
          setCurrentStore(remainingStores[0]);
        } else {
          setCurrentStore(null);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to delete store",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddStore = () => {
    form.reset({
      name: "",
      address: "",
      phone: "",
      email: "",
      isDefault: false,
    });
    setIsAddStoreDialogOpen(true);
  };
  
  const handleEditStore = (store: Store) => {
    setSelectedStore(store);
    form.reset({
      name: store.name,
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      isDefault: store.isDefault || false,
    });
    setIsEditStoreDialogOpen(true);
  };
  
  const handleDeleteStore = (store: Store) => {
    setSelectedStore(store);
    setIsDeleteStoreDialogOpen(true);
  };
  
  const onSubmitAdd = (data: StoreFormValues) => {
    createStore.mutate(data);
  };
  
  const onSubmitEdit = (data: StoreFormValues) => {
    if (selectedStore) {
      updateStore.mutate({ ...data, id: selectedStore.id });
    }
  };
  
  const confirmDelete = () => {
    if (selectedStore) {
      deleteStore.mutate(selectedStore.id);
    }
  };
  
  const handleSelectStore = (store: Store) => {
    setCurrentStore(store);
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Stores" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Store Management</h1>
          <Button onClick={handleAddStore}>
            <Plus className="mr-2 h-4 w-4" /> Add Store
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : stores.length === 0 ? (
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>No Stores Found</CardTitle>
                <CardDescription>
                  You haven't added any stores yet. Click the "Add Store" button to create your first store.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={handleAddStore}>
                  <Plus className="mr-2 h-4 w-4" /> Add Store
                </Button>
              </CardFooter>
            </Card>
          ) : (
            stores.map((store: Store) => (
              <Card 
                key={store.id} 
                className={`overflow-hidden ${currentStore?.id === store.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {store.name}
                        {store.isDefault && (
                          <Badge className="ml-2 bg-primary/20 text-primary border-0">
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {store.address ? (
                          <span className="flex items-center mt-1">
                            <Home className="h-3 w-3 mr-1" /> {store.address}
                          </span>
                        ) : null}
                      </CardDescription>
                    </div>
                    <StoreIcon className={`h-6 w-6 ${currentStore?.id === store.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-1 text-sm">
                    {store.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{store.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  {currentStore?.id === store.id ? (
                    <span className="text-sm text-primary font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> Current Store
                    </span>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectStore(store)}
                    >
                      Switch to Store
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditStore(store)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!store.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteStore(store)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {/* Add Store Dialog */}
        <Dialog open={isAddStoreDialogOpen} onOpenChange={setIsAddStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>
                Add a new store to your system. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter email address" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Default Store</FormLabel>
                        <FormDescription>
                          Set as the default store for all operations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createStore.isPending}>
                    {createStore.isPending ? "Creating..." : "Create Store"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Store Dialog */}
        <Dialog open={isEditStoreDialogOpen} onOpenChange={setIsEditStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Store</DialogTitle>
              <DialogDescription>
                Update store information.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter store address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter email address" type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Default Store</FormLabel>
                        <FormDescription>
                          Set as the default store for all operations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={selectedStore?.isDefault}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateStore.isPending}>
                    {updateStore.isPending ? "Updating..." : "Update Store"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Store Dialog */}
        <Dialog open={isDeleteStoreDialogOpen} onOpenChange={setIsDeleteStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the store "{selectedStore?.name}"? 
                This action cannot be undone and may affect inventory, sales, and other data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteStoreDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteStore.isPending || selectedStore?.isDefault}
              >
                {selectedStore?.isDefault ? "Cannot delete default store" : 
                  deleteStore.isPending ? "Deleting..." : "Delete Store"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function StoresPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <StoresContent />
      </div>
    </StoreProvider>
  );
}
