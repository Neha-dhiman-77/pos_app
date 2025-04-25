import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  Repeat,
  BarChart2,
  FileText,
  Settings
} from "lucide-react";

export function QuickActions() {
  const [_, setLocation] = useLocation();

  const actions = [
    {
      title: "New Sale",
      icon: ShoppingBag,
      path: "/pos",
      color: "text-primary hover:border-primary"
    },
    {
      title: "Add Product",
      icon: Package,
      path: "/products",
      color: "text-primary hover:border-primary"
    },
    {
      title: "Add Customer",
      icon: Users,
      path: "/customers",
      color: "text-primary hover:border-primary"
    },
    {
      title: "New Purchase",
      icon: ShoppingCart,
      path: "/purchases",
      color: "text-primary hover:border-primary"
    },
    {
      title: "Stock Transfer",
      icon: Repeat,
      path: "/transfers",
      color: "text-primary hover:border-primary"
    },
    {
      title: "View Reports",
      icon: BarChart2,
      path: "/reports/sales",
      color: "text-primary hover:border-primary"
    },
    {
      title: "Invoices",
      icon: FileText,
      path: "/reports/sales",
      color: "text-primary hover:border-primary"
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      color: "text-primary hover:border-primary"
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                className={`flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${action.color}`}
                onClick={() => setLocation(action.path)}
              >
                <Icon className="mb-2 h-5 w-5" />
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
