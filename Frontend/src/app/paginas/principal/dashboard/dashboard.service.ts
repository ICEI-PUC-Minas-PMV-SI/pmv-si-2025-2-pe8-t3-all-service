import { Injectable, inject, signal } from '@angular/core';
import { ServicosDataService } from '../../../shared/data/servicos-data.service';
import {
    ServicoRelatorio,
    StatusServico,
    TipoPagamento,
    formatarEnum,
} from '../../../shared/data/servicos.model';

export interface SerieFaturamentoMensal {
  periodo: string;
  valorBruto: number;
  valorLiquido: number;
}

export interface DistribuicaoServicosPorTipo {
  tipo: string;
  quantidade: number;
  porcentagem: number;
}

export interface MixPagamento {
  tipo: string;
  quantidade: number;
  valorTotal: number;
  porcentagem: number;
}

export interface ReceitaSegmento {
  segmento: string;
  valorBruto: number;
  valorLiquido: number;
}

export interface StatusPipeline {
  status: string;
  quantidade: number;
  valorTotal: number;
}

export interface ProdutividadeEquipe {
  responsavel: string;
  quantidadeServicos: number;
  valorLiquido: number;
  leadTimeMedioDias: number;
}

export interface TopCliente {
  empresa: string;
  valorBruto: number;
  valorLiquido: number;
  participacaoPct: number;
}

export interface DashboardResumo {
  periodoReferencia: string;
  periodoAnterior: string | null;
  faturamentoBruto: number;
  faturamentoLiquido: number;
  variacaoFaturamentoPct: number;
  margemLiquidaPct: number;
  ticketMedioLiquido: number;
  pendenciasQuantidade: number;
  pendenciasValorTotal: number;
  vencidasQuantidade: number;
  vencidasValorTotal: number;
  clientesAtivosQuantidade: number;
  novosClientesNoMes: number;
  serieFaturamentoMensal: SerieFaturamentoMensal[];
  distribuicaoServicosPorTipo: DistribuicaoServicosPorTipo[];
  mixPagamentos: MixPagamento[];
  receitaPorSegmento: ReceitaSegmento[];
  statusPipeline: StatusPipeline[];
  produtividadeEquipe: ProdutividadeEquipe[];
  topClientes: TopCliente[];
}

export interface DashboardFiltro {
  status?: StatusServico[];
  segmentos?: string[];
  formasPagamento?: TipoPagamento[];
  periodo?: { inicio?: string; fim?: string };
  busca?: string;
}

const PENDENCIAS_STATUS: ReadonlySet<StatusServico> = new Set([
  'ABERTO',
  'EM_ANDAMENTO',
  'AGUARDANDO_PAGAMENTO',
]);

const VENCIMENTO_RELEVANTE: ReadonlySet<StatusServico> = new Set([
  'ABERTO',
  'EM_ANDAMENTO',
  'AGUARDANDO_PAGAMENTO',
]);

const TIPOS_SERVICO_REFERENCIA: ReadonlyArray<string> = [
  'Manutenção',
  'Instalação',
  'Calibração',
  'Auditoria',
];

const SEGMENTO_PADRAO = 'Industrial Generalista';
const SEGMENTOS_POR_EMPRESA: Record<string, string> = {
  'empresa-01': 'Metalurgia & Siderurgia',
  'empresa-02': 'Ensaios Laboratoriais',
  'empresa-03': 'Automação Industrial',
  'empresa-04': 'Montagens e Infraestrutura',
};

const MESES_JANELA = 12;
const DECIMAIS = 2;

/**
 * Agrega e prepara dados dos serviços para alimentar o dashboard.
 *
 * Dicas de manutenção:
 * - Sempre normalize os dados aqui (ex.: arredondamentos, agrupamentos) antes de passá-los ao componente.
 * - Ao adicionar novos gráficos, exponha métodos auxiliares semelhantes aos existentes (calcularX/montarY).
 * - `ServicosDataService` é a fonte única da verdade; evite duplicar chamadas HTTP em componentes.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly servicosData = inject(ServicosDataService);
  private readonly servicos = signal<ServicoRelatorio[]>([]);
  private readonly carregando = signal(false);
  private readonly carregado = signal(false);
  private readonly erroInterna = signal<string | null>(null);

  constructor() {
    void this.carregar();
  }

  listarStatus(): StatusServico[] {
    return Array.from(new Set(this.servicos().map((s) => s.status))).sort();
  }

  listarPagamentos(): TipoPagamento[] {
    return Array.from(new Set(this.servicos().map((s) => s.tipoPagamento))).sort();
  }

  listarSegmentos(): string[] {
    return Array.from(
      new Set([
        ...Object.values(SEGMENTOS_POR_EMPRESA),
        ...this.servicos().map((s) => SEGMENTOS_POR_EMPRESA[s.empresa.id] ?? SEGMENTO_PADRAO),
      ])
    ).sort();
  }

  /**
   * Realiza o carregamento inicial (ou forçado) dos serviços.
   * Use o parâmetro `force` quando precisar ignorar o cache atual (ex.: botão "Atualizar dados").
   */
  async carregar(force = false): Promise<void> {
    if (this.carregando() && !force) {
      return;
    }
    if (this.carregado() && !force) {
      return;
    }
    this.carregando.set(true);
    this.erroInterna.set(null);
    try {
      const dados = await this.servicosData.obterServicos(force);
      this.servicos.set(dados);
      this.carregado.set(true);
    } catch (erro) {
      console.error('[DashboardService] Falha ao carregar serviços', erro);
      this.erroInterna.set('Não foi possível carregar os dados do dashboard.');
      this.carregado.set(false);
    } finally {
      this.carregando.set(false);
    }
  }

  estaCarregando(): boolean {
    return this.carregando();
  }

  obterErro(): string | null {
    return this.erroInterna();
  }

  /**
   * Agrega todas as métricas do dashboard para um filtro específico.
   * Sempre que adicionar novos indicadores, calcule-os aqui para manter o componente enxuto.
   */
  obterResumo(filtro: DashboardFiltro = {}): DashboardResumo {
    const origem = this.servicos();
    const servicosFiltrados = this.aplicarFiltro(origem, filtro);
    const totaisPorPeriodo = this.agruparTotaisPorPeriodo(servicosFiltrados);
    const periodosOrdenados = Array.from(totaisPorPeriodo.keys()).sort();

    const periodoReferencia = periodosOrdenados.at(-1) ?? this.periodoHoje();
    const periodoAnterior = periodosOrdenados.length > 1 ? periodosOrdenados[periodosOrdenados.length - 2] : null;

    const totaisAtual = totaisPorPeriodo.get(periodoReferencia) ?? { valorBruto: 0, valorLiquido: 0 };
    const totaisAnterior = periodoAnterior
      ? totaisPorPeriodo.get(periodoAnterior) ?? { valorBruto: 0, valorLiquido: 0 }
      : { valorBruto: 0, valorLiquido: 0 };

    const valorBrutoTotal = servicosFiltrados.reduce((acc, servico) => acc + servico.valorTotal, 0);
    const valorLiquidoTotal = servicosFiltrados.reduce((acc, servico) => acc + servico.valorLiquido, 0);

    const pendencias = servicosFiltrados.filter((s) => PENDENCIAS_STATUS.has(s.status));
    const vencidas = servicosFiltrados.filter((s) => this.servicoEstaVencido(s));

    const clientesAtivos = new Set(servicosFiltrados.map((s) => s.empresa.id));
    const primeirosServicosPorCliente = this.calcularPrimeirosServicos(origem);
    const novosClientes = Array.from(clientesAtivos).filter((clienteId) => {
      const primeiro = primeirosServicosPorCliente.get(clienteId);
      return primeiro === periodoReferencia;
    }).length;

    const serieFaturamentoMensal = this.montarSerieFaturamento(servicosFiltrados, periodoReferencia);
    const distribuicaoServicosPorTipo = this.calcularDistribuicaoPorTipo(servicosFiltrados);
    const mixPagamentos = this.calcularMixPagamentos(servicosFiltrados);
    const receitaPorSegmento = this.calcularReceitaPorSegmento(servicosFiltrados);
    const statusPipeline = this.calcularStatusPipeline(servicosFiltrados);
    const produtividadeEquipe = this.calcularProdutividadeEquipe(servicosFiltrados);
    const topClientes = this.calcularTopClientes(servicosFiltrados, valorLiquidoTotal);

    return {
      periodoReferencia,
      periodoAnterior,
      faturamentoBruto: round2(totaisAtual.valorBruto),
      faturamentoLiquido: round2(totaisAtual.valorLiquido),
      variacaoFaturamentoPct: this.calcularVariacaoPercentual(totaisAtual.valorBruto, totaisAnterior.valorBruto),
      margemLiquidaPct: valorBrutoTotal > 0 ? round1((valorLiquidoTotal / valorBrutoTotal) * 100) : 0,
      ticketMedioLiquido: servicosFiltrados.length > 0 ? round2(valorLiquidoTotal / servicosFiltrados.length) : 0,
      pendenciasQuantidade: pendencias.length,
      pendenciasValorTotal: round2(pendencias.reduce((acc, s) => acc + s.valorTotal, 0)),
      vencidasQuantidade: vencidas.length,
      vencidasValorTotal: round2(vencidas.reduce((acc, s) => acc + s.valorTotal, 0)),
      clientesAtivosQuantidade: clientesAtivos.size,
      novosClientesNoMes: novosClientes,
      serieFaturamentoMensal,
      distribuicaoServicosPorTipo,
      mixPagamentos,
      receitaPorSegmento,
      statusPipeline,
      produtividadeEquipe,
      topClientes,
    };
  }

  /**
   * Aplica filtros combinados (status, período, busca, segmentos/pagamento).
   * Extraia lógica adicional para helpers quando o filtro crescer para manter a legibilidade.
   */
  private aplicarFiltro(servicos: ServicoRelatorio[], filtro: DashboardFiltro): ServicoRelatorio[] {
    const buscaNormalizada = filtro.busca ? normalizarTexto(filtro.busca) : '';
    const periodoInicio = filtro.periodo?.inicio ? new Date(filtro.periodo.inicio) : null;
    const periodoFim = filtro.periodo?.fim ? new Date(filtro.periodo.fim) : null;

    return servicos.filter((servico) => {
      if (filtro.status && filtro.status.length && !filtro.status.includes(servico.status)) {
        return false;
      }

      if (filtro.formasPagamento && filtro.formasPagamento.length && !filtro.formasPagamento.includes(servico.tipoPagamento)) {
        return false;
      }

      if (filtro.segmentos && filtro.segmentos.length) {
        const segmento = SEGMENTOS_POR_EMPRESA[servico.empresa.id] ?? SEGMENTO_PADRAO;
        if (!filtro.segmentos.includes(segmento)) {
          return false;
        }
      }

      if (periodoInicio || periodoFim) {
        const dataServico = new Date(servico.data);
        if (Number.isNaN(dataServico.getTime())) {
          return false;
        }
        if (periodoInicio && dataServico < periodoInicio) return false;
        if (periodoFim && dataServico > periodoFim) return false;
      }

      if (buscaNormalizada) {
        const agregado = normalizarTexto([
          servico.notaFiscal ?? '',
          servico.empresa.nome,
          servico.clienteCertificado ?? '',
          servico.status,
          servico.tipoPagamento,
          servico.usuario.nome,
        ].join(' '));
        if (!agregado.includes(buscaNormalizada)) {
          return false;
        }
      }

      return true;
    });
  }

  private agruparTotaisPorPeriodo(servicos: ServicoRelatorio[]): Map<string, { valorBruto: number; valorLiquido: number }> {
    const mapa = new Map<string, { valorBruto: number; valorLiquido: number }>();
    for (const servico of servicos) {
      const periodo = this.extrairPeriodo(servico.data);
      const atual = mapa.get(periodo) ?? { valorBruto: 0, valorLiquido: 0 };
      atual.valorBruto += servico.valorTotal;
      atual.valorLiquido += servico.valorLiquido;
      mapa.set(periodo, atual);
    }
    return mapa;
  }

  private calcularVariacaoPercentual(valorAtual: number, valorAnterior: number): number {
    if (!valorAnterior) {
      return 0;
    }
    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return Number.isFinite(variacao) ? round1(variacao) : 0;
  }

  private servicoEstaVencido(servico: ServicoRelatorio): boolean {
    if (!servico.dataVencimento) {
      return false;
    }
    if (!VENCIMENTO_RELEVANTE.has(servico.status)) {
      return false;
    }
    const dataVencimento = new Date(servico.dataVencimento);
    if (Number.isNaN(dataVencimento.getTime())) {
      return false;
    }
    return dataVencimento < new Date();
  }

  private montarSerieFaturamento(servicos: ServicoRelatorio[], periodoReferencia: string): SerieFaturamentoMensal[] {
    const [ano, mes] = periodoReferencia.split('-').map((parte) => Number.parseInt(parte, 10));
    const mesIndex = mes - 1;
    const mapa = this.agruparTotaisPorPeriodo(servicos);
    const resultado: SerieFaturamentoMensal[] = [];

    for (let offset = MESES_JANELA - 1; offset >= 0; offset -= 1) {
      const data = new Date(ano, mesIndex - offset, 1);
      const periodo = this.formatarPeriodo(data);
      const totais = mapa.get(periodo) ?? { valorBruto: 0, valorLiquido: 0 };
      resultado.push({
        periodo,
        valorBruto: round2(totais.valorBruto),
        valorLiquido: round2(totais.valorLiquido),
      });
    }

    return resultado;
  }

  private calcularDistribuicaoPorTipo(servicos: ServicoRelatorio[]): DistribuicaoServicosPorTipo[] {
    const total = servicos.length;
    if (total === 0) {
      return [];
    }

    const contagem = new Map<string, number>();
    for (const servico of servicos) {
      const tipo = this.classificarTipoServico(servico);
      contagem.set(tipo, (contagem.get(tipo) ?? 0) + 1);
    }

    return Array.from(contagem.entries())
      .map(([tipo, quantidade]) => ({
        tipo,
        quantidade,
        porcentagem: Math.round((quantidade / total) * 100),
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  private calcularMixPagamentos(servicos: ServicoRelatorio[]): MixPagamento[] {
    const totalServicos = servicos.length || 1;
    const mapa = new Map<TipoPagamento, { quantidade: number; valor: number }>();

    for (const servico of servicos) {
      const atual = mapa.get(servico.tipoPagamento) ?? { quantidade: 0, valor: 0 };
      atual.quantidade += 1;
      atual.valor += servico.valorTotal;
      mapa.set(servico.tipoPagamento, atual);
    }

    return Array.from(mapa.entries())
      .map(([tipo, dados]) => ({
        tipo: formatarEnum(tipo),
        quantidade: dados.quantidade,
        valorTotal: round2(dados.valor),
        porcentagem: Math.round((dados.quantidade / totalServicos) * 100),
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  private calcularReceitaPorSegmento(servicos: ServicoRelatorio[]): ReceitaSegmento[] {
    const mapa = new Map<string, { valorBruto: number; valorLiquido: number }>();

    for (const servico of servicos) {
      const segmento = SEGMENTOS_POR_EMPRESA[servico.empresa.id] ?? SEGMENTO_PADRAO;
      const atual = mapa.get(segmento) ?? { valorBruto: 0, valorLiquido: 0 };
      atual.valorBruto += servico.valorTotal;
      atual.valorLiquido += servico.valorLiquido;
      mapa.set(segmento, atual);
    }

    return Array.from(mapa.entries())
      .map(([segmento, valores]) => ({
        segmento,
        valorBruto: round2(valores.valorBruto),
        valorLiquido: round2(valores.valorLiquido),
      }))
      .sort((a, b) => b.valorBruto - a.valorBruto);
  }

  private calcularStatusPipeline(servicos: ServicoRelatorio[]): StatusPipeline[] {
    const mapa = new Map<string, { quantidade: number; valorTotal: number }>();

    for (const servico of servicos) {
      const chave = formatarEnum(servico.status);
      const atual = mapa.get(chave) ?? { quantidade: 0, valorTotal: 0 };
      atual.quantidade += 1;
      atual.valorTotal += servico.valorTotal;
      mapa.set(chave, atual);
    }

    return Array.from(mapa.entries())
      .map(([status, valores]) => ({
        status,
        quantidade: valores.quantidade,
        valorTotal: round2(valores.valorTotal),
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }

  private calcularProdutividadeEquipe(servicos: ServicoRelatorio[]): ProdutividadeEquipe[] {
    const mapa = new Map<string, { quantidade: number; valorLiquido: number; diasTotal: number; amostras: number }>();

    for (const servico of servicos) {
      const chave = servico.usuario.nome;
      const atual = mapa.get(chave) ?? { quantidade: 0, valorLiquido: 0, diasTotal: 0, amostras: 0 };
      atual.quantidade += 1;
      atual.valorLiquido += servico.valorLiquido;

      if (servico.dataVencimento) {
        const leadTime = diferencaDias(servico.data, servico.dataVencimento);
        if (!Number.isNaN(leadTime)) {
          atual.diasTotal += leadTime;
          atual.amostras += 1;
        }
      }

      mapa.set(chave, atual);
    }

    return Array.from(mapa.entries())
      .map(([responsavel, valores]) => ({
        responsavel,
        quantidadeServicos: valores.quantidade,
        valorLiquido: round2(valores.valorLiquido),
        leadTimeMedioDias: valores.amostras > 0 ? round1(valores.diasTotal / valores.amostras) : 0,
      }))
      .sort((a, b) => b.valorLiquido - a.valorLiquido);
  }

  private calcularTopClientes(servicos: ServicoRelatorio[], totalLiquidoGeral: number): TopCliente[] {
    const mapa = new Map<string, { valorBruto: number; valorLiquido: number }>();

    for (const servico of servicos) {
      const chave = servico.empresa.nome;
      const atual = mapa.get(chave) ?? { valorBruto: 0, valorLiquido: 0 };
      atual.valorBruto += servico.valorTotal;
      atual.valorLiquido += servico.valorLiquido;
      mapa.set(chave, atual);
    }

    const totalLiquido = totalLiquidoGeral || Array.from(mapa.values()).reduce((acc, item) => acc + item.valorLiquido, 0) || 1;

    return Array.from(mapa.entries())
      .map(([empresa, valores]) => ({
        empresa,
        valorBruto: round2(valores.valorBruto),
        valorLiquido: round2(valores.valorLiquido),
        participacaoPct: round1((valores.valorLiquido / totalLiquido) * 100),
      }))
      .sort((a, b) => b.valorLiquido - a.valorLiquido)
      .slice(0, 6);
  }

  private classificarTipoServico(servico: ServicoRelatorio): string {
    const texto = `${servico.descricaoPeca ?? ''} ${servico.observacao ?? ''}`.toLowerCase();

    if (texto.includes('instala')) return 'Instalação';
    if (texto.includes('calibra')) return 'Calibração';
    if (texto.includes('auditor')) return 'Auditoria';
    return 'Manutenção';
  }

  private calcularPrimeirosServicos(servicos: ServicoRelatorio[]): Map<string, string> {
    const mapa = new Map<string, string>();
    for (const servico of servicos) {
      const periodo = this.extrairPeriodo(servico.data);
      const existente = mapa.get(servico.empresa.id);
      if (!existente || periodo < existente) {
        mapa.set(servico.empresa.id, periodo);
      }
    }
    return mapa;
  }

  private extrairPeriodo(dataIso: string): string {
    return dataIso.slice(0, 7);
  }

  private formatarPeriodo(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }

  private periodoHoje(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }
}

function round2(valor: number): number {
  return Number.parseFloat(valor.toFixed(DECIMAIS));
}

function round1(valor: number): number {
  return Number.parseFloat(valor.toFixed(1));
}

function diferencaDias(dataInicioIso: string, dataFimIso: string): number {
  const inicio = new Date(dataInicioIso);
  const fim = new Date(dataFimIso);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    return NaN;
  }
  const diffMs = fim.getTime() - inicio.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

function normalizarTexto(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
