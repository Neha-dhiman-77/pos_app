import { useState } from "react";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { StoreProvider } from "@/hooks/use-store-selector";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProductList } from "@/components/inventory/product-list";
import { AddProductForm } from "@/components/inventory/add-product-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ProductsContent() {
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Products" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <Button onClick={() => setIsAddProductDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
        
        <ProductList />
        
        <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <AddProductForm onSuccess={() => setIsAddProductDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <ProductsContent />
      </div>
    </StoreProvider>
  );
}
