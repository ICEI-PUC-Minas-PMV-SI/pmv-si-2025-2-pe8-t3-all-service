import { ServicoRelatorio, StatusServico, TIPOS_PAGAMENTO_OPCOES, formatarEnum } from '../../../shared/data/servicos.model';
import { DataInsightConfig } from '../../../shared/metrics/metrics-config';

export const ORDENS_STATUS_PALETTE: Record<StatusServico, string> = {
  ABERTO: '#1d4ed8',
  EM_ANDAMENTO: '#f59e0b',
  AGUARDANDO_PAGAMENTO: '#d97706',
  FATURADO: '#10b981',
  CONCLUIDO: '#047857',
  CANCELADO: '#dc2626',
  ORCAMENTO: '#2563eb',
  ORDEM_SERVICO: '#7c3aed',
  FATURAMENTO: '#059669',
  FINALIZADO: '#047857',
  EM_ANALISE: '#f97316',
};

export const ORDENS_STATUS_ORDER: StatusServico[] = [
  'ABERTO',
  'EM_ANDAMENTO',
  'AGUARDANDO_PAGAMENTO',
  'FATURADO',
  'CONCLUIDO',
  'CANCELADO',
  'ORCAMENTO',
  'ORDEM_SERVICO',
  'FATURAMENTO',
  'FINALIZADO',
  'EM_ANALISE',
];

function gerarDescricao(rows: ServicoRelatorio[], status: StatusServico): string {
  const total = rows.length;
  if (!total) {
    return 'Nenhuma ordem registrada';
  }
  const quantidade = rows.filter((r) => r.status === status).length;
  const percentual = Math.round((quantidade / total) * 100);
  return `${percentual}% do total`;
}

export const ordensInsightConfig: DataInsightConfig = {
  entity: 'ordens',
  metrics: [
    {
      id: 'total',
      label: 'Ordens criadas',
      compute: (rows: ServicoRelatorio[]) => ({
        value: rows.length,
        description: 'Base ativa',
        trend: 'flat',
        icon: 'fas fa-clipboard-list',
        accent: '#2563eb',
      }),
    },
    {
      id: 'emExecucao',
      label: 'Em andamento',
      compute: (rows: ServicoRelatorio[]) => ({
        value: rows.filter((r) => r.status === 'EM_ANDAMENTO').length,
        description: gerarDescricao(rows, 'EM_ANDAMENTO'),
        icon: 'fas fa-spinner',
        tone: 'alerta',
        accent: '#f59e0b',
      }),
    },
    {
      id: 'aguardando',
      label: 'Aguardando pagamento',
      compute: (rows: ServicoRelatorio[]) => ({
        value: rows.filter((r) => r.status === 'AGUARDANDO_PAGAMENTO').length,
        description: gerarDescricao(rows, 'AGUARDANDO_PAGAMENTO'),
        icon: 'fas fa-credit-card',
        tone: 'alerta',
        accent: '#fb923c',
      }),
    },
    {
      id: 'faturadas',
      label: 'Faturadas',
      compute: (rows: ServicoRelatorio[]) => ({
        value: rows.filter((r) => r.status === 'FATURADO').length,
        description: gerarDescricao(rows, 'FATURADO'),
        icon: 'fas fa-badge-check',
        tone: 'sucesso',
        accent: '#16a34a',
      }),
    },
    {
      id: 'receitaTotal',
      label: 'Receita total',
      compute: (rows: ServicoRelatorio[]) => {
        const total = rows.reduce((acc, r) => acc + (r.valorTotal ?? 0), 0);
        const descricao = rows.length ? `${rows.length} ordem(ns)` : 'Sem ordens';
        return {
          value: 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          description: descricao,
          icon: 'fas fa-wallet',
          tone: 'sucesso',
          accent: '#0f766e',
        };
      },
    },
  ],
  charts: [
    {
      id: 'status',
      label: 'Distribuição por status',
      type: 'donut',
      scope: 'filtered',
      build: (rows: ServicoRelatorio[]) => {
        const series = ORDENS_STATUS_ORDER.map((status) => rows.filter((r) => r.status === status).length);
        const labels = ORDENS_STATUS_ORDER.map((status) => formatarEnum(status));
        const colors = ORDENS_STATUS_ORDER.map((status) => ORDENS_STATUS_PALETTE[status]);
        return {
          series,
          labels,
          colors,
          tooltip: { y: { formatter: (v: number) => `${v} ordem(ns)` } },
        };
      },
    },
    {
      id: 'timeline',
      label: 'Evolução mensal',
      type: 'line',
      scope: 'filtered',
      build: (rows: ServicoRelatorio[]) => {
        const agrupado = new Map<string, number>();
        rows.forEach((r) => {
          const chave = (r.data ?? '').substring(0, 7);
          if (!chave) {
            return;
          }
          agrupado.set(chave, (agrupado.get(chave) ?? 0) + 1);
        });
        const ordenado = Array.from(agrupado.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
        const labels = ordenado.map(([mes]) => mes);
        const dados = ordenado.map(([, valor]) => valor);
        return {
          series: [{ name: 'Ordens', data: dados }],
          xaxis: { categories: labels },
          tooltip: { y: { formatter: (v: number) => `${v} ordem(ns)` } },
        };
      },
    },
    {
      id: 'pagamento',
      label: 'Meios de pagamento',
      type: 'donut',
      scope: 'filtered',
      build: (rows: ServicoRelatorio[]) => {
        const labels = TIPOS_PAGAMENTO_OPCOES.map((pagamento) => formatarEnum(pagamento));
        const series = TIPOS_PAGAMENTO_OPCOES.map((pagamento) => rows.filter((r) => r.tipoPagamento === pagamento).length);
        return {
          series,
          labels,
          colors: ['#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#ccfbf1'],
          tooltip: { y: { formatter: (v: number) => `${v} ordem(ns)` } },
        };
      },
    },
  ],
};
