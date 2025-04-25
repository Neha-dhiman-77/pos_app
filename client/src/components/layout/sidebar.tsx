import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  Repeat, 
  BarChart, 
  LineChart, 
  Store, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isSidebarCollapsed: boolean;
  onClick?: () => void;
};

const NavItem = ({ to, icon, label, isActive, isSidebarCollapsed, onClick }: NavItemProps) => (
  <Link href={to}>
    <a
      className={cn(
        "flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-200",
        isActive
          ? "bg-primary-dark text-white"
          : "hover:bg-primary-light/30 text-white"
      )}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {!isSidebarCollapsed && <span>{label}</span>}
    </a>
  </Link>
);

type NavGroupProps = {
  label: string;
  isSidebarCollapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const NavGroup = ({ label, isSidebarCollapsed, children, defaultOpen = false }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // When sidebar collapses, close all groups
  useEffect(() => {
    if (isSidebarCollapsed) {
      setIsOpen(false);
    }
  }, [isSidebarCollapsed]);

  if (isSidebarCollapsed) {
    return (
      <div className="mb-2">
        <div className="px-4 py-2 text-xs font-medium text-white/60 uppercase text-center">
          {label.charAt(0)}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full px-4 py-2 text-xs font-medium text-white/60 uppercase flex items-center justify-between">
          {label}
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Check if current route matches
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div
      className={cn(
        "bg-primary text-white h-screen flex flex-col shadow-elevated transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-primary-light">
        <div className="flex items-center space-x-3">
          {!isSidebarCollapsed && (
            <>
              <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-primary font-bold">
                P
              </div>
              <h1 className="text-xl font-medium tracking-wider">ProPOS</h1>
            </>
          )}
          {isSidebarCollapsed && (
            <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-primary font-bold mx-auto">
              P
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-white hover:bg-primary-dark rounded-full p-1"
        >
          <Menu size={20} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-grow">
        <div className="p-2">
          <NavGroup label="Main" isSidebarCollapsed={isSidebarCollapsed} defaultOpen={true}>
            <NavItem
              to="/"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isActive={isActive("/")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/pos"
              icon={<ShoppingBag size={20} />}
              label="POS Terminal"
              isActive={isActive("/pos")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/products"
              icon={<Package size={20} />}
              label="Products"
              isActive={isActive("/products")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/inventory"
              icon={<Package size={20} />}
              label="Inventory"
              isActive={isActive("/inventory")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </NavGroup>

          <NavGroup label="Management" isSidebarCollapsed={isSidebarCollapsed}>
            <NavItem
              to="/customers"
              icon={<Users size={20} />}
              label="Customers"
              isActive={isActive("/customers")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/suppliers"
              icon={<Truck size={20} />}
              label="Suppliers"
              isActive={isActive("/suppliers")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/purchases"
              icon={<ShoppingCart size={20} />}
              label="Purchases"
              isActive={isActive("/purchases")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/transfers"
              icon={<Repeat size={20} />}
              label="Transfers"
              isActive={isActive("/transfers")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </NavGroup>

          <NavGroup label="Reports" isSidebarCollapsed={isSidebarCollapsed}>
            <NavItem
              to="/reports/sales"
              icon={<BarChart size={20} />}
              label="Sales Reports"
              isActive={isActive("/reports/sales")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/reports/inventory"
              icon={<LineChart size={20} />}
              label="Inventory Reports"
              isActive={isActive("/reports/inventory")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </NavGroup>

          <NavGroup label="System" isSidebarCollapsed={isSidebarCollapsed}>
            <NavItem
              to="/stores"
              icon={<Store size={20} />}
              label="Stores"
              isActive={isActive("/stores")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/users"
              icon={<User size={20} />}
              label="Users"
              isActive={isActive("/users")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <NavItem
              to="/settings"
              icon={<Settings size={20} />}
              label="Settings"
              isActive={isActive("/settings")}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </NavGroup>
        </div>
      </div>

      <div className="p-4 border-t border-primary-light">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary-light text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.fullName}</p>
              <p className="text-sm text-white/60 truncate">{user?.role}</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-primary-dark rounded-full ml-auto p-1"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
