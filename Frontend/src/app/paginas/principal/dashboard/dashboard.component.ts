import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { CartaoGraficoComponent } from '../../../componentes/ui/cartao-grafico/cartao-grafico.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { HeaderService } from '../../../layout/header.service';
import { StatusServico, TipoPagamento } from '../../../shared/data/servicos.model';
import {
    DashboardFiltro,
    DashboardResumo,
    DashboardService,
    DistribuicaoServicosPorTipo,
    MixPagamento,
    ProdutividadeEquipe,
    SerieFaturamentoMensal,
    TopCliente
} from './dashboard.service';

type Tendencia = 'up' | 'down' | 'flat';
type TipoCartao = 'sucesso' | 'alerta' | 'erro';

/**
 * View model para os cartões de indicador exibidos no topo do dashboard.
 * Ajuste aqui quando precisar incluir novos campos (ex.: tooltip) para os cartões.
 */
interface IndicadorResumo {
  titulo: string;
  valor: string | number;
  descricao: string;
  icone: string;
  tendencia: Tendencia;
  tipo: TipoCartao;
}

/**
 * Contratos de visualização dos gráficos (linha, donut, barra).
 * Servem como camada entre `DashboardService` (dados crus) e os componentes de gráfico.
 */
interface GraficoLinhaView {
  series: { name: string; data: number[] }[];
  categorias: string[];
  cores: string[];
  tooltip: any;
  legenda: any;
}

interface GraficoDonutView {
  series: number[];
  rotulos: string[];
  cores: string[];
  resumo: MixPagamento[] | DistribuicaoServicosPorTipo[];
}

interface GraficoBarraView {
  series: { name: string; data: number[] }[];
  categorias: string[];
  cores: string[];
}

/**
 * Componente principal do Dashboard.
 *
 * Funções-chave:
 * - Gerenciar filtros (signals) e aplicá-los ao `DashboardService`.
 * - Transformar o resumo em dados amigáveis aos cartões/gráficos.
 * - Configurar ações e busca via `HeaderService`.
 *
 * Para manutenção:
 * - Novos filtros → crie novos signals e inclua-os em `filtroAtual`.
 * - Novos gráficos → exponha computed específicos consumindo `DashboardResumo`.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CartaoIndicadorComponent, CartaoGraficoComponent, BotaoComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly dashboard = inject(DashboardService);
  private readonly header = inject(HeaderService);

  private readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly numero = new Intl.NumberFormat('pt-BR');
  private readonly percentual = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  private readonly mesCurto = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

  readonly termoBusca = signal('');
  readonly mostrarPainelFiltros = signal(false);
  readonly statusSelecionados = signal<Set<StatusServico>>(new Set());
  readonly segmentosSelecionados = signal<Set<string>>(new Set());
  readonly pagamentosSelecionados = signal<Set<TipoPagamento>>(new Set());
  readonly dataInicio = signal('');
  readonly dataFim = signal('');

  readonly statusOpcoes = computed(() => this.dashboard.listarStatus());
  readonly segmentoOpcoes = computed(() => this.dashboard.listarSegmentos());
  readonly pagamentoOpcoes = computed(() => this.dashboard.listarPagamentos());

  constructor() {
    this.configurarHeader();
  }

  ngOnInit(): void {
    void this.dashboard.carregar();
  }

  private readonly filtroAtual = computed<DashboardFiltro>(() => {
    const periodo = this.periodoFiltro();
    const busca = this.termoBusca().trim();
    return {
      status: [...this.statusSelecionados()],
      segmentos: [...this.segmentosSelecionados()],
      formasPagamento: [...this.pagamentosSelecionados()],
      periodo: periodo ?? undefined,
      busca: busca ? busca : undefined,
    };
  });

  readonly resumo = computed<DashboardResumo>(() => this.dashboard.obterResumo(this.filtroAtual()));

  /**
   * Monta os dados dos cartões principais.
   * Converta sempre os valores usando os formatadores utilitários para manter padrão.
   */
  readonly indicadores = computed<IndicadorResumo[]>(() => {
    const dados = this.resumo();
    const tendenciaFaturamento = this.definirTendencia(dados.variacaoFaturamentoPct);
    const prefixoVariacao = tendenciaFaturamento === 'up' ? '↑' : tendenciaFaturamento === 'down' ? '↓' : '→';
    const sinalVariacao = dados.variacaoFaturamentoPct > 0 ? '+' : dados.variacaoFaturamentoPct < 0 ? '-' : '';

    return [
      {
        titulo: 'Faturamento bruto',
        valor: this.formatarMoeda(dados.faturamentoBruto),
        descricao: `${prefixoVariacao} ${sinalVariacao}${this.formatarPercentual(Math.abs(dados.variacaoFaturamentoPct))} vs mês anterior`,
        icone: 'fas fa-chart-line',
        tendencia: tendenciaFaturamento,
        tipo: tendenciaFaturamento === 'down' ? 'alerta' : 'sucesso',
      },
      {
        titulo: 'Faturamento líquido',
        valor: this.formatarMoeda(dados.faturamentoLiquido),
        descricao: `Margem ${this.formatarPercentual(dados.margemLiquidaPct)} sobre o bruto`,
        icone: 'fas fa-sack-dollar',
        tendencia: 'flat',
        tipo: 'sucesso',
      },
      {
        titulo: 'Pendências',
        valor: this.numero.format(dados.pendenciasQuantidade),
        descricao: `${this.formatarMoeda(dados.pendenciasValorTotal)} em aberto`,
        icone: 'fas fa-hourglass-half',
        tendencia: dados.pendenciasQuantidade > 0 ? 'down' : 'flat',
        tipo: dados.pendenciasQuantidade > 0 ? 'alerta' : 'sucesso',
      },
      {
        titulo: 'Vencidas',
        valor: this.numero.format(dados.vencidasQuantidade),
        descricao: `${this.formatarMoeda(dados.vencidasValorTotal)} vencido`,
        icone: 'fas fa-file-circle-xmark',
        tendencia: dados.vencidasQuantidade > 0 ? 'down' : 'flat',
        tipo: dados.vencidasQuantidade > 0 ? 'erro' : 'alerta',
      },
      {
        titulo: 'Clientes ativos',
        valor: this.numero.format(dados.clientesAtivosQuantidade),
        descricao: `${dados.novosClientesNoMes >= 0 ? '+' : ''}${this.numero.format(dados.novosClientesNoMes)} novos no ciclo`,
        icone: 'fas fa-users',
        tendencia: dados.novosClientesNoMes > 0 ? 'up' : dados.novosClientesNoMes < 0 ? 'down' : 'flat',
        tipo: dados.novosClientesNoMes >= 0 ? 'sucesso' : 'alerta',
      },
    ];
  });

  /**
   * Converte a série mensal do serviço em dados compatíveis com o componente `CartaoGrafico`.
   */
  readonly graficoFaturamento = computed<GraficoLinhaView>(() => this.converterSerieFaturamento(this.resumo().serieFaturamentoMensal));

  readonly graficoSegmentos = computed<GraficoBarraView>(() => {
    const dados = this.resumo().receitaPorSegmento;
    return {
      series: [
        { name: 'Valor bruto', data: dados.map((item) => item.valorBruto) },
        { name: 'Valor líquido', data: dados.map((item) => item.valorLiquido) },
      ],
      categorias: dados.map((item) => item.segmento),
      cores: ['#0f766e', '#34d399'],
    };
  });

  readonly graficoDistribuicao = computed<GraficoDonutView>(() => {
    const dados = this.resumo().distribuicaoServicosPorTipo;
    const coresPadrao = ['#0f766e', '#10b981', '#34d399', '#5eead4'];
    return {
      series: dados.map((item) => item.quantidade),
      rotulos: dados.map((item) => item.tipo),
      cores: dados.map((_, indice) => coresPadrao[indice % coresPadrao.length]),
      resumo: dados,
    };
  });

  readonly graficoPagamentos = computed<GraficoDonutView>(() => {
    const dados = this.resumo().mixPagamentos;
    const coresPadrao = ['#047857', '#0f766e', '#34d399', '#5eead4', '#0ea5e9'];
    return {
      series: dados.map((item) => item.quantidade),
      rotulos: dados.map((item) => item.tipo),
      cores: dados.map((_, indice) => coresPadrao[indice % coresPadrao.length]),
      resumo: dados,
    };
  });

  readonly graficoPipeline = computed<GraficoBarraView>(() => {
    const dados = this.resumo().statusPipeline;
    return {
      series: [
        { name: 'Serviços', data: dados.map((item) => item.quantidade) },
      ],
      categorias: dados.map((item) => item.status),
      cores: ['#0f766e'],
    };
  });

  readonly topClientes = computed<TopCliente[]>(() => this.resumo().topClientes);
  readonly produtividadeEquipe = computed<ProdutividadeEquipe[]>(() => this.resumo().produtividadeEquipe);

  readonly periodoReferencia = computed(() => this.formatarPeriodoLongo(this.resumo().periodoReferencia));

  readonly temFiltrosAtivos = computed(() => {
    return (
      this.statusSelecionados().size > 0 ||
      this.segmentosSelecionados().size > 0 ||
      this.pagamentosSelecionados().size > 0 ||
      !!this.dataInicio() ||
      !!this.dataFim() ||
      !!this.termoBusca().trim()
    );
  });

  /**
   * Alterna a visibilidade do drawer de filtros avançados.
   */
  togglePainelFiltros(): void {
    this.mostrarPainelFiltros.update((atual) => !atual);
  }

  /**
   * Sincroniza campo de busca local com a search bar do Header.
   */
  atualizarBusca(valor: string): void {
    this.termoBusca.set(valor);
    this.header.patchSearch({ value: valor });
  }

  /**
   * Força recarga dos dados em `DashboardService`. Utilize debounce quando integrar a eventos contínuos.
   */
  atualizarDados(): void {
    void this.dashboard.carregar(true);
  }

  /**
   * Handlers de filtro: usam `toggleValor` para manter sets imutáveis.
   */
  toggleStatus(status: StatusServico): void {
    this.statusSelecionados.update((atual) => this.toggleValor(atual, status));
  }

  toggleSegmento(segmento: string): void {
    this.segmentosSelecionados.update((atual) => this.toggleValor(atual, segmento));
  }

  togglePagamento(pagamento: TipoPagamento): void {
    this.pagamentosSelecionados.update((atual) => this.toggleValor(atual, pagamento));
  }

  setDataInicio(valor: string): void {
    this.dataInicio.set(valor);
  }

  setDataFim(valor: string): void {
    this.dataFim.set(valor);
  }

  /**
   * Restaura filtros padrão, inclusive limpando a busca no header.
   */
  limparFiltros(): void {
    this.statusSelecionados.set(new Set());
    this.segmentosSelecionados.set(new Set());
    this.pagamentosSelecionados.set(new Set());
    this.dataInicio.set('');
    this.dataFim.set('');
    this.termoBusca.set('');
    this.header.patchSearch({ value: '' });
  }

  formatarMoeda(valor: number): string {
    return this.moeda.format(valor);
  }

  formatarPercentual(valor: number): string {
    return this.percentual.format(valor);
  }

  formatarNumero(valor: number): string {
    return this.numero.format(valor);
  }

  percentualParticipacao(valor: number): string {
    return this.percentual.format(valor);
  }

  /**
   * Define ações e search bar do layout superior. Adicione novos botões aqui quando surgirem features globais.
   */
  private configurarHeader(): void {
    this.header.setHeader('Resumo', [
      {
        id: 'filtros-dashboard',
        label: 'Filtros',
        icon: 'fas fa-sliders',
        variant: 'secundario',
        execute: () => this.togglePainelFiltros(),
      },
      {
        id: 'atualizar-dashboard',
        label: 'Atualizar dados',
        icon: 'fas fa-rotate',
        variant: 'fantasma',
        execute: () => this.atualizarDados(),
      },
    ]);

    this.header.setSearch({
      placeholder: 'Buscar cliente, OS, NF...',
      icon: 'fas fa-search',
      value: '',
      onChange: (valor) => this.atualizarBusca(valor),
      onSubmit: (valor) => this.atualizarBusca(valor),
    });
  }

  /**
   * Transforma dados do serviço em formato ApexCharts-like (series/categorias).
   * Ajuste cores/tooltip conforme branding.
   */
  private converterSerieFaturamento(serie: SerieFaturamentoMensal[]): GraficoLinhaView {
    const categorias = serie.map((ponto) => this.formatarPeriodoCurto(ponto.periodo));
    const series = [
      { name: 'Valor bruto', data: serie.map((ponto) => Number(ponto.valorBruto.toFixed(2))) },
      { name: 'Valor líquido', data: serie.map((ponto) => Number(ponto.valorLiquido.toFixed(2))) },
    ];

    return {
      series,
      categorias,
      cores: ['#0f766e', '#34d399'],
      tooltip: {
        y: { formatter: (valor: number) => this.formatarMoeda(valor) },
      },
      legenda: {
        position: 'bottom',
        horizontalAlign: 'left',
        offsetY: 8,
      },
    };
  }

  /**
   * Consolida os valores de data em um objeto usado por `DashboardService`.
   */
  private periodoFiltro(): { inicio?: string; fim?: string } | null {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (!inicio && !fim) {
      return null;
    }
    return {
      ...(inicio ? { inicio } : {}),
      ...(fim ? { fim } : {}),
    };
  }

  /**
   * Define a seta/status dos cartões com base na variação percentual.
   */
  private definirTendencia(valor: number): Tendencia {
    if (valor > 0.4) return 'up';
    if (valor < -0.4) return 'down';
    return 'flat';
  }

  /**
   * Utilitário para exibir rótulos de mês/ano em gráficos.
   */
  private formatarPeriodoCurto(periodo: string): string {
    const [ano, mes] = periodo.split('-').map((parte) => Number.parseInt(parte, 10));
    const data = new Date(ano, mes - 1, 1);
    const rotulo = this.mesCurto.format(data).replace('.', '');
    return `${rotulo.charAt(0).toUpperCase() + rotulo.slice(1)}/${String(ano).slice(-2)}`;
  }

  private formatarPeriodoLongo(periodo: string): string {
    const [ano, mes] = periodo.split('-').map((parte) => Number.parseInt(parte, 10));
    const data = new Date(ano, mes - 1, 1);
    const mesNome = data.toLocaleString('pt-BR', { month: 'long' });
    return `${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} de ${ano}`;
  }

  /**
   * Helper genérico usado pelos toggles de filtros (status, segmento, pagamento).
   */
  private toggleValor<T>(conjunto: Set<T>, valor: T): Set<T> {
    const proximo = new Set(conjunto);
    proximo.has(valor) ? proximo.delete(valor) : proximo.add(valor);
    return proximo;
  }

  private totalServicos(): number {
    return this.resumo().statusPipeline.reduce((acc, etapa) => acc + etapa.quantidade, 0);
  }
}
