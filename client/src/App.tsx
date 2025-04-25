import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import PosPage from "@/pages/pos-page";
import ProductsPage from "@/pages/products-page";
import InventoryPage from "@/pages/inventory-page";
import CustomersPage from "@/pages/customers-page";
import SuppliersPage from "@/pages/suppliers-page";
import PurchasesPage from "@/pages/purchases-page";
import TransfersPage from "@/pages/transfers-page";
import SalesReportsPage from "@/pages/sales-reports-page";
import InventoryReportsPage from "@/pages/inventory-reports-page";
import StoresPage from "@/pages/stores-page";
import UsersPage from "@/pages/users-page";


function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/pos" component={PosPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/customers" component={CustomersPage} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/purchases" component={PurchasesPage} />
      <ProtectedRoute path="/transfers" component={TransfersPage} />
      <ProtectedRoute path="/reports/sales" component={SalesReportsPage} />
      <ProtectedRoute path="/reports/inventory" component={InventoryReportsPage} />
      <ProtectedRoute path="/stores" component={StoresPage} />
      <ProtectedRoute path="/users" component={UsersPage} />

      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <Router />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
