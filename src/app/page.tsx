// app/page.tsx
"use client"; // necessário porque você usa hooks e componentes client-side

import DebtCalculator from "@/components/DebtCalculator";
import ClientHistory from "@/components/ClientHistory";
import CommissionPanel from "@/components/CommissionPanel";
import Reports from "@/components/Reports";
import LeadManagement from "@/components/LeadManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  History,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">
            Sistema de Cobrança Advocatícia
          </h1>
          <p className="text-muted-foreground">
            Gerencie cálculos, histórico e comissões
          </p>
        </div>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5 mx-auto">
              <TabsTrigger
                value="calculator"
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculadora
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="commission"
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Comissões
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="py-6">
          <TabsContent value="leads" className="mt-0">
            <LeadManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <Reports />
          </TabsContent>

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
