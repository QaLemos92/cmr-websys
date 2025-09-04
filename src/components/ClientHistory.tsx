"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Search,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

type ClientProposal = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDocument: string;
  debtValue: number;
  economiaValue: number;
  indenizacaoValue: number;
  proposalType: "honorario" | "outrasAcoes" | "consignado";
  proposalValue: number;
  notes?: string | null;
  status: "pendente" | "fechado" | "recusado";
  date: string;
};

export default function ClientHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ClientProposal[]>(
    []
  );

  // 🔹 Buscar propostas no backend
  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch("/api/proposals");
        if (!res.ok) throw new Error("Erro ao carregar propostas");
        const data: ClientProposal[] = await res.json();
        setProposals(data);
        setFilteredProposals(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadProposals();
  }, []);

  // 🔹 Atualizar status no backend
  const updateProposalStatus = async (
    proposalId: string,
    newStatus: "pendente" | "fechado" | "recusado"
  ) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar status");

      const updated = await res.json();

      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: updated.status } : p
        )
      );
      setFilteredProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: updated.status } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status da proposta");
    }
  };

  const StatusBadge = ({ status }: { status: ClientProposal["status"] }) => {
    const colors = {
      pendente: "bg-yellow-100 text-yellow-700",
      fechado: "bg-green-100 text-green-700",
      recusado: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  const getProposalTypeLabel = (type: string) => {
    switch (type) {
      case "honorario":
        return "Honorário";
      case "outrasAcoes":
        return "Outras Ações";
      case "consignado":
        return "Consignado";
      default:
        return type;
    }
  };
  const handleEditProposal = (proposal: ClientProposal) => {
    localStorage.setItem("editingProposal", JSON.stringify(proposal));
    window.location.href = "/";
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // 🔹 Aplicar filtros
  useEffect(() => {
    const filtered = proposals.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientDocument.includes(searchTerm) ||
        p.clientPhone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "todos" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredProposals(filtered);
  }, [searchTerm, statusFilter, proposals]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Histórico de Clientes</h2>

      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center border rounded-lg px-3 py-2 flex-1 min-w-[250px]">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou telefone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="fechado">Fechado</option>
          <option value="recusado">Recusado</option>
        </select>
      </div>

      {/* 📋 Lista de propostas */}
      <div className="grid gap-4">
        {filteredProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{proposal.clientName}</h3>
                <p className="text-sm text-gray-600">
                  {proposal.clientDocument} • {proposal.clientPhone}
                </p>
              </div>
              <StatusBadge status={proposal.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Dívida: {formatCurrency(proposal.debtValue)}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Tipo: {getProposalTypeLabel(proposal.proposalType)}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                Proposta: {formatCurrency(proposal.proposalValue)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {formatDate(proposal.date)}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="mt-4 flex gap-2">
              {proposal.status !== "fechado" && (
                <button
                  onClick={() => updateProposalStatus(proposal.id, "fechado")}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  Marcar como Fechado
                </button>
              )}
              {proposal.status !== "recusado" && (
                <button
                  onClick={() => updateProposalStatus(proposal.id, "recusado")}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Marcar como Recusado
                </button>
              )}
              {(proposal.status === "pendente" ||
                proposal.status === "recusado") && (
                <button
                  onClick={() => handleEditProposal(proposal)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  Editar
                </button>
              )}
              {proposal.status !== "pendente" && (
                <button
                  onClick={() => updateProposalStatus(proposal.id, "pendente")}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                >
                  Voltar para Pendente
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          Nenhuma proposta encontrada.
        </p>
      )}
    </div>
  );
}
