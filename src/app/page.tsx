"use client";
import React, { useState, useEffect } from "react";
import Login, { User } from "@/components/Login";
import LeadManagement from "@/components/LeadManagement";
import DebtCalculator from "@/components/DebtCalculator";
import ClientHistory from "@/components/ClientHistory";
import CommissionPanel from "@/components/CommissionPanel";
import Reports from "@/components/Reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calculator,
  History,
  DollarSign,
  BarChart3,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then((user) => {
      if (user) setUser(user);
    });
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  };

  // Se não estiver logado, mostrar tela de login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Todas as abas disponíveis para todos os usuários
  const availableTabs = [
    { id: "leads", label: "Leads", icon: Users, component: LeadManagement },
    {
      id: "calculator",
      label: "Calculadora",
      icon: Calculator,
      component: DebtCalculator,
    },

    {
      id: "history",
      label: "Histórico",
      icon: History,
      component: ClientHistory,
    },
    { id: "reports", label: "Relatórios", icon: BarChart3, component: Reports },
    {
      id: "commission",
      label: "Comissões",
      icon: DollarSign,
      component: CommissionPanel,
    },
  ];

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Sistema CRM Advocatício - DWAC
              </h1>
              <p className="text-muted-foreground">
                CRM completo do lead ao contrato fechado
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="w-4 h-4" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground">Closer</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={availableTabs[0]?.id} className="w-full">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-6">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <div className="py-6">
          {availableTabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <Component />
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
