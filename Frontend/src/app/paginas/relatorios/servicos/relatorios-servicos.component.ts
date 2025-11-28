import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarraSelecaoComponent } from '../../../componentes/ui/barra-ferramentas/barra-selecao.component';
import { CartaoGraficoComponent } from '../../../componentes/ui/cartao-grafico/cartao-grafico.component';
import { EstadoVazioComponent } from '../../../componentes/ui/estado-vazio/estado-vazio.component';
import { MenuExportacaoComponent } from '../../../componentes/ui/exportacao/opcoes-exportacao.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { PaginacaoComponent } from '../../../componentes/ui/paginacao/paginacao.component';
import { SeletorColunasComponent } from '../../../componentes/ui/seletor-colunas/seletor-colunas.component';
import { CabecalhoOrdenavelDirective } from '../../../componentes/ui/tabela/cabecalho-ordenavel.directive';
import { AcaoLinha, MenuAcoesLinhaComponent } from '../../../componentes/ui/tabela/menu-acoes-linha.component';
import { HeaderService } from '../../../layout/header.service';
import { ServicosDataService } from '../../../shared/data/servicos-data.service';
import {
    STATUS_CLASSES,
    STATUS_SERVICO_OPCOES,
    ServicoRelatorio,
    StatusServico,
    TIPOS_IMPOSTO_OPCOES,
    TIPOS_PAGAMENTO_OPCOES,
    TipoImposto,
    TipoPagamento,
    formatarEnum,
} from '../../../shared/data/servicos.model';
import { ExportField, ExportService } from '../../../shared/export/export.service';
import { CalculoImpostoConfig, CalculoImpostoModalComponent } from './calculo-imposto-modal/calculo-imposto-modal.component';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const CAMPOS_EXPORT: ExportField[] = [
  { key: 'id', header: 'ID' },
  { key: 'data', header: 'Data' },
  { key: 'notaFiscal', header: 'Nota Fiscal' },
  { key: 'empresa', header: 'Empresa' },
  { key: 'cnpjEmpresa', header: 'CNPJ' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'status', header: 'Status' },
  { key: 'tipoPagamento', header: 'Pagamento' },
  { key: 'imposto', header: 'Imposto' },
  { key: 'valorTotal', header: 'Valor Total' },
  { key: 'valorImposto', header: 'Valor Imposto' },
  { key: 'valorLiquido', header: 'Valor Líquido' },
];

interface KPIs {
  totalServicos: number;
  descricaoServicos: string;
  valorBruto: number;
  valorLiquido: number;
  totalImpostos: number;
  cargaTributaria: number;
  ticketMedio: number;
  servicosConcluidos: number;
  percentualConcluidos: number;
  servicosEmAndamento: number;
  percentualEmAndamento: number;
}

@Component({
  selector: 'app-relatorios-servicos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CartaoGraficoComponent,
    MenuExportacaoComponent,
    SeletorColunasComponent,
    BarraSelecaoComponent,
    EstadoVazioComponent,
    CartaoIndicadorComponent,
    PaginacaoComponent,
    CentralNotificacoesComponent,
    MenuAcoesLinhaComponent,
    CabecalhoOrdenavelDirective,
    CalculoImpostoModalComponent,
  ],
  templateUrl: './relatorios-servicos.component.html',
  styleUrls: ['./relatorios-servicos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatoriosServicosComponent implements OnInit {
  private readonly exportSvc = inject(ExportService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);
  private readonly servicosData = inject(ServicosDataService);

  constructor() {
    // Configure header with search and actions
    effect(() => {
      this.header.setHeader('Relatórios de Serviços', [
        {
          label: 'Filtros',
          icon: 'fas fa-filter',
          variant: 'secundario',
          execute: () => this.toggleFiltros(),
        },
        {
          label: 'Calcular imposto',
          icon: 'fas fa-calculator',
          variant: 'secundario',
          execute: () => this.abrirCalculadoraImposto(),
        },
        {
          label: 'Exportar',
          icon: 'fas fa-file-export',
          variant: 'fantasma',
          className: 'as-outline-button',
          disabled: () => this.servicosFiltrados().length === 0,
          execute: () => this.onExportar('xlsx'),
        },
      ]);
      
      this.header.setSearch({
        placeholder: 'Buscar por empresa, NF, cliente...',
        value: this.termoBusca(),
        onChange: (valor) => this.filtrarPorBusca(valor),
      });
    });
  }

  ngOnInit(): void {
    void this.carregarServicos();
  }

  private async carregarServicos(): Promise<void> {
    if (this.carregando()) {
      return;
    }
    this.carregando.set(true);
    try {
      const servicos = await this.servicosData.obterServicos();
      this.servicos.set(servicos);
    } catch (erro) {
      console.error('[RelatoriosServicosComponent] Falha ao carregar serviços', erro);
      this.notificacao.erro('Não foi possível carregar os serviços.');
      this.servicos.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  // State signals
  readonly servicos = signal<ServicoRelatorio[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly termoBusca = signal<string>('');
  readonly dataInicio = signal<string>('');
  readonly dataFim = signal<string>('');
  readonly statusSelecionados = signal<Set<StatusServico>>(new Set());
  readonly pagamentosSelecionados = signal<Set<TipoPagamento>>(new Set());
  readonly impostosSelecionados = signal<Set<TipoImposto>>(new Set());
  readonly mostrarFiltros = signal<boolean>(false);
  readonly mostrarCalculadoraImposto = signal<boolean>(false);
  readonly pagina = signal<number>(1);
  readonly tamanhoPagina = signal<number>(10);
  readonly ordenacao = signal<{ coluna: keyof ServicoRelatorio | 'empresa' | 'valorLiquido'; direcao: 'asc' | 'desc' }>({
    coluna: 'data',
    direcao: 'desc',
  });
  
  // Multi-select state
  readonly selecionados = signal<Set<string>>(new Set());
  
  // Column visibility state
  readonly colunas = signal([
    { id: 'data', label: 'Data', oculta: false },
    { id: 'notaFiscal', label: 'NF', oculta: false },
    { id: 'empresa', label: 'Empresa', oculta: false },
    { id: 'cliente', label: 'Cliente', oculta: false },
    { id: 'status', label: 'Status', oculta: false },
    { id: 'pagamento', label: 'Pagamento', oculta: false },
    { id: 'valorTotal', label: 'Valor bruto', oculta: false },
    { id: 'imposto', label: 'Imposto', oculta: false },
    { id: 'valorLiquido', label: 'Valor líquido', oculta: false },
  ]);

  // Graph filter signals
  readonly statusSelecionadoGrafico = signal<StatusServico | null>(null);
  readonly mesSelecionadoGrafico = signal<string | null>(null);
  readonly impostoSelecionadoGrafico = signal<TipoImposto | null>(null);
  
  // Computed: visible columns
  readonly colunasVisiveis = computed(() => this.colunas().filter(c => !c.oculta));

  // Available options
  readonly statusDisponiveis = STATUS_SERVICO_OPCOES;
  readonly pagamentosDisponiveis = TIPOS_PAGAMENTO_OPCOES;
  readonly impostosDisponiveis = TIPOS_IMPOSTO_OPCOES;

  // Table actions
  readonly acoesLinha: AcaoLinha[] = [
    { id: 'ver', icone: 'fas fa-eye', titulo: 'Visualizar' },
    { id: 'editar', icone: 'fas fa-pen', titulo: 'Editar' },
  ];

  // Computed: filtered services
  readonly servicosFiltrados = computed(() => {
    let resultado = this.servicos();

    // Search filter
    const termo = this.termoBusca().trim().toLowerCase();
    if (termo) {
      resultado = resultado.filter((s) => {
        const agregado = [
          s.notaFiscal ?? '',
          s.empresa.nome,
          s.clienteCertificado ?? '',
          s.descricaoPeca ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return agregado.includes(termo);
      });
    }

    // Date filters
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    if (inicio) resultado = resultado.filter((s) => s.data >= inicio);
    if (fim) resultado = resultado.filter((s) => s.data <= fim);

    // Status filter
    const status = this.statusSelecionados();
    if (status.size > 0) resultado = resultado.filter((s) => status.has(s.status));

    // Payment filter
    const pagamentos = this.pagamentosSelecionados();
    if (pagamentos.size > 0) resultado = resultado.filter((s) => pagamentos.has(s.tipoPagamento));

    // Tax filter
    const impostos = this.impostosSelecionados();
    if (impostos.size > 0) resultado = resultado.filter((s) => s.imposto && impostos.has(s.imposto));

    // Graph filters
    const statusGrafico = this.statusSelecionadoGrafico();
    if (statusGrafico) resultado = resultado.filter((s) => s.status === statusGrafico);

    const mesGrafico = this.mesSelecionadoGrafico();
    if (mesGrafico) {
      resultado = resultado.filter((s) => s.data.slice(0, 7) === mesGrafico);
    }

    const impostoGrafico = this.impostoSelecionadoGrafico();
    if (impostoGrafico) resultado = resultado.filter((s) => s.imposto === impostoGrafico);

    return resultado;
  });

  // Computed: KPIs
  readonly kpis = computed((): KPIs => {
    const dados = this.servicosFiltrados();
    const total = dados.length;
    const valorBruto = dados.reduce((acc, s) => acc + s.valorTotal, 0);
    const valorLiquido = dados.reduce((acc, s) => acc + s.valorLiquido, 0);
    const totalImpostos = dados.reduce((acc, s) => acc + s.valorImposto, 0);
    const concluidos = dados.filter((s) => s.status === 'FINALIZADO').length;
    const emAndamento = dados.filter((s) => s.status === 'ORDEM_SERVICO').length;

    return {
      totalServicos: total,
      descricaoServicos: `${Math.round((total / this.servicos().length) * 100)}% do portfólio`,
      valorBruto,
      valorLiquido,
      totalImpostos,
      cargaTributaria: valorBruto > 0 ? (totalImpostos / valorBruto) * 100 : 0,
      ticketMedio: total > 0 ? valorLiquido / total : 0,
      servicosConcluidos: concluidos,
      percentualConcluidos: total > 0 ? (concluidos / total) * 100 : 0,
      servicosEmAndamento: emAndamento,
      percentualEmAndamento: total > 0 ? (emAndamento / total) * 100 : 0,
    };
  });

  // Computed: Status graph data
  readonly graficoStatus = computed(() => {
    const dados = this.servicosFiltrados();
    const mapa = new Map<StatusServico, number>();
    dados.forEach((s) => {
      mapa.set(s.status, (mapa.get(s.status) || 0) + 1);
    });
    const entries = Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
    return {
      series: entries.map(([_, qtd]) => qtd),
      labels: entries.map(([status, _]) => formatarEnum(status)),
    };
  });

  // Computed: Temporal graph data
  readonly graficoTemporal = computed(() => {
    const dados = this.servicosFiltrados();
    const mapa = new Map<string, { bruto: number; liquido: number }>();
    dados.forEach((s) => {
      const mes = s.data.slice(0, 7);
      const atual = mapa.get(mes) || { bruto: 0, liquido: 0 };
      atual.bruto += s.valorTotal;
      atual.liquido += s.valorLiquido;
      mapa.set(mes, atual);
    });
    const categorias = Array.from(mapa.keys()).sort();
    return {
      categorias,
      series: [
        { name: 'Valor bruto', data: categorias.map((m) => Number((mapa.get(m)?.bruto || 0).toFixed(2))) },
        { name: 'Valor líquido', data: categorias.map((m) => Number((mapa.get(m)?.liquido || 0).toFixed(2))) },
      ],
    };
  });

  // Computed: Tax graph data
  readonly graficoImpostos = computed(() => {
    const dados = this.servicosFiltrados();
    const mapa = new Map<string, { valorImposto: number; valorLiquido: number }>();
    dados.forEach((s) => {
      const tipo = s.imposto || 'SEM_IMPOSTO';
      const atual = mapa.get(tipo) || { valorImposto: 0, valorLiquido: 0 };
      atual.valorImposto += s.valorImposto;
      atual.valorLiquido += s.valorLiquido;
      mapa.set(tipo, atual);
    });
    const entries = Array.from(mapa.entries())
      .map(([tipo, valores]) => ({
        tipo,
        label: tipo === 'SEM_IMPOSTO' ? 'Sem imposto' : formatarEnum(tipo),
        ...valores,
      }))
      .sort((a, b) => b.valorImposto - a.valorImposto);

    return {
      categorias: entries.map((e) => e.label),
      series: [
        { name: 'Imposto', data: entries.map((e) => Number(e.valorImposto.toFixed(2))) },
        { name: 'Líquido', data: entries.map((e) => Number(e.valorLiquido.toFixed(2))) },
      ],
    };
  });

  // Computed: Sorted and paginated data
  readonly paginaAtual = computed(() => {
    const dados = [...this.servicosFiltrados()];
    const { coluna, direcao } = this.ordenacao();
    
    if (direcao !== 'desc') {
      dados.sort((a, b) => {
        const valorA = this.obterValorOrdenacao(a, coluna);
        const valorB = this.obterValorOrdenacao(b, coluna);
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      });
    } else {
      dados.sort((a, b) => {
        const valorA = this.obterValorOrdenacao(a, coluna);
        const valorB = this.obterValorOrdenacao(b, coluna);
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      });
    }

    const inicio = (this.pagina() - 1) * this.tamanhoPagina();
    return dados.slice(inicio, inicio + this.tamanhoPagina());
  });

  // Computed: Check if any filters are active
  readonly temFiltrosAtivos = computed(() => {
    return (
      !!this.termoBusca() ||
      !!this.dataInicio() ||
      !!this.dataFim() ||
      this.statusSelecionados().size > 0 ||
      this.pagamentosSelecionados().size > 0 ||
      this.impostosSelecionados().size > 0
    );
  });

  // Computed: Check if any graph filters are active
  readonly temFiltroGrafico = computed(() => {
    return !!this.statusSelecionadoGrafico() || !!this.mesSelecionadoGrafico() || !!this.impostoSelecionadoGrafico();
  });

  // Methods: Search and filters
  filtrarPorBusca(termo: string): void {
    this.termoBusca.set(termo);
    this.pagina.set(1);
  }

  limparBusca(): void {
    this.termoBusca.set('');
    this.pagina.set(1);
  }

  toggleFiltros(): void {
    this.mostrarFiltros.update((v) => !v);
  }

  setDataInicio(data: string): void {
    this.dataInicio.set(data);
    this.pagina.set(1);
  }

  setDataFim(data: string): void {
    this.dataFim.set(data);
    this.pagina.set(1);
  }

  toggleStatus(status: StatusServico): void {
    this.statusSelecionados.update((set) => {
      const novo = new Set(set);
      novo.has(status) ? novo.delete(status) : novo.add(status);
      return novo;
    });
    this.pagina.set(1);
  }

  togglePagamento(pagamento: TipoPagamento): void {
    this.pagamentosSelecionados.update((set) => {
      const novo = new Set(set);
      novo.has(pagamento) ? novo.delete(pagamento) : novo.add(pagamento);
      return novo;
    });
    this.pagina.set(1);
  }

  toggleImposto(imposto: TipoImposto): void {
    this.impostosSelecionados.update((set) => {
      const novo = new Set(set);
      novo.has(imposto) ? novo.delete(imposto) : novo.add(imposto);
      return novo;
    });
    this.pagina.set(1);
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.dataInicio.set('');
    this.dataFim.set('');
    this.statusSelecionados.set(new Set());
    this.pagamentosSelecionados.set(new Set());
    this.impostosSelecionados.set(new Set());
    this.pagina.set(1);
  }

  // Methods: Graph filters
  filtrarPorStatusGrafico(evento: { rotulo: string }): void {
    const status = this.graficoStatus().labels.indexOf(evento.rotulo);
    if (status === -1) return;
    const statusKey = Array.from(
      new Set(this.servicosFiltrados().map((s) => s.status))
    )[status];
    
    if (this.statusSelecionadoGrafico() === statusKey) {
      this.statusSelecionadoGrafico.set(null);
    } else {
      this.statusSelecionadoGrafico.set(statusKey);
    }
    this.pagina.set(1);
  }

  filtrarPorMes(evento: { categoria: string }): void {
    const mes = evento.categoria;
    if (this.mesSelecionadoGrafico() === mes) {
      this.mesSelecionadoGrafico.set(null);
    } else {
      this.mesSelecionadoGrafico.set(mes);
    }
    this.pagina.set(1);
  }

  filtrarPorImpostoGrafico(evento: { categoria: string }): void {
    const imposto = evento.categoria;
    const impostoMap = this.graficoImpostos().categorias.indexOf(imposto);
    if (impostoMap === -1) return;

    const dados = this.servicosFiltrados();
    const impostos = Array.from(new Set(dados.map((s) => s.imposto).filter((i) => i)));
    const impostoKey = impostos[impostoMap];

    if (this.impostoSelecionadoGrafico() === impostoKey) {
      this.impostoSelecionadoGrafico.set(null);
    } else {
      this.impostoSelecionadoGrafico.set(impostoKey!);
    }
    this.pagina.set(1);
  }

  limparFiltrosGraficos(): void {
    this.statusSelecionadoGrafico.set(null);
    this.mesSelecionadoGrafico.set(null);
    this.impostoSelecionadoGrafico.set(null);
    this.pagina.set(1);
  }

  // Methods: Tax calculator
  abrirCalculadoraImposto(): void {
    this.mostrarCalculadoraImposto.set(true);
  }

  fecharCalculadoraImposto(): void {
    this.mostrarCalculadoraImposto.set(false);
  }

  aplicarCalculoImposto(config: CalculoImpostoConfig): void {
    const { porcentagem, tipoImposto, periodo, dataInicio, dataFim } = config;
    
    // Calculate date range based on period
    let inicio: string;
    let fim: string;
    const hoje = new Date();
    
    if (periodo === 'CUSTOM' && dataInicio && dataFim) {
      inicio = dataInicio;
      fim = dataFim;
    } else {
      const dias = periodo === 'LAST_15' ? 15 : periodo === 'LAST_30' ? 30 : periodo === 'LAST_60' ? 60 : 90;
      const dataInicial = new Date(hoje);
      dataInicial.setDate(dataInicial.getDate() - dias);
      inicio = dataInicial.toISOString().split('T')[0];
      fim = hoje.toISOString().split('T')[0];
    }

    // Update services
    let servicosAtualizados = 0;
    this.servicos.update((servicos) => {
      return servicos.map((servico) => {
        if (
          servico.imposto === tipoImposto &&
          servico.data >= inicio &&
          servico.data <= fim
        ) {
          servicosAtualizados++;
          const novoValorImposto = servico.valorTotal * (porcentagem / 100);
          const novoValorLiquido = servico.valorTotal - novoValorImposto;
          return {
            ...servico,
            valorImposto: novoValorImposto,
            valorLiquido: novoValorLiquido,
          };
        }
        return servico;
      });
    });

    this.fecharCalculadoraImposto();
    this.notificacao.sucesso(
      `Cálculo aplicado com sucesso! ${servicosAtualizados} serviço(s) atualizado(s) com a nova alíquota de ${porcentagem}%.`
    );
  }

  // Methods: Table
  ordenarPor(coluna: keyof ServicoRelatorio | 'empresa' | 'valorLiquido'): void {
    this.ordenacao.update((atual) => {
      if (atual.coluna === coluna) {
        return { coluna, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' };
      }
      return { coluna, direcao: 'asc' };
    });
  }

  mudarPagina(novaPagina: number): void {
    this.pagina.set(novaPagina);
  }

  acaoLinha(acao: string, servico: ServicoRelatorio): void {
    if (acao === 'ver') {
      this.router.navigate(['/servicos', servico.id]);
    } else if (acao === 'editar') {
      this.router.navigate(['/servicos', servico.id, 'editar']);
    }
  }

  // Methods: Export
  onExportar(formato: string): void {
    if (!['csv', 'json', 'xlsx'].includes(formato)) {
      this.notificacao.mostrar('Formato não suportado. Use CSV, JSON ou XLSX.', 'info');
      return;
    }

    const dados = this.servicosFiltrados().map((s) => ({
      id: s.id,
      data: s.data,
      notaFiscal: s.notaFiscal ?? '',
      empresa: s.empresa.nome,
      cnpjEmpresa: s.empresa.cnpj,
      cliente: s.clienteCertificado ?? '',
      status: s.status,
      tipoPagamento: s.tipoPagamento,
      imposto: s.imposto ?? '',
      valorTotal: s.valorTotal,
      valorImposto: s.valorImposto,
      valorLiquido: s.valorLiquido,
    }));

    if (dados.length === 0) {
      this.notificacao.mostrar('Nenhum dado para exportar.', 'info');
      return;
    }

    this.exportSvc.export(formato as 'csv' | 'json' | 'xlsx', dados, CAMPOS_EXPORT, 'relatorios-servicos');
    this.notificacao.sucesso(`Exportação ${formato.toUpperCase()} iniciada.`);
  }

  // Helper methods
  formatarEnum(valor: string | null | undefined): string {
    return formatarEnum(valor);
  }

  formatarMoeda(valor: number): string {
    return formatadorMoeda.format(valor);
  }

  formatarMesAno(mesAno: string): string {
    const [ano, mes] = mesAno.split('-');
    const data = new Date(Number(ano), Number(mes) - 1);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(data);
  }

  statusClasses(status: StatusServico): string {
    return `inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`;
  }
  
  // Sorting
  clicarOrdenacao(colunaId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.ordenarPor(colunaId as any);
  }
  
  // Column management
  alternarColuna(colunaId: string): void {
    this.colunas.update(cols => 
      cols.map(c => c.id === colunaId ? { ...c, oculta: !c.oculta } : c)
    );
  }
  
  // Multi-select methods
  isSelecionado(id: string): boolean {
    return this.selecionados().has(id);
  }
  
  toggleSelecionado(id: string): void {
    this.selecionados.update(sel => {
      const novo = new Set(sel);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }
  
  todosSelecionadosPagina = computed(() => {
    const pagina = this.paginaAtual();
    if (pagina.length === 0) return false;
    return pagina.every(s => this.selecionados().has(s.id));
  });
  
  indeterminadoPagina = computed(() => {
    const pagina = this.paginaAtual();
    const selecionadosNaPagina = pagina.filter(s => this.selecionados().has(s.id)).length;
    return selecionadosNaPagina > 0 && selecionadosNaPagina < pagina.length;
  });
  
  toggleSelecionarTodosPagina(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const pagina = this.paginaAtual();
    
    this.selecionados.update(sel => {
      const novo = new Set(sel);
      pagina.forEach(s => {
        if (checked) novo.add(s.id);
        else novo.delete(s.id);
      });
      return novo;
    });
  }
  
  limparSelecao(): void {
    this.selecionados.set(new Set());
  }
  
  exportarSelecionadas(): void {
    const selecionadosArray = Array.from(this.selecionados());
    const dados = this.servicosFiltrados()
      .filter(s => selecionadosArray.includes(s.id))
      .map(s => ({
        id: s.id,
        data: s.data,
        notaFiscal: s.notaFiscal ?? '',
        empresa: s.empresa.nome,
        cnpjEmpresa: s.empresa.cnpj,
        cliente: s.clienteCertificado ?? '',
        status: s.status,
        tipoPagamento: s.tipoPagamento,
        imposto: s.imposto ?? '',
        valorTotal: s.valorTotal,
        valorImposto: s.valorImposto,
        valorLiquido: s.valorLiquido,
      }));
      
    if (dados.length === 0) {
      this.notificacao.mostrar('Nenhum item selecionado.', 'info');
      return;
    }
    
    this.exportSvc.export('xlsx', dados, CAMPOS_EXPORT, 'relatorios-servicos-selecionados');
    this.notificacao.sucesso(`${dados.length} serviço(s) exportado(s) com sucesso.`);
  }

  private obterValorOrdenacao(servico: ServicoRelatorio, coluna: keyof ServicoRelatorio | 'empresa' | 'valorLiquido'): any {
    if (coluna === 'empresa') return servico.empresa.nome;
    if (coluna === 'valorLiquido') return servico.valorLiquido;
    return (servico as any)[coluna];
  }
}
