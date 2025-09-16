import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock, User, Building2, Phone, FileText, AlertTriangle, CheckCircle2, XCircle, Plus, Search, TrendingUp } from 'lucide-react';
import { cn } from './ui/utils';

interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDocument: string;
  clientEmail?: string;
  bankName: string;
  debtValue: number;
  currentSituation: string;
  status: 'novo' | 'em_reuniao' | 'proposta_enviada' | 'fechado' | 'perdido' | 'recusado';
  meetingDate?: Date;
  notes: string;
  objecoes?: string;
  createdAt: string;
  updatedAt: string;
  origem: string;
  proposalValue?: number;
  proposalType?: 'superendividamento' | 'outras_acoes' | 'consignado';
}

const BANKS = [
  'Banco do Brasil', 'Itaú', 'Bradesco', 'Caixa', 'Santander',
  'Nubank', 'Inter', 'C6 Bank', 'BTG Pactual', 'Safra',
  'Sicoob', 'Sicredi', 'Creditas', 'Banco Pan', 'BMG',
  'Fintech/Digital', 'Outros'
];

const ORIGENS = [
  'Site/Landing Page', 'WhatsApp', 'Instagram', 'Facebook', 
  'Google Ads', 'Indicação', 'Telefone', 'E-mail', 'Outros'
];

const SITUACOES = [
  'Cobrança judicial iniciada',
  'Busca e apreensão',
  'Execução em andamento',
  'Negativação/SPC-Serasa',
  'Ameaça de bloqueio judicial',
  'Parcelamento negado pelo banco',
  'Juros abusivos',
  'Outros'
];

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Formulário de novo lead
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    status: 'novo',
    origem: '',
    notes: ''
  });
  
  const [meetingDate, setMeetingDate] = useState<Date>();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  };

  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  useEffect(() => {
    // Carregar leads do localStorage
    const savedLeads = localStorage.getItem('crmLeads');
    if (savedLeads) {
      const parsedLeads = JSON.parse(savedLeads);
      setLeads(parsedLeads);
      setFilteredLeads(parsedLeads);
    }
  }, []);

  useEffect(() => {
    // Filtrar leads
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.clientDocument.includes(searchTerm) ||
        lead.clientPhone.includes(searchTerm) ||
        lead.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, leads]);

  const saveLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('crmLeads', JSON.stringify(updatedLeads));
  };

  const createLead = () => {
    if (!newLead.clientName || !newLead.clientDocument || !newLead.clientPhone || !newLead.bankName || !newLead.debtValue) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const lead: Lead = {
      id: Date.now().toString(),
      clientName: newLead.clientName!,
      clientPhone: newLead.clientPhone!,
      clientDocument: newLead.clientDocument!,
      clientEmail: newLead.clientEmail || '',
      bankName: newLead.bankName!,
      debtValue: newLead.debtValue!,
      currentSituation: newLead.currentSituation || '',
      status: 'novo',
      meetingDate: meetingDate,
      notes: newLead.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origem: newLead.origem || ''
    };

    const updatedLeads = [...leads, lead];
    saveLeads(updatedLeads);
    
    // Limpar formulário
    setNewLead({
      status: 'novo',
      origem: '',
      notes: ''
    });
    setMeetingDate(undefined);
    setIsNewLeadOpen(false);
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status'], notes?: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            notes: notes ? `${lead.notes}\n${new Date().toLocaleString('pt-BR')}: ${notes}` : lead.notes
          }
        : lead
    );
    
    saveLeads(updatedLeads);
  };

  const updateMeetingDate = (leadId: string, date: Date) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            meetingDate: date,
            status: 'em_reuniao' as const,
            updatedAt: new Date().toISOString(),
            notes: `${lead.notes}\n${new Date().toLocaleString('pt-BR')}: Reunião agendada para ${formatDate(date)}`
          }
        : lead
    );
    
    saveLeads(updatedLeads);
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'novo':
        return <Badge variant="secondary"><Plus className="w-3 h-3 mr-1" />Novo</Badge>;
      case 'em_reuniao':
        return <Badge variant="default" className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Em Reunião</Badge>;
      case 'proposta_enviada':
        return <Badge variant="default" className="bg-yellow-500"><FileText className="w-3 h-3 mr-1" />Proposta Enviada</Badge>;
      case 'fechado':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Fechado</Badge>;
      case 'perdido':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Perdido</Badge>;
      case 'recusado':
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'novo').length,
    emReuniao: leads.filter(l => l.status === 'em_reuniao').length,
    propostaEnviada: leads.filter(l => l.status === 'proposta_enviada').length,
    fechados: leads.filter(l => l.status === 'fechado').length,
    perdidos: leads.filter(l => l.status === 'perdido').length,
    taxaFechamento: leads.length > 0 ? (leads.filter(l => l.status === 'fechado').length / leads.length * 100).toFixed(1) : '0',
    ticketMedio: leads.filter(l => l.proposalValue).reduce((sum, l) => sum + (l.proposalValue || 0), 0) / Math.max(leads.filter(l => l.proposalValue).length, 1)
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestão de Leads</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads do primeiro contato ao fechamento
          </p>
        </div>
        
        <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={newLead.clientName || ''}
                    onChange={(e) => setNewLead({...newLead, clientName: e.target.value})}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ *</Label>
                  <Input
                    value={newLead.clientDocument || ''}
                    onChange={(e) => setNewLead({...newLead, clientDocument: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label>Telefone/WhatsApp *</Label>
                  <Input
                    value={newLead.clientPhone || ''}
                    onChange={(e) => setNewLead({...newLead, clientPhone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={newLead.clientEmail || ''}
                    onChange={(e) => setNewLead({...newLead, clientEmail: e.target.value})}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Banco/Financeira *</Label>
                  <Select value={newLead.bankName || ''} onValueChange={(value) => setNewLead({...newLead, bankName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map(bank => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor da Dívida *</Label>
                  <Input
                    value={newLead.debtValue || ''}
                    onChange={(e) => setNewLead({...newLead, debtValue: parseValue(e.target.value)})}
                    placeholder="50.000,00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Situação Atual</Label>
                  <Select value={newLead.currentSituation || ''} onValueChange={(value) => setNewLead({...newLead, currentSituation: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qual a situação atual?" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITUACOES.map(situacao => (
                        <SelectItem key={situacao} value={situacao}>{situacao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Origem do Lead</Label>
                  <Select value={newLead.origem || ''} onValueChange={(value) => setNewLead({...newLead, origem: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Como chegou até nós?" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map(origem => (
                        <SelectItem key={origem} value={origem}>{origem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Agendar Reunião (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !meetingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {meetingDate ? meetingDate.toLocaleDateString('pt-BR') : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={meetingDate}
                      onSelect={setMeetingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>Observações Iniciais</Label>
                <Textarea
                  value={newLead.notes || ''}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="Anotações sobre o primeiro contato, preocupações do cliente, etc."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewLeadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createLead}>
                  Cadastrar Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Novos</p>
                <p className="font-semibold">{stats.novos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Em Reunião</p>
                <p className="font-semibold">{stats.emReuniao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Proposta</p>
                <p className="font-semibold">{stats.propostaEnviada}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fechados</p>
                <p className="font-semibold">{stats.fechados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa Fechamento</p>
                <p className="font-semibold">{stats.taxaFechamento}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="font-semibold text-xs">{formatCurrency(stats.ticketMedio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar Lead</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Nome, CPF, telefone ou banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="novo">Novos</SelectItem>
                  <SelectItem value="em_reuniao">Em Reunião</SelectItem>
                  <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                  <SelectItem value="fechado">Fechados</SelectItem>
                  <SelectItem value="perdido">Perdidos</SelectItem>
                  <SelectItem value="recusado">Recusados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Valor Dívida</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.clientName}</p>
                        <p className="text-sm text-muted-foreground">{lead.clientPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.bankName}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(lead.debtValue)}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Lead - {selectedLead?.clientName}</DialogTitle>
                            </DialogHeader>
                            {selectedLead && <LeadDetailsDialog lead={selectedLead} onUpdateStatus={updateLeadStatus} onUpdateMeeting={updateMeetingDate} />}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface LeadDetailsDialogProps {
  lead: Lead;
  onUpdateStatus: (leadId: string, status: Lead['status'], notes?: string) => void;
  onUpdateMeeting: (leadId: string, date: Date) => void;
}

function LeadDetailsDialog({ lead, onUpdateStatus, onUpdateMeeting }: LeadDetailsDialogProps) {
  const [newNotes, setNewNotes] = useState('');
  const [meetingDate, setMeetingDate] = useState<Date>();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  };

  const handleStatusUpdate = (status: Lead['status']) => {
    onUpdateStatus(lead.id, status, newNotes);
    setNewNotes('');
  };

  const handleMeetingSchedule = () => {
    if (meetingDate) {
      onUpdateMeeting(lead.id, meetingDate);
      setMeetingDate(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dados do Cliente */}
      <div>
        <h3 className="font-semibold mb-4">Informações do Cliente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <p>{lead.clientName}</p>
          </div>
          <div>
            <Label>CPF/CNPJ</Label>
            <p>{lead.clientDocument}</p>
          </div>
          <div>
            <Label>Telefone</Label>
            <p>{lead.clientPhone}</p>
          </div>
          <div>
            <Label>E-mail</Label>
            <p>{lead.clientEmail || 'Não informado'}</p>
          </div>
          <div>
            <Label>Banco/Financeira</Label>
            <p>{lead.bankName}</p>
          </div>
          <div>
            <Label>Valor da Dívida</Label>
            <p className="font-semibold">{formatCurrency(lead.debtValue)}</p>
          </div>
          <div>
            <Label>Situação Atual</Label>
            <p>{lead.currentSituation || 'Não informado'}</p>
          </div>
          <div>
            <Label>Origem</Label>
            <p>{lead.origem || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Status e Reunião */}
      <div>
        <h3 className="font-semibold mb-4">Acompanhamento</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Status Atual</Label>
            <p>{lead.status.replace('_', ' ').toUpperCase()}</p>
          </div>
          <div>
            <Label>Criado em</Label>
            <p>{formatDate(lead.createdAt)}</p>
          </div>
          {lead.meetingDate && (
            <div>
              <Label>Reunião Agendada</Label>
              <p>{formatDate(lead.meetingDate)}</p>
            </div>
          )}
          <div>
            <Label>Última Atualização</Label>
            <p>{formatDate(lead.updatedAt)}</p>
          </div>
        </div>
        
        {/* Agendar/Reagendar Reunião */}
        <div className="mb-4">
          <Label>Agendar Reunião</Label>
          <div className="flex gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !meetingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {meetingDate ? meetingDate.toLocaleDateString('pt-BR') : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={meetingDate}
                  onSelect={setMeetingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleMeetingSchedule} disabled={!meetingDate}>
              Agendar
            </Button>
          </div>
        </div>
      </div>

      {/* Histórico de Notas */}
      <div>
        <h3 className="font-semibold mb-4">Histórico de Notas</h3>
        {lead.notes ? (
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
            {lead.notes}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma nota registrada</p>
        )}
      </div>

      {/* Adicionar Nova Nota */}
      <div>
        <Label htmlFor="new-notes">Adicionar Nova Nota</Label>
        <Textarea
          id="new-notes"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Registrar novo contato, objeções, próximos passos..."
          rows={3}
        />
      </div>

      {/* Ações de Status */}
      <div>
        <h3 className="font-semibold mb-4">Alterar Status</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => handleStatusUpdate('em_reuniao')} disabled={lead.status === 'em_reuniao'}>
            Marcar Em Reunião
          </Button>
          <Button variant="outline" onClick={() => handleStatusUpdate('proposta_enviada')} disabled={lead.status === 'proposta_enviada'}>
            Proposta Enviada
          </Button>
          <Button onClick={() => handleStatusUpdate('fechado')} disabled={lead.status === 'fechado'}>
            Marcar como Fechado
          </Button>
          <Button variant="destructive" onClick={() => handleStatusUpdate('perdido')}>
            Marcar como Perdido
          </Button>
        </div>
      </div>
    </div>
  );
}