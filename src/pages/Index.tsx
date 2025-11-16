import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Database, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { salesData, SalesData } from "@/data/salesData";

const Index = () => {
  const [selectedPeriodos, setSelectedPeriodos] = useState<string[]>([]);
  const [selectedRegionais, setSelectedRegionais] = useState<string[]>([]);
  const [selectedLocais, setSelectedLocais] = useState<string[]>([]);
  const [selectedAnalistas, setSelectedAnalistas] = useState<string[]>([]);

  // Extract unique values for filters
  const periodos = [...new Set(salesData.map(d => d.periodo))];
  const regionais = [...new Set(salesData.map(d => d.regional))];
  const locais = [...new Set(salesData.map(d => d.local))];
  const analistas = [...new Set(salesData.map(d => d.analista))];

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return salesData.filter(item => {
      const periodoMatch = selectedPeriodos.length === 0 || selectedPeriodos.includes(item.periodo);
      const regionalMatch = selectedRegionais.length === 0 || selectedRegionais.includes(item.regional);
      const localMatch = selectedLocais.length === 0 || selectedLocais.includes(item.local);
      const analistaMatch = selectedAnalistas.length === 0 || selectedAnalistas.includes(item.analista);
      return periodoMatch && regionalMatch && localMatch && analistaMatch;
    });
  }, [selectedPeriodos, selectedRegionais, selectedLocais, selectedAnalistas]);

  // Calculate KPIs
  const valorTotal = filteredData.reduce((sum, item) => sum + item.valor, 0);
  const mediaPorTransacao = filteredData.length > 0 ? valorTotal / filteredData.length : 0;
  const totalRegistros = filteredData.length;

  // Prepare chart data
  const valorPorAnalista = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      acc[item.analista] = (acc[item.analista] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([analista, valor]) => ({ analista, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [filteredData]);

  const valorPorLocal = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      acc[item.local] = (acc[item.local] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([local, valor]) => ({ local, valor }));
  }, [filteredData]);

  const valorPorRegional = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      acc[item.regional] = (acc[item.regional] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([regional, valor]) => ({ regional, valor }));
  }, [filteredData]);

  const valorPorPeriodo = useMemo(() => {
    const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto"];
    const grouped = filteredData.reduce((acc, item) => {
      acc[item.periodo] = (acc[item.periodo] || 0) + item.valor;
      return acc;
    }, {} as Record<string, number>);
    
    return monthOrder
      .filter(month => grouped[month])
      .map(periodo => ({ periodo, valor: grouped[periodo] }));
  }, [filteredData]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleFilterChange = (type: 'periodo' | 'regional' | 'local' | 'analista', value: string) => {
    const setters = {
      periodo: setSelectedPeriodos,
      regional: setSelectedRegionais,
      local: setSelectedLocais,
      analista: setSelectedAnalistas,
    };
    
    const getters = {
      periodo: selectedPeriodos,
      regional: selectedRegionais,
      local: selectedLocais,
      analista: selectedAnalistas,
    };

    const setter = setters[type];
    const current = getters[type];

    if (value === "all") {
      setter([]);
    } else if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Dashboard de Performance de Vendas
          </h1>
          <p className="text-muted-foreground">Análise detalhada de métricas e tendências</p>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Período</label>
                <Select onValueChange={(value) => handleFilterChange('periodo', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Todos</SelectItem>
                    {periodos.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Regional</label>
                <Select onValueChange={(value) => handleFilterChange('regional', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todas as regionais" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Todas</SelectItem>
                    {regionais.map(r => (
                      <SelectItem key={r} value={r}>Regional {r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Local</label>
                <Select onValueChange={(value) => handleFilterChange('local', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos os locais" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Todos</SelectItem>
                    {locais.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Analista</label>
                <Select onValueChange={(value) => handleFilterChange('analista', value)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos os analistas" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">Todos</SelectItem>
                    {analistas.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Valor Total"
            value={formatCurrency(valorTotal)}
            icon={DollarSign}
          />
          <KPICard
            title="Média por Transação"
            value={formatCurrency(mediaPorTransacao)}
            icon={TrendingUp}
          />
          <KPICard
            title="Total de Registros"
            value={totalRegistros}
            icon={Database}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Valor por Analista */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Valor por Analista</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valorPorAnalista}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="analista" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Valor por Local */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Valor por Local</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={valorPorLocal}
                    dataKey="valor"
                    nameKey="local"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.local}: ${formatCurrency(entry.valor)}`}
                  >
                    {valorPorLocal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Valor por Regional */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Valor por Regional</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valorPorRegional}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="regional" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 4: Valor por Período */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Valor por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={valorPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-3))', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Dados Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Analista</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Regional</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.identificacao}>
                      <TableCell>{row.identificacao}</TableCell>
                      <TableCell>{row.local}</TableCell>
                      <TableCell>{row.analista}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(row.valor)}</TableCell>
                      <TableCell>{row.periodo}</TableCell>
                      <TableCell>{row.regional}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
