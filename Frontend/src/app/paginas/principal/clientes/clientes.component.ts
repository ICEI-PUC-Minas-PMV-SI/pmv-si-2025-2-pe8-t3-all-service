import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmpresaApi } from '../../../api/empresa.api';
import { EmpresaDTO } from '../../../api/models';
import { BarraSelecaoComponent } from '../../../componentes/ui/barra-ferramentas/barra-selecao.component';
import { EstadoVazioComponent } from '../../../componentes/ui/estado-vazio/estado-vazio.component';
import { MenuExportacaoComponent } from '../../../componentes/ui/exportacao/opcoes-exportacao.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { PaginacaoComponent } from '../../../componentes/ui/paginacao/paginacao.component';
import { SeletorColunasComponent } from '../../../componentes/ui/seletor-colunas/seletor-colunas.component';
import { StatusBadgeComponent } from '../../../componentes/ui/status-badge/status-badge.component';
import { CabecalhoOrdenavelDirective } from '../../../componentes/ui/tabela/cabecalho-ordenavel.directive';
import { AcaoLinha, MenuAcoesLinhaComponent } from '../../../componentes/ui/tabela/menu-acoes-linha.component';
import { HeaderAction, HeaderService } from '../../../layout/header.service';
import { EmpresaRelacionamentosService } from '../../../service/empresa-relacionamentos.service';
import { ExportService } from '../../../shared/export/export.service';
import { DynamicInsightService } from '../../../shared/metrics/dynamic-insight.service';
import { ClienteDetalheComponent } from './cliente-detalhe.component';
import { Cliente, clientesInsightConfig } from './clientes-insight.config';

type StatusFiltro = 'Ativo' | 'Inativo';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    BarraSelecaoComponent,
    CartaoIndicadorComponent,
    SeletorColunasComponent,
    MenuExportacaoComponent,
    EstadoVazioComponent,
    PaginacaoComponent,
    MenuAcoesLinhaComponent,
    CabecalhoOrdenavelDirective,
    CentralNotificacoesComponent,
    ClienteDetalheComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesComponent implements OnInit, OnDestroy {
  private readonly header = inject(HeaderService);
  private readonly insight = inject(DynamicInsightService);
  private readonly exportSvc = inject(ExportService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly empresaApi = inject(EmpresaApi);
  private readonly relacionamentos = inject(EmpresaRelacionamentosService);

  private readonly storageKey = 'clientes:v2';

  constructor() {
    this.insight.setConfig(clientesInsightConfig);
    this.carregarPersistido();
  }

  readonly todas = signal<Cliente[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly mostrarFiltros = signal(false);
  readonly buscaRapida = signal('');
  readonly filtrosStatus = signal<Set<StatusFiltro>>(new Set());
  readonly filtrosCategoria = signal<Set<Cliente['categoria']>>(new Set());
  readonly filtrosUf = signal<Set<string>>(new Set());

  readonly detalheAberto = signal(false);
  readonly detalheClienteId = signal<string | null>(null);
  readonly detalheModo = signal<'novo' | 'visualizar' | 'editar'>('visualizar');

  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);

  readonly ordenacao = signal<{ coluna: string; direcao: 'asc' | 'desc' | 'none' }>({ coluna: 'nome', direcao: 'asc' });

  readonly filtradas = computed(() => {
    const termo = this.buscaRapida().trim().toLowerCase();
    const statusSet = this.filtrosStatus();
    const categorias = this.filtrosCategoria();
    const ufs = this.filtrosUf();

    return this.todas().filter((cli) => {
      if (termo) {
        const alvo = `${cli.id} ${cli.razaoSocial} ${cli.cnpj} ${cli.endereco} ${cli.cidade || ''}`.toLowerCase();
        if (!alvo.includes(termo)) {
          return false;
        }
      }

      if (categorias.size > 0 && cli.categoria && !categorias.has(cli.categoria)) {
        return false;
      }

      if (ufs.size > 0 && cli.uf && !ufs.has(cli.uf)) {
        return false;
      }

      if (statusSet.size > 0) {
        const status: StatusFiltro = cli.ativo ? 'Ativo' : 'Inativo';
        if (!statusSet.has(status)) {
          return false;
        }
      }

      return true;
    });
  });

  readonly paginaAtual = computed(() => {
    const start = (this.pagina() - 1) * this.tamanhoPagina();
    return this.filtradas().slice(start, start + this.tamanhoPagina());
  });

  readonly paginaOrdenada = computed(() => {
    const { coluna, direcao } = this.ordenacao();
    if (direcao === 'none') {
      return this.paginaAtual();
    }
    const base = [...this.paginaAtual()].sort((a: any, b: any) => {
      if (a[coluna] === b[coluna]) {
        return 0;
      }
      return a[coluna] > b[coluna] ? 1 : -1;
    });
    return direcao === 'asc' ? base : base.reverse();
  });

  readonly inicio = computed(() => (this.pagina() - 1) * this.tamanhoPagina());
  readonly fim = computed(() => Math.min(this.inicio() + this.paginaAtual().length, this.filtradas().length));

  readonly colunas = signal([
    { id: 'id', label: 'Código', oculta: false },
    { id: 'razaoSocial', label: 'Razão Social', oculta: false },
    { id: 'cnpj', label: 'CNPJ', oculta: false },
    { id: 'endereco', label: 'Endereço', oculta: false },
    { id: 'ativo', label: 'Status', oculta: false },
  ]);
  readonly colunasVisiveis = computed(() => this.colunas().filter((coluna) => !coluna.oculta));

  // Multi-select state
  readonly selecionados = signal<Set<string>>(new Set());
  readonly todosSelecionadosPagina = computed(() =>
    this.paginaAtual().length > 0 && this.paginaAtual().every(cli => this.selecionados().has(cli.id))
  );
  readonly indeterminadoPagina = computed(() => {
    const selecionadosNaPagina = this.paginaAtual().filter(cli => this.selecionados().has(cli.id)).length;
    return selecionadosNaPagina > 0 && selecionadosNaPagina < this.paginaAtual().length;
  });

  readonly totalClientes = computed(() => this.todas().length);
  readonly ativosCount = computed(() => this.todas().filter((cli) => cli.ativo).length);
  readonly inativosCount = computed(() => this.totalClientes() - this.ativosCount());

  readonly categoriasDisponiveis = computed(() => {
    const ordem = ['Industria', 'Comercio', 'Servico', 'Outro'] as const;
    const existentes = new Set(this.todas().map((cli) => cli.categoria).filter((c): c is NonNullable<typeof c> => !!c));
    return ordem.filter((cat) => existentes.has(cat));
  });
  readonly ufsDisponiveis = computed(() => Array.from(new Set(this.todas().map((cli) => cli.uf).filter((u): u is string => !!u))).sort());

  readonly metrics = this.insight.metrics;
  readonly totalFiltrosAplicados = computed(() => {
    const termo = this.buscaRapida().trim() ? 1 : 0;
    return termo + this.filtrosStatus().size + this.filtrosCategoria().size + this.filtrosUf().size;
  });

  private readonly syncSourceRows = effect(() => this.insight.setSourceRows(this.todas()));
  private readonly syncFilteredRows = effect(() => this.insight.setFilteredRows(this.filtradas()));

  private readonly headerActionsEffect = effect(() => {
    const temDados = this.filtradas().length > 0;
    const _mostrar = this.mostrarFiltros();
    this.header.actions.set(this.obterHeaderActions(temDados));
  });

  private readonly headerSearchEffect = effect(() => {
    const termo = this.buscaRapida();
    const config = this.header.search();
    if (!config) {
      return;
    }
    if (config.value === termo) {
      return;
    }
    this.header.patchSearch({ value: termo });
  });

  private readonly persistir = effect(() => {
    const payload = {
      colunasOcultas: this.colunas()
        .filter((coluna) => coluna.oculta)
        .map((coluna) => coluna.id),
      ordenacao: this.ordenacao(),
      filtros: {
        busca: this.buscaRapida(),
        status: Array.from(this.filtrosStatus()),
        categoria: Array.from(this.filtrosCategoria()),
        uf: Array.from(this.filtrosUf()),
        mostrarFiltros: this.mostrarFiltros(),
      },
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  });

  readonly statusDisponiveis: StatusFiltro[] = ['Ativo', 'Inativo'];

  acoes: AcaoLinha[] = [
    { id: 'ver', icone: 'fas fa-eye', titulo: 'Ver' },
    { id: 'editar', icone: 'fas fa-pen', titulo: 'Editar' },
    { id: 'excluir', icone: 'fas fa-trash', titulo: 'Excluir' },
  ];

  ngOnInit(): void {
    this.configurarHeader();
    void this.carregarClientes();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  mudarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  clicarOrdenacao(coluna: string, evento: Event): void {
    evento.preventDefault();
    this.ordenacao.update((atual) => {
      if (atual.coluna !== coluna) {
        return { coluna, direcao: 'asc' };
      }
      const proximaDirecao = atual.direcao === 'asc' ? 'desc' : atual.direcao === 'desc' ? 'none' : 'asc';
      return { coluna, direcao: proximaDirecao };
    });
  }

  alternarColuna(id: string): void {
    this.colunas.update((lista) => lista.map((coluna) => (coluna.id === id ? { ...coluna, oculta: !coluna.oculta } : coluna)));
  }

  toggleMostrarFiltros(): void {
    this.mostrarFiltros.update((valor) => !valor);
  }

  definirBuscaRapida(valor: string): void {
    if (this.buscaRapida() === valor) {
      return;
    }
    this.buscaRapida.set(valor);
    this.pagina.set(1);
  }

  toggleStatusFiltro(status: StatusFiltro): void {
    this.filtrosStatus.update((atual) => {
      const proximo = new Set(atual);
      proximo.has(status) ? proximo.delete(status) : proximo.add(status);
      return proximo;
    });
    this.pagina.set(1);
  }

  toggleCategoriaFiltro(categoria: Cliente['categoria']): void {
    this.filtrosCategoria.update((atual) => {
      const proximo = new Set(atual);
      proximo.has(categoria) ? proximo.delete(categoria) : proximo.add(categoria);
      return proximo;
    });
    this.pagina.set(1);
  }

  toggleUfFiltro(uf: string): void {
    this.filtrosUf.update((atual) => {
      const proximo = new Set(atual);
      proximo.has(uf) ? proximo.delete(uf) : proximo.add(uf);
      return proximo;
    });
    this.pagina.set(1);
  }

  limparFiltrosAvancados(): void {
    if (!this.haFiltrosAplicados()) {
      return;
    }
    this.buscaRapida.set('');
    this.filtrosStatus.set(new Set());
    this.filtrosCategoria.set(new Set());
    this.filtrosUf.set(new Set());
    this.pagina.set(1);
  }

  haFiltrosAplicados(): boolean {
    return !!this.buscaRapida().trim() || this.filtrosStatus().size > 0 || this.filtrosCategoria().size > 0 || this.filtrosUf().size > 0;
  }

  abrirNovoCliente(): void {
    this.detalheModo.set('novo');
    this.detalheClienteId.set(null);
    this.detalheAberto.set(true);
  }

  abrirCliente(cliente: Cliente): void {
    this.detalheModo.set('visualizar');
    this.detalheClienteId.set(cliente.id);
    this.detalheAberto.set(true);
  }

  editarCliente(cliente: Cliente): void {
    this.detalheModo.set('editar');
    this.detalheClienteId.set(cliente.id);
    this.detalheAberto.set(true);
  }

  abrirClientePorTecla(evento: KeyboardEvent, cliente: Cliente): void {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      this.abrirCliente(cliente);
    }
  }

  exportar(formato: string): void {
    this.exportSvc.export(formato as any, this.filtradas(), this.colunasVisiveis().map((coluna) => ({ key: coluna.id, header: coluna.label })), 'clientes');
  }

  // Multi-select methods
  toggleSelecionado(id: string): void {
    this.selecionados.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleSelecionarTodosPagina(evento: Event): void {
    const checkbox = evento.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selecionados.update(set => {
        const newSet = new Set(set);
        this.paginaAtual().forEach(cli => newSet.add(cli.id));
        return newSet;
      });
    } else {
      this.selecionados.update(set => {
        const newSet = new Set(set);
        this.paginaAtual().forEach(cli => newSet.delete(cli.id));
        return newSet;
      });
    }
  }

  limparSelecao(): void {
    this.selecionados.set(new Set());
  }

  exportarSelecionados(): void {
    const selecionadosArray = this.todas().filter(cli => this.selecionados().has(cli.id));
    if (selecionadosArray.length === 0) return;

    this.exportSvc.export('xlsx', selecionadosArray, this.colunasVisiveis().map((coluna) => ({ key: coluna.id, header: coluna.label })), 'clientes-selecionados');
    this.limparSelecao();
  }

  excluirSelecionados(): void {
    const ids = Array.from(this.selecionados());
    if (ids.length === 0) return;

    // TODO: Implement delete logic
    this.limparSelecao();
  }

  marcarSelecionadosComoAtivos(): void {
    const ids = Array.from(this.selecionados());
    if (ids.length === 0) return;

    // TODO: Implement mark as active logic
    this.limparSelecao();
  }

  acao(acao: string, cliente: Cliente): void {
    if (acao === 'ver') {
      this.abrirCliente(cliente);
    } else if (acao === 'editar') {
      this.editarCliente(cliente);
    } else if (acao === 'excluir') {
      this.removerCliente(cliente);
    }
  }

  fecharDetalhe(): void {
    this.detalheAberto.set(false);
    this.detalheClienteId.set(null);
    this.detalheModo.set('visualizar');
  }

  clienteSalvo(): void {
    this.fecharDetalhe();
    void this.carregarClientes();
  }

  clienteExcluido(): void {
    this.fecharDetalhe();
    void this.carregarClientes();
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }

  formatarPercentual(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 }).format(valor);
  }

  formatarNumero(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }

  private configurarHeader(): void {
    this.header.setHeader('Empresas', this.obterHeaderActions(this.filtradas().length > 0));
    this.header.setSearch({
      placeholder: 'Buscar empresa, CNPJ ou endereço',
      ariaLabel: 'Buscar empresas',
      value: this.buscaRapida(),
      onChange: (valor) => this.definirBuscaRapida(valor),
      onSubmit: (valor) => this.definirBuscaRapida(valor.trim()),
    });
  }

  private obterHeaderActions(temDados: boolean): HeaderAction[] {
    return [
      {
        id: 'toggle-filtros',
        label: this.mostrarFiltros() ? 'Fechar filtros' : 'Filtros',
        icon: 'fas fa-filter',
        variant: 'secundario',
        execute: () => this.toggleMostrarFiltros(),
      },
      {
        id: 'exportar-clientes',
        label: 'Exportar',
        icon: 'fas fa-file-export',
        variant: 'fantasma',
        className: 'as-outline-button',
        disabled: () => !temDados,
        execute: () => this.exportar('xlsx'),
      },
      {
        id: 'novo-cliente',
        label: 'Nova empresa',
        icon: 'fas fa-building',
        variant: 'primario',
        execute: () => this.abrirNovoCliente(),
      },
    ];
  }

  private carregarPersistido(): void {
    try {
      const bruto = localStorage.getItem(this.storageKey);
      if (!bruto) {
        return;
      }
      const dados = JSON.parse(bruto);
      if (Array.isArray(dados.colunasOcultas)) {
        this.colunas.update((lista) =>
          lista.map((coluna) => ({ ...coluna, oculta: dados.colunasOcultas.includes(coluna.id) })),
        );
      }
      if (dados.ordenacao) {
        this.ordenacao.set(dados.ordenacao);
      }
      if (dados.filtros) {
        this.buscaRapida.set(dados.filtros.busca ?? '');
        if (Array.isArray(dados.filtros.status)) {
          this.filtrosStatus.set(new Set(dados.filtros.status.filter((item: string) => item === 'Ativo' || item === 'Inativo')));
        }
        if (Array.isArray(dados.filtros.categoria)) {
          this.filtrosCategoria.set(new Set(dados.filtros.categoria));
        }
        if (Array.isArray(dados.filtros.uf)) {
          this.filtrosUf.set(new Set(dados.filtros.uf));
        }
        if (typeof dados.filtros.mostrarFiltros === 'boolean') {
          this.mostrarFiltros.set(dados.filtros.mostrarFiltros);
        }
      }
    } catch {
      /* ignore */
    }
  }

  private async carregarClientes(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
  const pagina = await firstValueFrom(this.empresaApi.list({ pagina: 0, quantidade: 200 }));
  const dados = (pagina.content ?? []).map((dto) => this.mapEmpresa(dto));
      this.todas.set(dados);
      this.pagina.set(1);
      this.selecionados.set(new Set());
    } catch (erro) {
      console.error(erro);
      this.erro.set('Não foi possível carregar as empresas.');
      this.notificacao.erro('Não foi possível carregar as empresas.');
    } finally {
      this.carregando.set(false);
    }
  }

  private mapEmpresa(dto: EmpresaDTO): Cliente {
    return {
      id: dto.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      razaoSocial: dto.razaoSocial,
      cnpj: dto.cnpj,
      endereco: dto.endereco ?? '',
      idUsuario: dto.idUsuario,
      categoria: 'Industria',
      ativo: true,
    } satisfies Cliente;
  }

  private async removerCliente(cliente: Cliente): Promise<void> {
    const podeExcluir = await this.validarExclusao(cliente);
    if (!podeExcluir) {
      return;
    }

    try {
      await firstValueFrom(this.empresaApi.remove(cliente.id));
      this.notificacao.sucesso('Empresa removida com sucesso.');
      await this.carregarClientes();
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível excluir a empresa.');
    }
  }

  private async validarExclusao(cliente: Cliente): Promise<boolean> {
    try {
      const resumo = await this.relacionamentos.obterResumo(cliente.id, cliente.razaoSocial);
      if (resumo.contatos > 0 || resumo.servicos > 0) {
        const blocos: string[] = [];
        if (resumo.contatos > 0) {
          blocos.push(`${resumo.contatos} contato${resumo.contatos > 1 ? 's' : ''}`);
        }
        if (resumo.servicos > 0) {
          blocos.push(`${resumo.servicos} serviço${resumo.servicos > 1 ? 's' : ''}`);
        }
        const detalhe = blocos.join(' e ');
        this.notificacao.erro(`Exclusão bloqueada: ${detalhe} vinculados à empresa. Remova esses registros primeiro.`);
        return false;
      }

      return window.confirm(`Excluir a empresa "${cliente.razaoSocial}"? Esta ação não poderá ser desfeita.`);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível validar dependências da empresa.');
      return false;
    }
  }

  obterIconeMetrica(id: string): string {
    const icones: Record<string, string> = {
      'total': 'fas fa-users',
      'ativos': 'fas fa-user-check',
      'industria': 'fas fa-industry',
      'inativos': 'fas fa-user-slash',
    };
    return icones[id] || 'fas fa-chart-line';
  }

  obterCorMetrica(id: string): string {
    const cores: Record<string, string> = {
      total: '#0ea5e9',
      ativos: '#16a34a',
      industria: '#6366f1',
      inativos: '#f97316',
    };
    return cores[id] || '#0f766e';
  }

  obterTomMetrica(id: string): 'sucesso' | 'alerta' | 'erro' | undefined {
    if (id === 'ativos') {
      return 'sucesso';
    }
    if (id === 'inativos') {
      return 'alerta';
    }
    return undefined;
  }
}
