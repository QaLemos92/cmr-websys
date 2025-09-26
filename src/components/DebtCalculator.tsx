import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

interface CalculationResults {
  honorario: {
    percentual: number;
    valor: number;
    minimo: number;
    economiaMin: number;
    economiaMax: number;
  };
  outrasAcoes: {
    percentual: number;
    valor: number;
    minimo: number;
    economiaMin: number;
    economiaMax: number;
    indenizacao: number;
  };
  consignado: {
    economia: number;
  };
  clausulaTeto: {
    valor: number;
  };
}

export default function DebtCalculator() {
  // Dados do cliente
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientDocument, setClientDocument] = useState<string>("");

  // Valores financeiros
  const [debtValue, setDebtValue] = useState<string>("100000");
  const [economiaValue, setEconomiaValue] = useState<string>("");
  const [indenizacaoValue, setIndenizacaoValue] = useState<string>("");

  // Percentuais editáveis
  const [honorarioPerc, setHonorarioPerc] = useState<string>("1");
  const [honorarioMinimoValue, setHonorarioMinimoValue] =
    useState<string>("3000");
  const [economiaMinPerc, setEconomiaMinPerc] = useState<string>("15");
  const [economiaMaxPerc, setEconomiaMaxPerc] = useState<string>("20");

  const [outrasAcoesPerc, setOutrasAcoesPerc] = useState<string>("1");
  const [outrasAcoesMinimoValue, setOutrasAcoesMinimoValue] =
    useState<string>("1500");
  const [indenizacaoPerc, setIndenizacaoPerc] = useState<string>("30");

  const [consignadoPerc, setConsignadoPerc] = useState<string>("35");
  const [clausulaTetoPerc, setClausulaTetoPerc] = useState<string>("5");

  const [showClausulaTeto, setShowClausulaTeto] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  };

  const calculateResults = () => {
    const debt = parseValue(debtValue);
    const economia = parseValue(economiaValue);
    const indenizacao = parseValue(indenizacaoValue);

    const honorarioPercValue = parseFloat(honorarioPerc) / 100 || 0.01;
    const honorarioMinimo = parseValue(honorarioMinimoValue);
    const economiaMinPercValue = parseFloat(economiaMinPerc) / 100 || 0.15;
    const economiaMaxPercValue = parseFloat(economiaMaxPerc) / 100 || 0.2;

    const outrasAcoesPercValue = parseFloat(outrasAcoesPerc) / 100 || 0.01;
    const outrasAcoesMinimo = parseValue(outrasAcoesMinimoValue);
    const indenizacaoPercValue = parseFloat(indenizacaoPerc) / 100 || 0.3;

    const consignadoPercValue = parseFloat(consignadoPerc) / 100 || 0.35;
    const clausulaTetoPercValue = parseFloat(clausulaTetoPerc) / 100 || 0.05;

    if (debt <= 0) return;

    const results: CalculationResults = {
      honorario: {
        percentual: parseFloat(honorarioPerc) || 1,
        valor: Math.max(debt * honorarioPercValue, honorarioMinimo),
        minimo: honorarioMinimo,
        economiaMin: economia * economiaMinPercValue,
        economiaMax: economia * economiaMaxPercValue,
      },
      outrasAcoes: {
        percentual: parseFloat(outrasAcoesPerc) || 1,
        valor: Math.max(debt * outrasAcoesPercValue, outrasAcoesMinimo),
        minimo: outrasAcoesMinimo,
        economiaMin: economia * economiaMinPercValue,
        economiaMax: economia * economiaMaxPercValue,
        indenizacao: indenizacao * indenizacaoPercValue,
      },
      consignado: {
        economia: economia * consignadoPercValue,
      },
      clausulaTeto: {
        valor: debt * clausulaTetoPercValue,
      },
    };

    setResults(results);
  };

  useEffect(() => {
    calculateResults();
  }, [
    debtValue,
    economiaValue,
    indenizacaoValue,
    honorarioPerc,
    honorarioMinimoValue,
    economiaMinPerc,
    economiaMaxPerc,
    outrasAcoesPerc,
    outrasAcoesMinimoValue,
    indenizacaoPerc,
    consignadoPerc,
    clausulaTetoPerc,
  ]);

  const clearAllData = () => {
    setClientName("");
    setClientPhone("");
    setClientDocument("");
    setDebtValue("");
    setEconomiaValue("");
    setIndenizacaoValue("");
    setShowClausulaTeto(false);
  };

  const resetPercentages = () => {
    setHonorarioPerc("1");
    setHonorarioMinimoValue("3000");
    setEconomiaMinPerc("15");
    setEconomiaMaxPerc("20");
    setOutrasAcoesPerc("1");
    setOutrasAcoesMinimoValue("1500");
    setIndenizacaoPerc("30");
    setConsignadoPerc("35");
    setClausulaTetoPerc("5");
  };

  

  const saveProposal = async (
    proposalType: "honorario" | "outrasAcoes" | "consignado"
  ) => {
    if (!clientName || !clientDocument || !results) {
      alert("Preencha todos os dados do cliente antes de salvar a proposta.");
      return;
    }

    const data = results[proposalType];
    const proposalValue =
      "valor" in data ? data.valor : "economia" in data ? data.economia : 0;

    const proposal = {
    clientName,
    clientPhone,
    clientDocument,
    debtValue: parseValue(debtValue),
    economiaValue: parseValue(economiaValue),
    indenizacaoValue: parseValue(indenizacaoValue),
    proposalType,
    proposalValue,
    status: "pendente",
    date: new Date().toISOString(),
    userId: "temp-user", // depois substituímos pelo usuário logado
  };

  try {
    // verifica se está editando
    const editingProposal = localStorage.getItem("editingProposal");
    let url = "/api/proposals";
    let method: "POST" | "PATCH" = "POST";

    if (editingProposal) {
      const { id } = JSON.parse(editingProposal);
      url = `/api/proposals/${id}`;
      method = "PATCH";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });

    if (!res.ok) {
      throw new Error("Erro ao salvar no servidor");
    }

    if (method === "PATCH") {
      alert(`Proposta editada com sucesso!`);
      localStorage.removeItem("editingProposal");
    } else {
      alert(`Proposta ${proposalType} salva com sucesso!`);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar proposta no servidor");
  }
  };

  useEffect(() => {
    async function loadEditingProposal() {
      const editingProposal = localStorage.getItem("editingProposal");
      if (!editingProposal) return;

      const { id } = JSON.parse(editingProposal);

      try {
        const res = await fetch(`/api/proposals/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar proposta");
        const proposal: ClientProposal = await res.json();

        // Preencher estados com os dados do cliente
        setClientName(proposal.clientName);
        setClientPhone(proposal.clientPhone);
        setClientDocument(proposal.clientDocument);

        setDebtValue(proposal.debtValue.toString());
        setEconomiaValue(proposal.economiaValue.toString());
        setIndenizacaoValue(proposal.indenizacaoValue.toString());

        // Outros campos que você usa na calculadora

        // Se você tiver percentuais do resultado, pode setar aqui
        // setResults(...)
      } catch (err) {
        console.error(err);
        alert("Não foi possível carregar a proposta para edição");
      } finally {
        localStorage.removeItem("editingProposal"); // opcional: limpar
      }
    }

    loadEditingProposal();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={clearAllData}>
            Limpar Dados
          </Button>
          <Button variant="outline" onClick={resetPercentages}>
            Resetar Percentuais
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cadastro do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="clientName">Nome Completo</Label>
              <Input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="clientDocument">CPF/CNPJ</Label>
              <Input
                id="clientDocument"
                type="text"
                value={clientDocument}
                onChange={(e) => setClientDocument(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="debt">Valor da Dívida (R$)</Label>
              <Input
                id="debt"
                type="text"
                value={debtValue}
                onChange={(e) => setDebtValue(e.target.value)}
                placeholder="100.000,00"
              />
            </div>
            <div>
              <Label htmlFor="economia">Economia Obtida (R$)</Label>
              <Input
                id="economia"
                type="text"
                value={economiaValue}
                onChange={(e) => setEconomiaValue(e.target.value)}
                placeholder="20.000,00"
              />
            </div>
            {/* <div>
              <Label htmlFor="indenizacao">Indenização/Repetição (R$)</Label>
              <Input
                id="indenizacao"
                type="text"
                value={indenizacaoValue}
                onChange={(e) => setIndenizacaoValue(e.target.value)}
                placeholder="5.000,00"
              />
            </div> */}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="clausula-teto"
              checked={showClausulaTeto}
              onCheckedChange={setShowClausulaTeto}
            />
            <Label htmlFor="clausula-teto">
              Aplicar Cláusula de Teto (usar apenas se o cliente insistir)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Percentuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Valor do Honorário</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="honorario-perc">Percentual (%)</Label>
                  <Input
                    id="honorario-perc"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={honorarioPerc}
                    onChange={(e) => setHonorarioPerc(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="honorario-minimo">Valor Mínimo (R$)</Label>
                  <Input
                    id="honorario-minimo"
                    type="text"
                    value={honorarioMinimoValue}
                    onChange={(e) => setHonorarioMinimoValue(e.target.value)}
                    placeholder="3.000"
                  />
                </div>
              </div>
            </div>

            {/* <div className="space-y-4">
              <h4 className="font-medium">Outras Ações</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outras-perc">Percentual (%)</Label>
                  <Input
                    id="outras-perc"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={outrasAcoesPerc}
                    onChange={(e) => setOutrasAcoesPerc(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="outras-minimo">Valor Mínimo (R$)</Label>
                  <Input
                    id="outras-minimo"
                    type="text"
                    value={outrasAcoesMinimoValue}
                    onChange={(e) => setOutrasAcoesMinimoValue(e.target.value)}
                    placeholder="1.500"
                  />
                </div>
              </div>
            </div> */}
          </div>

          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="economia-min">Economia Mín (%)</Label>
              <Input
                id="economia-min"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={economiaMinPerc}
                onChange={(e) => setEconomiaMinPerc(e.target.value)}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="economia-max">Economia Máx (%)</Label>
              <Input
                id="economia-max"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={economiaMaxPerc}
                onChange={(e) => setEconomiaMaxPerc(e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="indenizacao-perc">Indenização (%)</Label>
              <Input
                id="indenizacao-perc"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={indenizacaoPerc}
                onChange={(e) => setIndenizacaoPerc(e.target.value)}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="consignado-perc">Consignado (%)</Label>
              <Input
                id="consignado-perc"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={consignadoPerc}
                onChange={(e) => setConsignadoPerc(e.target.value)}
                placeholder="35"
              />
            </div>
          </div> */}

          {showClausulaTeto && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clausula-teto-perc">
                    Cláusula de Teto (%)
                  </Label>
                  <Input
                    id="clausula-teto-perc"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={clausulaTetoPerc}
                    onChange={(e) => setClausulaTetoPerc(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-amber-700">
                    ⚠️ Usar apenas se o cliente insistir muito
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className=" justify-center lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Valor do Honorário
                <Badge variant="secondary">Principal</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Percentual Aplicado</Label>
                  <p className="text-2xl font-semibold text-primary">
                    {results.honorario.percentual}%
                  </p>
                </div>
                <div>
                  <Label>Valor Calculado</Label>
                  <p className="text-2xl font-semibold text-primary">
                    {formatCurrency(results.honorario.valor)}
                  </p>
                </div>
              </div>

              {parseValue(economiaValue) > 0 && (
                <div>
                  <Label>
                    Sobre a Economia ({economiaMinPerc}% - {economiaMaxPerc}%)
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {economiaMinPerc}%:
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(results.honorario.economiaMin)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {economiaMaxPerc}%:
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(results.honorario.economiaMax)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={() => saveProposal("honorario")}
                  className="w-full"
                  disabled={!clientName || !clientDocument}
                >
                  Salvar Proposta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Outras Ações
                <Badge variant="outline">Alternativa</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Percentual Aplicado</Label>
                  <p className="text-2xl font-semibold text-primary">
                    {results.outrasAcoes.percentual}%
                  </p>
                </div>
                <div>
                  <Label>Valor Calculado</Label>
                  <p className="text-2xl font-semibold text-primary">
                    {formatCurrency(results.outrasAcoes.valor)}
                  </p>
                </div>
              </div>

              {parseValue(economiaValue) > 0 && (
                <div>
                  <Label>
                    Sobre a Economia ({economiaMinPerc}% - {economiaMaxPerc}%)
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {economiaMinPerc}%:
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(results.outrasAcoes.economiaMin)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {economiaMaxPerc}%:
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(results.outrasAcoes.economiaMax)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parseValue(indenizacaoValue) > 0 && (
                <div>
                  <Label>Indenizações/Repetição ({indenizacaoPerc}%)</Label>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(results.outrasAcoes.indenizacao)}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={() => saveProposal("outrasAcoes")}
                  className="w-full"
                  disabled={!clientName || !clientDocument}
                >
                  Salvar Proposta
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Consignado
                <Badge variant="secondary">Sem Entrada</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parseValue(economiaValue) > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label>{consignadoPerc}% dos Valores Economizados</Label>
                    <p className="text-2xl font-semibold text-primary">
                      {formatCurrency(results.consignado.economia)}
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => saveProposal("consignado")}
                      className="w-full"
                      disabled={!clientName || !clientDocument}
                    >
                      Salvar Proposta
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Informe o valor da economia para calcular
                </p>
              )}
            </CardContent>
          </Card> */}

          {showClausulaTeto && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  Cláusula de Teto
                  <Badge variant="destructive">Exceção</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-amber-800">
                    Limite de {clausulaTetoPerc}% sobre o valor total da dívida
                  </Label>
                  <p className="text-2xl font-semibold text-amber-800">
                    {formatCurrency(results.clausulaTeto.valor)}
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    ⚠️ Usar apenas se o cliente insistir muito
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="honorario">
              <TabsList className="flex justify-center w-full mx-auto">
                <TabsTrigger value="honorario">Honorário</TabsTrigger>
                {/* <TabsTrigger value="outras">Outras Ações</TabsTrigger> */}
                <TabsTrigger value="consignado">Consignado</TabsTrigger>
              </TabsList>

              <TabsContent value="honorario" className="space-y-4">
                <PaymentOptions value={results.honorario.valor} />
              </TabsContent>

              {/* <TabsContent value="outras" className="space-y-4">
                <PaymentOptions value={results.outrasAcoes.valor} />
              </TabsContent> */}

              <TabsContent value="consignado" className="space-y-4">
                {parseValue(economiaValue) > 0 ? (
                  <PaymentOptions value={results.consignado.economia} />
                ) : (
                  <p className="text-muted-foreground">
                    Informe o valor da economia para calcular as formas de
                    pagamento
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PaymentOptions({ value }: { value: number }) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const payment = {
    boletoEntrada: value * 0.3,
    boletoRestante: value * 0.7,
    boletoParcela: Math.max((value * 0.7) / 10, 300),
    cartaoParcela: value / 10,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cartão de Crédito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Até 10x com acréscimo das taxas</p>
            <div>
              <Label>Valor por parcela (sem taxas)</Label>
              <p className="text-xl font-semibold text-primary">
                {formatCurrency(payment.cartaoParcela)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              * Taxas do cartão serão acrescentadas
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Boleto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label>Entrada (30%)</Label>
              <p className="text-xl font-semibold text-primary">
                {formatCurrency(payment.boletoEntrada)}
              </p>
            </div>
            <div>
              <Label>10x de</Label>
              <p className="text-xl font-semibold text-primary">
                {formatCurrency(payment.boletoParcela)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              * Boleto mínimo: R$ 300,00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
