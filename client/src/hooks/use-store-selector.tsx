import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store } from "@shared/schema";

type StoreContextType = {
  currentStore: Store | null;
  stores: Store[];
  isLoading: boolean;
  error: Error | null;
  setCurrentStore: (store: Store) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  const {
    data: stores = [],
    isLoading,
    error,
  } = useQuery<Store[], Error>({
    queryKey: ["/api/stores"],
  });

  // Get default store
  const { data: defaultStore } = useQuery<Store, Error>({
    queryKey: ["/api/stores/default"],
    enabled: stores.length > 0 && !currentStore,
  });

  // Set the default store when it's loaded and no current store is selected
  useEffect(() => {
    if (!currentStore && defaultStore) {
      setCurrentStore(defaultStore);
    }
  }, [defaultStore, currentStore]);

  // If we have stores but no default, use the first one
  useEffect(() => {
    if (!currentStore && stores.length > 0) {
      setCurrentStore(stores[0]);
    }
  }, [stores, currentStore]);

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        stores,
        isLoading,
        error,
        setCurrentStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreSelector() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreSelector must be used within a StoreProvider");
  }
  return context;
}
