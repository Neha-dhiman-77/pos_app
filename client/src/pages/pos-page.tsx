import { useEffect } from "react";
import { useStoreSelector } from "@/hooks/use-store-selector";
import { StoreProvider } from "@/hooks/use-store-selector";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { POSTerminal } from "@/components/pos/pos-terminal";

function POSContent() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="POS Terminal" />
      
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <POSTerminal />
      </main>
    </div>
  );
}

export default function POSPage() {
  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <POSContent />
      </div>
    </StoreProvider>
  );
}
