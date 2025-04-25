import { 
  Bell, 
  HelpCircle, 
  Settings,
  ChevronDown,
  Store as StoreIcon
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Store } from "@shared/schema";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { currentStore, stores, setCurrentStore } = useStoreSelector();

  // Handle store change
  const handleStoreChange = (store: Store) => {
    setCurrentStore(store);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-medium">{title}</h2>
          
          {stores.length > 0 && (
            <div className="ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-primary rounded-md bg-primary/10 hover:bg-primary/20 border-0">
                    <StoreIcon className="h-4 w-4 mr-1.5" />
                    {currentStore?.name || "Select Store"}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Store</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {stores.map((store) => (
                    <DropdownMenuItem 
                      key={store.id}
                      onClick={() => handleStoreChange(store)}
                      className="cursor-pointer"
                    >
                      {store.name}
                      {store.isDefault && " (Default)"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 rounded-full"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-white text-xs">3</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="h-8 border-l border-gray-300"></div>
          
          <div className="flex items-center">
            <div className="mr-2 text-right">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
