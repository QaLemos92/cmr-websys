import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDocument: string;
  clientEmail?: string;
  bankName: string;
  debtValue: number;
  currentSituation: string;
  status:
    | "novo"
    | "em_reuniao"
    | "proposta_enviada"
    | "fechado"
    | "perdido"
    | "recusado";
  meetingDate?: Date;
  notes: string;
  createdAt: string;
  updatedAt: string;
  origem: string;
  proposalValue?: number;
  proposalType?:
    | "superendividamento"
    | "outras_acoes"
    | "consignado";
}

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

export default function Reports() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<ClientProposal[]>(
    [],
  );
  const [selectedPeriod, setSelectedPeriod] =
    useState<string>("30");

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  useEffect(() => {
    // Carregar dados
    const savedLeads = localStorage.getItem("crmLeads");
    const savedProposals = localStorage.getItem(
      "clientProposals",
    );

    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }

    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    }
  }, []);

  const getFilteredData = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredLeads = leads.filter(
      (lead) => new Date(lead.createdAt) >= cutoffDate,
    );
    const filteredProposals = proposals.filter(
      (proposal) => new Date(proposal.date) >= cutoffDate,
    );

    return { filteredLeads, filteredProposals };
  };

  const { filteredLeads, filteredProposals } = getFilteredData(
    parseInt(selectedPeriod),
  );

  // KPIs principais
  const kpis = {
    totalLeads: filteredLeads.length,
    leadsNovos: filteredLeads.filter((l) => l.status === "novo")
      .length,
    reunioesAgendadas: filteredLeads.filter(
      (l) => l.status === "em_reuniao",
    ).length,
    propostasEnviadas: filteredLeads.filter(
      (l) => l.status === "proposta_enviada",
    ).length,
    contratosAssinados: filteredProposals.filter(
      (p) => p.status === "fechado",
    ).length,
    contratosRecusados: filteredProposals.filter(
      (p) => p.status === "recusado",
    ).length,
    leadsPerdidos: filteredLeads.filter(
      (l) => l.status === "perdido",
    ).length,

    taxaConversaoReuniao:
      filteredLeads.length > 0
        ? (
            (filteredLeads.filter(
              (l) => l.status === "em_reuniao",
            ).length /
              filteredLeads.length) *
            100
          ).toFixed(1)
        : "0",
    taxaFechamento:
      filteredLeads.length > 0
        ? (
            (filteredProposals.filter(
              (p) => p.status === "fechado",
            ).length /
              filteredLeads.length) *
            100
          ).toFixed(1)
        : "0",

    receitaGerada: filteredProposals
      .filter((p) => p.status === "fechado")
      .reduce((sum, p) => sum + p.proposalValue, 0),
    ticketMedio:
      filteredProposals.filter((p) => p.status === "fechado")
        .length > 0
        ? filteredProposals
            .filter((p) => p.status === "fechado")
            .reduce((sum, p) => sum + p.proposalValue, 0) /
          filteredProposals.filter(
            (p) => p.status === "fechado",
          ).length
        : 0,

    comissaoGerada:
      filteredProposals
        .filter((p) => p.status === "fechado")
        .reduce((sum, p) => sum + p.proposalValue, 0) * 0.05,
  };

  // Dados para gráficos
  const statusDistribution = [
    { name: "Novos", value: kpis.leadsNovos, color: "#8884d8" },
    {
      name: "Em Reunião",
      value: kpis.reunioesAgendadas,
      color: "#82ca9d",
    },
    {
      name: "Proposta Enviada",
      value: kpis.propostasEnviadas,
      color: "#ffc658",
    },
    {
      name: "Fechados",
      value: kpis.contratosAssinados,
      color: "#00ff00",
    },
    {
      name: "Perdidos",
      value: kpis.leadsPerdidos,
      color: "#ff7f7f",
    },
  ];

  // Origem dos leads
  const origemData = filteredLeads.reduce(
    (acc: any[], lead) => {
      const existingOrigem = acc.find(
        (item) => item.name === lead.origem,
      );
      if (existingOrigem) {
        existingOrigem.value++;
      } else {
        acc.push({
          name: lead.origem || "Não informado",
          value: 1,
        });
      }
      return acc;
    },
    [],
  );

  // Bancos mais comuns
  const bancoData = filteredLeads
    .reduce((acc: any[], lead) => {
      const existingBank = acc.find(
        (item) => item.name === lead.bankName,
      );
      if (existingBank) {
        existingBank.value++;
      } else {
        acc.push({ name: lead.bankName, value: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Evolução mensal (últimos 6 meses)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      leads: leads.filter((l) => {
        const leadDate = new Date(l.createdAt);
        return (
          leadDate.getMonth() === date.getMonth() &&
          leadDate.getFullYear() === date.getFullYear()
        );
      }).length,
      fechamentos: proposals.filter((p) => {
        const propDate = new Date(p.date);
        return (
          propDate.getMonth() === date.getMonth() &&
          propDate.getFullYear() === date.getFullYear() &&
          p.status === "fechado"
        );
      }).length,
    };
  }).reverse();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Relatórios e KPIs</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu funil de vendas
          </p>
        </div>

        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Leads
                </p>
                <p className="text-2xl font-semibold">
                  {kpis.totalLeads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Reuniões
                </p>
                <p className="text-2xl font-semibold">
                  {kpis.reunioesAgendadas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Fechados
                </p>
                <p className="text-2xl font-semibold">
                  {kpis.contratosAssinados}
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
                <p className="text-sm text-muted-foreground">
                  Taxa Fechamento
                </p>
                <p className="text-2xl font-semibold">
                  {kpis.taxaFechamento}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Receita
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(kpis.receitaGerada)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ticket Médio
              </p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrency(kpis.ticketMedio)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Comissão Gerada
              </p>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrency(kpis.comissaoGerada)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Taxa Conv. Reunião
              </p>
              <p className="text-xl font-semibold text-yellow-600">
                {kpis.taxaConversaoReuniao}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Leads Perdidos
              </p>
              <p className="text-xl font-semibold text-red-600">
                {kpis.leadsPerdidos}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Resumidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Origem dos Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Origem dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {origemData.slice(0, 8).map((origem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span>{origem.name}</span>
                  <Badge variant="secondary">
                    {origem.value}
                  </Badge>
                </div>
              ))}
              {origemData.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum dado de origem disponível
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {last6Months.map((month, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {month.month}
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-600">
                        Leads
                      </p>
                      <p className="font-semibold text-blue-700">
                        {month.leads}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600">
                        Fechamentos
                      </p>
                      <p className="font-semibold text-green-700">
                        {month.fechamentos}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Bancos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Bancos/Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          {bancoData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Banco/Financeira</TableHead>
                  <TableHead>Quantidade de Leads</TableHead>
                  <TableHead>Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bancoData.map((banco, index) => (
                  <TableRow key={banco.name}>
                    <TableCell className="font-medium">
                      #{index + 1}
                    </TableCell>
                    <TableCell>{banco.name}</TableCell>
                    <TableCell>{banco.value}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {filteredLeads.length > 0
                          ? (
                              (banco.value /
                                filteredLeads.length) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado de banco disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metas e Benchmarks */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">
            Metas e Benchmarks (Manual DWAC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">
                Taxa de Fechamento
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {kpis.taxaFechamento}%
              </p>
              <p className="text-sm text-blue-600">
                Meta: 30% - 40%
              </p>
              {parseFloat(kpis.taxaFechamento) >= 30 ? (
                <Badge className="bg-green-500 mt-2">
                  ✅ Dentro da meta
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  ⚠️ Abaixo da meta
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-blue-700 mb-2">
                Ticket Médio
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(kpis.ticketMedio)}
              </p>
              <p className="text-sm text-blue-600">
                Meta mínima: R$ 3.000
              </p>
              {kpis.ticketMedio >= 3000 ? (
                <Badge className="bg-green-500 mt-2">
                  ✅ Dentro da meta
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  ⚠️ Abaixo da meta
                </Badge>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-blue-700 mb-2">
                Taxa Conv. Reunião
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {kpis.taxaConversaoReuniao}%
              </p>
              <p className="text-sm text-blue-600">
                Meta mínima: 60%
              </p>
              {parseFloat(kpis.taxaConversaoReuniao) >= 60 ? (
                <Badge className="bg-green-500 mt-2">
                  ✅ Dentro da meta
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  ⚠️ Abaixo da meta
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}