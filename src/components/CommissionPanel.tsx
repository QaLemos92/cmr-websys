import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { DollarSign, TrendingUp, Target, CheckCircle } from "lucide-react";

interface ClientProposal {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDocument: string;
  debtValue: number;
  economiaValue: number;
  indenizacaoValue: number;
  proposalType: "honorario" | "outrasAcoes" | "consignado";
  proposalValue: number;
  percentuais: {
    honorario: number;
    economiaMin: number;
    economiaMax: number;
    indenizacao: number;
    consignado: number;
  };
  date: string;
  status: "pendente" | "fechado" | "recusado";
  notes?: string;
}

interface MonthlyCommission {
  month: string;
  monthNumber: number;
  year: number;
  totalContracts: number;
  totalHonorarios: number;
  totalCommission: number;
  contracts: ClientProposal[];
}

export default function CommissionPanel() {
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [commissionRate, setCommissionRate] = useState<string>("5");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getMonthName = (monthNumber: number): string => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[monthNumber - 1];
  };

  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch("/api/proposals");
        if (!res.ok) throw new Error("Erro ao carregar propostas");
        const data: ClientProposal[] = await res.json();

        // Apenas contratos fechados
        const closed = data.filter((p) => p.status === "fechado");
        setProposals(closed);

        // Definir ano e mês atuais
        const now = new Date();
        setSelectedYear(now.getFullYear().toString());
        setSelectedMonth((now.getMonth() + 1).toString().padStart(2, "0"));
      } catch (err) {
        console.error("Erro ao buscar propostas:", err);
      }
    }

    loadProposals();
  }, []);

  const calculateCommission = (honorarioValue: number): number => {
    return honorarioValue * (parseFloat(commissionRate) / 100);
  };

  const getMonthlyCommissions = (): MonthlyCommission[] => {
    const commissionsByMonth: { [key: string]: MonthlyCommission } = {};

    proposals.forEach((proposal) => {
      const date = new Date(proposal.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!commissionsByMonth[monthKey]) {
        commissionsByMonth[monthKey] = {
          month: getMonthName(date.getMonth() + 1),
          monthNumber: date.getMonth() + 1, // 👈 adicionado
          year: date.getFullYear(),
          totalContracts: 0,
          totalHonorarios: 0,
          totalCommission: 0,
          contracts: [],
        };
      }

      commissionsByMonth[monthKey].totalContracts++;
      commissionsByMonth[monthKey].totalHonorarios += proposal.proposalValue;
      commissionsByMonth[monthKey].totalCommission += calculateCommission(
        proposal.proposalValue
      );
      commissionsByMonth[monthKey].contracts.push(proposal);
    });

    return Object.values(commissionsByMonth).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (
        new Date(`${a.month} 1, ${a.year}`).getMonth() -
        new Date(`${b.month} 1, ${b.year}`).getMonth()
      );
    });
  };

  const monthlyCommissions = getMonthlyCommissions();

  const filteredCommissions = monthlyCommissions.filter((commission) => {
    if (selectedMonth !== "all" && selectedYear !== "all") {
      return (
        commission.year.toString() === selectedYear &&
        new Date(`${commission.month} 1, ${commission.year}`).getMonth() + 1 ===
          parseInt(selectedMonth)
      );
    }
    if (selectedYear !== "all") {
      return commission.year.toString() === selectedYear;
    }
    if (selectedMonth !== "all") {
      return (
        new Date(`${commission.month} 1, ${commission.year}`).getMonth() + 1 ===
        parseInt(selectedMonth)
      );
    }
    return true;
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = Janeiro, 8 = Setembro
  const startOfMonth = new Date(currentYear, currentMonth, 1);

  const totalStats = {
    totalContracts: proposals.length,
    totalHonorarios: proposals.reduce((sum, p) => sum + p.proposalValue, 0),
    totalCommissions: proposals.reduce(
      (sum, p) => sum + calculateCommission(p.proposalValue),
      0
    ),
    currentMonthCommission: proposals
      .filter((p) => {
        const date = new Date(p.date); // 👈 use "p.date" ou "p.createdAt", depende do seu schema
        return date >= startOfMonth && date <= now;
      })
      .reduce((sum, p) => sum + calculateCommission(p.proposalValue), 0),
  };
  const availableYears = Array.from(
    new Set(monthlyCommissions.map((c) => c.year))
  ).sort((a, b) => b - a);
  const availableMonths = Array.from(
    new Set(
      monthlyCommissions
        .filter(
          (c) => selectedYear === "all" || c.year.toString() === selectedYear
        )
        .map((c) => c.monthNumber) // 👈 agora usa o número
    )
  ).sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="mb-2">Painel de Comissões</h1>
        <p className="text-muted-foreground">
          Acompanhe suas comissões baseadas nos contratos fechados
        </p>
      </div>

      {/* Configuração da Comissão */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="commission-rate">Taxa de Comissão (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="5"
              />
            </div>
            <div>
              <Label>Filtrar por Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filtrar por Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Contratos Fechados
                </p>
                <p className="font-semibold">{totalStats.totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Honorários
                </p>
                <p className="font-semibold text-xs">
                  {formatCurrency(totalStats.totalHonorarios)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Comissões</p>
                <p className="font-semibold text-xs">
                  {formatCurrency(totalStats.totalCommissions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mês Atual</p>
                <p className="font-semibold text-xs">
                  {formatCurrency(totalStats.currentMonthCommission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma comissão encontrada para os filtros selecionados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommissions.map((commission, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {commission.month} {commission.year}
                      </span>
                      <Badge variant="secondary">
                        {commission.totalContracts} contrato
                        {commission.totalContracts !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Total em Honorários</Label>
                        <p className="text-xl font-semibold text-primary">
                          {formatCurrency(commission.totalHonorarios)}
                        </p>
                      </div>
                      <div>
                        <Label>Taxa de Comissão</Label>
                        <p className="text-xl font-semibold text-green-600">
                          {commissionRate}%
                        </p>
                      </div>
                      <div>
                        <Label>Sua Comissão</Label>
                        <p className="text-xl font-semibold text-green-600">
                          {formatCurrency(commission.totalCommission)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Contratos Fechados</Label>
                      <div className="mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Valor do Honorário</TableHead>
                              <TableHead>Sua Comissão</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {commission.contracts.map((contract) => (
                              <TableRow key={contract.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">
                                      {contract.clientName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {contract.clientDocument}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(contract.date)}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(contract.proposalValue)}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {formatCurrency(
                                    calculateCommission(contract.proposalValue)
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
