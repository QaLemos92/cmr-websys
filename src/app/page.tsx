// app/page.tsx
"use client"; // necessário porque você usa hooks e componentes client-side

import DebtCalculator from "@/components/DebtCalculator";
import ClientHistory from "@/components/ClientHistory";
import CommissionPanel from "@/components/CommissionPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, History, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">Sistema de Cobrança Advocatícia</h1>
          <p className="text-muted-foreground">Gerencie cálculos, histórico e comissões</p>
        </div>
      </div>
      
      <Tabs defaultValue="calculator" className="w-full">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculadora
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="commission" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Comissões
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <div className="py-6">
          <TabsContent value="calculator" className="mt-0">
            <DebtCalculator />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <ClientHistory />
          </TabsContent>
          
          <TabsContent value="commission" className="mt-0">
            <CommissionPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
