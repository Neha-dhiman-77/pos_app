import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, Product } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Extended product schema with validation
const productSchema = insertProductSchema.extend({
  price: z.coerce.number().min(0, "Price must be a positive number"),
  cost: z.coerce.number().min(0, "Cost must be a positive number").optional(),
  minStock: z.coerce.number().min(0, "Min stock must be a positive number"),
  categoryId: z.coerce.number().optional(),
  unitId: z.coerce.number().optional(),
  active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export function AddProductForm({ product, onSuccess }: AddProductFormProps) {
  const { toast } = useToast();
  const isEditing = !!product;
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch units
  const { data: units = [] } = useQuery({
    queryKey: ["/api/units"],
  });
  
  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      description: product?.description || "",
      price: product?.price || 0,
      cost: product?.cost || 0,
      categoryId: product?.categoryId || undefined,
      unitId: product?.unitId || undefined,
      minStock: product?.minStock || 10,
      active: product?.active ?? true,
    },
  });
  
  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        description: product.description || "",
        price: product.price,
        cost: product.cost || 0,
        categoryId: product.categoryId,
        unitId: product.unitId,
        minStock: product.minStock || 10,
        active: product.active,
      });
    }
  }, [product, form]);
  
  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("PUT", `/api/products/${product!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ProductFormValues) => {
    if (isEditing) {
      updateProduct.mutate(data);
    } else {
      createProduct.mutate(data);
    }
  };
  
  const isPending = createProduct.isPending || updateProduct.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter product name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU*</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter product SKU" 
                    disabled={isEditing}
                  />
                </FormControl>
                {isEditing && (
                  <FormDescription>
                    SKU cannot be changed after creation
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter product barcode (optional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price*</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-3">$</span>
                    <Input 
                      {...field} 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className="pl-8"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-3">$</span>
                    <Input 
                      {...field} 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className="pl-8"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Purchase cost of the product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="10" 
                    type="number" 
                    min="0"
                  />
                </FormControl>
                <FormDescription>
                  Low stock alerts will be triggered below this level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
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
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {units.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name} ({unit.shortName})
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
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Enter product description" 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Inactive products won't appear in the POS terminal
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
        </div>
        
        <div className={cn("flex justify-end", isEditing ? "gap-2" : "")}>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
