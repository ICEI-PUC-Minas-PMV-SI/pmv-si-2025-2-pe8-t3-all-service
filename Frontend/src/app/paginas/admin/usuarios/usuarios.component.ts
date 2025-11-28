import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StatusUsuario, TipoPerfil, UsuarioDTO } from '../../../api/models';
import { UsuarioApi } from '../../../api/usuario.api';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { EstadoVazioComponent } from '../../../componentes/ui/estado-vazio/estado-vazio.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { PaginacaoComponent } from '../../../componentes/ui/paginacao/paginacao.component';
import { AcaoLinha, MenuAcoesLinhaComponent } from '../../../componentes/ui/tabela/menu-acoes-linha.component';
import { TokenService } from '../../../core/oauth2/token.service';
import { HeaderAction, HeaderService } from '../../../layout/header.service';
import { ExportField, ExportService } from '../../../shared/export/export.service';

type PerfilUsuarioLabel = 'Master' | 'Administrador' | 'Financeiro' | 'Operador';
type StatusUsuarioLabel = 'Ativo' | 'Inativo';

type Usuario = {
  id: string;
  nome: string;
  funcao: string;
  statusUsuario: StatusUsuarioLabel;
  perfil: PerfilUsuarioLabel;
  senha: string;
  senhaOriginal?: string;
  login: string;
  email: string;
  criadoEm: string;
};

type UsuarioFormValue = {
  nome: string;
  login: string;
  email: string;
  funcao: string;
  perfil: PerfilUsuarioLabel;
  statusUsuario: StatusUsuarioLabel;
  senha: string;
};

const formatadorNumero = new Intl.NumberFormat('pt-BR');
const formatadorPorcentagem = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});


const CAMPOS_EXPORT: ExportField[] = [
  { key: 'id', header: 'ID' },
  { key: 'nome', header: 'Nome' },
  { key: 'login', header: 'Login' },
  { key: 'senha', header: 'Senha' },
  { key: 'email', header: 'E-mail' },
  { key: 'perfil', header: 'Perfil' },
  { key: 'funcao', header: 'Função' },
  { key: 'statusUsuario', header: 'Status' },
  { key: 'criadoEm', header: 'Criado em' },
];

const PERFIS_DISPONIVEIS: PerfilUsuarioLabel[] = ['Master', 'Administrador', 'Financeiro', 'Operador'];
const STATUS_DISPONIVEIS: StatusUsuarioLabel[] = ['Ativo', 'Inativo'];

const STATUS_LABEL_BY_API: Record<StatusUsuario, StatusUsuarioLabel> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
};

const STATUS_API_BY_LABEL: Record<StatusUsuarioLabel, StatusUsuario> = {
  Ativo: 'ATIVO',
  Inativo: 'INATIVO',
};

const PERFIL_LABEL_BY_API: Record<TipoPerfil, PerfilUsuarioLabel> = {
  MASTER: 'Master',
  ADMINISTRADOR: 'Administrador',
  FINANCEIRO: 'Financeiro',
  OPERADOR: 'Operador',
};

const PERFIL_API_BY_LABEL: Record<PerfilUsuarioLabel, TipoPerfil> = {
  Master: 'MASTER',
  Administrador: 'ADMINISTRADOR',
  Financeiro: 'FINANCEIRO',
  Operador: 'OPERADOR',
};

const SENHA_PLACEHOLDER = '********';
const SENHA_SENTINELA = 'Manter@123';

type ColunaOrdenacao = 'nome' | 'email' | 'perfil' | 'statusUsuario' | 'funcao' | 'login' | 'criadoEm';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CartaoIndicadorComponent,
    CentralNotificacoesComponent,
    BotaoComponent,
    PaginacaoComponent,
    EstadoVazioComponent,
    MenuAcoesLinhaComponent,
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosComponent implements OnInit, OnDestroy {
  private readonly header = inject(HeaderService);
  private readonly exportSvc = inject(ExportService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly fb = inject(FormBuilder);
  private readonly usuarioApi = inject(UsuarioApi);
  private readonly tokenService = inject(TokenService);

  readonly todos = signal<Usuario[]>([]);
  readonly busca = signal('');
  readonly mostrarFiltros = signal(false);
  readonly filtroStatus = signal<Set<StatusUsuarioLabel>>(new Set());
  readonly filtroPerfis = signal<Set<PerfilUsuarioLabel>>(new Set());
  readonly filtroFuncoes = signal<Set<string>>(new Set());

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly statusDisponiveis = STATUS_DISPONIVEIS;
  readonly perfisDisponiveis = PERFIS_DISPONIVEIS;

  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);
  readonly ordenacao = signal<{ coluna: ColunaOrdenacao; direcao: 'asc' | 'desc' | 'none' }>({ coluna: 'nome', direcao: 'asc' });

  readonly modalAberto = signal(false);
  readonly modalModo = signal<'novo' | 'editar' | 'visualizar'>('novo');
  readonly usuarioAtual = signal<Usuario | null>(null);

  readonly usuarioForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    login: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    funcao: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
  perfil: this.fb.nonNullable.control<PerfilUsuarioLabel>('Operador', { validators: [Validators.required] }),
  statusUsuario: this.fb.nonNullable.control<StatusUsuarioLabel>('Ativo', { validators: [Validators.required] }),
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
  });

  readonly usuariosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const status = this.filtroStatus();
    const perfis = this.filtroPerfis();
    const funcoes = this.filtroFuncoes();

    return this.todos().filter((usuario) => {
      if (termo) {
        const alvo = `${usuario.id} ${usuario.nome} ${usuario.email} ${usuario.login}`.toLowerCase();
        if (!alvo.includes(termo)) {
          return false;
        }
      }

      if (status.size > 0 && !status.has(usuario.statusUsuario)) {
        return false;
      }

      if (perfis.size > 0 && !perfis.has(usuario.perfil)) {
        return false;
      }

      if (funcoes.size > 0 && !funcoes.has(usuario.funcao)) {
        return false;
      }

      return true;
    });
  });

  readonly usuariosOrdenados = computed(() => this.ordenar([...this.usuariosFiltrados()]));

  readonly usuariosPagina = computed(() => {
    const start = (this.pagina() - 1) * this.tamanhoPagina();
    return this.usuariosOrdenados().slice(start, start + this.tamanhoPagina());
  });

  readonly totalRegistros = computed(() => this.usuariosFiltrados().length);

  readonly funcoesDisponiveis = computed(() => Array.from(new Set(this.todos().map((u) => u.funcao))).sort());

  readonly totalAtivos = computed(() => this.usuariosFiltrados().filter((u) => u.statusUsuario === 'Ativo').length);
  readonly totalPendentes = computed(() => this.usuariosFiltrados().filter((u) => u.statusUsuario === 'Inativo').length);
  readonly totalInativos = computed(() => this.usuariosFiltrados().filter((u) => u.statusUsuario === 'Inativo').length);
  readonly totalAdministradores = computed(() => this.usuariosFiltrados().filter((u) => u.perfil === 'Administrador').length);
  readonly novosUltimoMes = computed(() => {
    const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.usuariosFiltrados().filter((u) => new Date(u.criadoEm).getTime() >= limite).length;
  });

  readonly temFiltroAtivo = computed(() =>
    !!this.busca().trim() ||
    this.filtroStatus().size > 0 ||
    this.filtroPerfis().size > 0 ||
    this.filtroFuncoes().size > 0
  );

  private readonly headerSync = effect(() => {
    const filtrosVisiveis = this.mostrarFiltros();
    const temFiltros = this.temFiltroAtivo();
    const temDados = this.totalRegistros() > 0;
    this.header.setHeader('Usuários do Sistema', this.obterHeaderActions(filtrosVisiveis, temDados));
  });

  private readonly buscaSync = effect(() => {
    const termo = this.busca();
    const config = this.header.search();
    if (!config) return;
    if (config.value !== termo) {
      this.header.patchSearch({ value: termo });
    }
  });

  readonly acoesLinha: AcaoLinha[] = [
    { id: 'visualizar', icone: 'fas fa-eye', titulo: 'Visualizar' },
    { id: 'editar', icone: 'fas fa-edit', titulo: 'Editar' },
    { id: 'exportar', icone: 'fas fa-download', titulo: 'Exportar' },
    { id: 'privilegios', icone: 'fas fa-shield-alt', titulo: 'Alterar privilégios' },
    { id: 'excluir', icone: 'fas fa-trash', titulo: 'Excluir' },
  ];

  ngOnInit(): void {
    this.header.setSearch({
      placeholder: 'Buscar usuário por nome ou e-mail',
      ariaLabel: 'Buscar usuários',
      value: this.busca(),
      onChange: (valor) => this.busca.set(valor),
      onSubmit: (valor) => this.busca.set(valor.trim()),
    });
    void this.carregarUsuarios();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  private async carregarUsuarios(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const pagina = await firstValueFrom(
        this.usuarioApi.list({ pagina: 0, quantidade: 200 })
      );
      const usuarios = pagina.content.map((dto) => this.mapToUsuario(dto));
      this.todos.set(usuarios);
      this.pagina.set(1);
    } catch (error) {
      console.error(error);
      this.erro.set('Não foi possível carregar os usuários.');
      this.notificacao.erro('Não foi possível carregar os usuários.');
    } finally {
      this.carregando.set(false);
    }
  }

  private mapToUsuario(dto: UsuarioDTO): Usuario {
    const status = STATUS_LABEL_BY_API[dto.statusUsuario] ?? 'Ativo';
    const perfil = PERFIL_LABEL_BY_API[dto.perfil] ?? 'Operador';
    return {
      id: dto.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      nome: dto.nome,
      funcao: dto.funcao,
      statusUsuario: status,
      perfil,
      senha: SENHA_PLACEHOLDER,
      senhaOriginal: dto.senha,
      login: dto.login,
      email: dto.email,
      criadoEm: dto.dataCriacao ?? new Date().toISOString(),
    };
  }

  private construirPayload(formValue: UsuarioFormValue, atual: Usuario | null): UsuarioDTO {
    const perfil = PERFIL_API_BY_LABEL[formValue.perfil] ?? 'OPERADOR';
    const status = STATUS_API_BY_LABEL[formValue.statusUsuario] ?? 'ATIVO';
    const senhaNormalizada = this.normalizarSenha(formValue.senha, atual);

    const dto: UsuarioDTO = {
      id: atual?.id,
      nome: formValue.nome.trim(),
      funcao: formValue.funcao.trim(),
      email: formValue.email.trim().toLowerCase(),
      senha: senhaNormalizada,
      perfil,
      statusUsuario: status,
      login: formValue.login.trim(),
    };

    return dto;
  }

  acaoLinha(acao: string, usuario: Usuario): void {
    switch (acao) {
      case 'visualizar':
        this.visualizarUsuario(usuario);
        break;
      case 'editar':
        this.editarUsuario(usuario);
        break;
      case 'exportar':
        this.exportarCartao(usuario);
        break;
      case 'privilegios':
        this.alterarPrivilegios(usuario);
        break;
      case 'excluir':
        this.excluirUsuario(usuario);
        break;
    }
  }

  toggleMostrarFiltros(): void {
    this.mostrarFiltros.update((atual) => !atual);
  }

  alternarStatus(filtro: StatusUsuarioLabel): void {
    const atual = new Set(this.filtroStatus());
    atual.has(filtro) ? atual.delete(filtro) : atual.add(filtro);
    this.filtroStatus.set(atual);
    this.pagina.set(1);
  }

  alternarPerfil(filtro: PerfilUsuarioLabel): void {
    const atual = new Set(this.filtroPerfis());
    atual.has(filtro) ? atual.delete(filtro) : atual.add(filtro);
    this.filtroPerfis.set(atual);
    this.pagina.set(1);
  }

  alternarFuncao(funcao: string): void {
    const atual = new Set(this.filtroFuncoes());
    atual.has(funcao) ? atual.delete(funcao) : atual.add(funcao);
    this.filtroFuncoes.set(atual);
    this.pagina.set(1);
  }

  limparFiltros(): void {
    this.filtroStatus.set(new Set());
    this.filtroPerfis.set(new Set());
    this.filtroFuncoes.set(new Set());
    this.pagina.set(1);
  }

  ordenarPor(coluna: ColunaOrdenacao): void {
    this.ordenacao.update((atual) => {
      if (atual.coluna === coluna) {
        const proxima = atual.direcao === 'asc' ? 'desc' : atual.direcao === 'desc' ? 'none' : 'asc';
        return { coluna, direcao: proxima as 'asc' | 'desc' | 'none' };
      }
      return { coluna, direcao: 'asc' };
    });
  }

  mudarPagina(pagina: number): void {
    this.pagina.set(pagina);
  }

  abrirNovoUsuario(): void {
    this.usuarioAtual.set(null);
    this.modalModo.set('novo');
    this.usuarioForm.enable({ emitEvent: false });
    this.usuarioForm.setValue({
      nome: '',
      login: '',
      email: '',
      funcao: this.funcoesDisponiveis().at(0) ?? '',
      perfil: 'Operador',
      statusUsuario: 'Ativo',
      senha: '',
    });
    this.modalAberto.set(true);
  }

  visualizarUsuario(usuario: Usuario): void {
    this.usuarioAtual.set(usuario);
    this.modalModo.set('visualizar');
    this.usuarioForm.setValue({
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      funcao: usuario.funcao,
      perfil: usuario.perfil,
      statusUsuario: usuario.statusUsuario,
      senha: usuario.senha,
    });
    this.usuarioForm.disable({ emitEvent: false });
    this.modalAberto.set(true);
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioAtual.set(usuario);
    this.modalModo.set('editar');
    this.usuarioForm.enable({ emitEvent: false });
    this.usuarioForm.setValue({
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      funcao: usuario.funcao,
      perfil: usuario.perfil,
      statusUsuario: usuario.statusUsuario,
      senha: usuario.senha,
    });
    this.modalAberto.set(true);
  }

  habilitarEdicao(): void {
    const selecionado = this.usuarioAtual();
    if (!selecionado) {
      return;
    }
    this.modalModo.set('editar');
    this.usuarioForm.enable({ emitEvent: false });
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.usuarioAtual.set(null);
  }

  async salvarUsuario(): Promise<void> {
    const modo = this.modalModo();
    if (modo === 'visualizar') {
      this.fecharModal();
      return;
    }

    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.usuarioForm.getRawValue() as UsuarioFormValue;
    const atual = this.usuarioAtual();
    const payload = this.construirPayload(formValue, atual);

    if (modo === 'novo') {
      this.carregando.set(true);
      try {
        await firstValueFrom(this.usuarioApi.create(payload));
        this.notificacao.sucesso('Usuário criado com sucesso.');
        await this.carregarUsuarios();
        this.modalAberto.set(false);
        this.usuarioAtual.set(null);
      } catch (error) {
        console.error(error);
        this.notificacao.erro('Não foi possível salvar o usuário.');
      } finally {
        this.carregando.set(false);
      }
      return;
    }

    if (!atual?.id) {
      this.notificacao.erro('Não foi possível identificar o usuário selecionado.');
      return;
    }

    if (!this.possuiPerfilAdministrador()) {
      this.notificacao.erro('Esta operação requer um usuário com perfil Administrador. Faça login novamente com as credenciais adequadas.');
      return;
    }

    this.carregando.set(true);
    try {
      await firstValueFrom(this.usuarioApi.update(atual.id, payload));
      this.notificacao.sucesso('Dados do usuário atualizados.');
      await this.carregarUsuarios();
      this.modalAberto.set(false);
      this.usuarioAtual.set(null);
    } catch (error) {
      this.tratarErroPermissao(error, 'Não foi possível salvar o usuário.');
    } finally {
      this.carregando.set(false);
    }
  }

  exportarLista(): void {
    const dados = this.usuariosFiltrados().map((usuario) => ({
      ...usuario,
      criadoEm: new Date(usuario.criadoEm).toISOString(),
    }));
    if (dados.length === 0) {
      this.notificacao.mostrar('Nenhum usuário para exportar com os filtros atuais.', 'info');
      return;
    }
    this.exportSvc.export('csv', dados, CAMPOS_EXPORT, 'usuarios-sistema');
    this.notificacao.sucesso('Exportação CSV iniciada.');
  }

  exportarCartao(usuario: Usuario): void {
    this.exportSvc.export('json', [usuario], CAMPOS_EXPORT, `usuario-${usuario.id.toLowerCase()}`);
    this.notificacao.sucesso('Cartão do usuário exportado em JSON.');
  }

  async alterarPrivilegios(usuario: Usuario): Promise<void> {
    const novoPerfil: PerfilUsuarioLabel = usuario.perfil === 'Administrador' ? 'Operador' : 'Administrador';
    const formValue: UsuarioFormValue = {
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      funcao: usuario.funcao,
      perfil: novoPerfil,
      statusUsuario: usuario.statusUsuario,
      senha: SENHA_PLACEHOLDER,
    };

    const payload = this.construirPayload(formValue, usuario);

    if (!this.possuiPerfilAdministrador()) {
      this.notificacao.erro('Esta operação requer um usuário com perfil Administrador. Faça login novamente com as credenciais adequadas.');
      return;
    }

    this.carregando.set(true);
    try {
      await firstValueFrom(this.usuarioApi.update(usuario.id, payload));
      this.notificacao.sucesso(`Usuário agora é ${novoPerfil.toLowerCase()}.`);
      await this.carregarUsuarios();
    } catch (error) {
      this.tratarErroPermissao(error, 'Não foi possível alterar os privilégios do usuário.');
    } finally {
      this.carregando.set(false);
    }
  }

  private async excluirUsuario(usuario: Usuario): Promise<void> {
    const confirmar = window.confirm(`Excluir o usuário "${usuario.nome}"? Esta ação não poderá ser desfeita.`);
    if (!confirmar) {
      return;
    }

    if (!this.possuiPerfilAdministrador()) {
      this.notificacao.erro('Esta operação requer um usuário com perfil Administrador. Faça login novamente com as credenciais adequadas.');
      return;
    }

    this.carregando.set(true);
    try {
      await firstValueFrom(this.usuarioApi.remove(usuario.id));
      this.notificacao.sucesso('Usuário removido com sucesso.');
      await this.carregarUsuarios();
    } catch (error) {
      this.tratarErroPermissao(error, 'Não foi possível excluir o usuário.');
    } finally {
      this.carregando.set(false);
    }
  }

  statusClasse(status: StatusUsuarioLabel): string {
    return `usuarios-status usuarios-status--${status.toLowerCase()}`;
  }

  formatarData(valor: string): string {
    return new Date(valor).toLocaleDateString('pt-BR');
  }

  percentual(parte: number): string {
    const total = this.totalRegistros();
    if (total === 0) {
      return '0%';
    }
    return formatadorPorcentagem.format(parte / total);
  }

  private obterHeaderActions(filtrosVisiveis: boolean, temDados: boolean): HeaderAction[] {
    return [
      {
        id: 'toggle-filtros',
        label: filtrosVisiveis ? 'Fechar filtros' : 'Filtros',
        icon: 'fas fa-filter',
        variant: 'secundario',
        execute: () => this.toggleMostrarFiltros(),
      },
      {
        id: 'exportar',
        label: 'Exportar',
        icon: 'fas fa-file-export',
        variant: 'fantasma',
        className: 'as-outline-button',
        disabled: () => !temDados,
        execute: () => this.exportarLista(),
      },
      {
        id: 'novo-usuario',
        label: 'Novo usuário',
        icon: 'fas fa-user-plus',
        variant: 'primario',
        execute: () => this.abrirNovoUsuario(),
      },
    ];
  }

  private ordenar(dados: Usuario[]): Usuario[] {
    const { coluna, direcao } = this.ordenacao();
    const fator = direcao === 'asc' ? 1 : -1;
    return dados.sort((a, b) => {
      const valorA = this.valorOrdenacao(a, coluna);
      const valorB = this.valorOrdenacao(b, coluna);
      if (valorA === valorB) {
        return 0;
      }
      return valorA > valorB ? fator : -fator;
    });
  }

  private valorOrdenacao(usuario: Usuario, coluna: ColunaOrdenacao): string | number {
    switch (coluna) {
      case 'criadoEm':
        return new Date(usuario[coluna]).getTime();
      default:
        return (usuario as any)[coluna]?.toString().toLowerCase();
    }
  }

  formatarNumero(valor: number): string {
    return formatadorNumero.format(valor);
  }

  private possuiPerfilAdministrador(): boolean {
    const payload = this.tokenService.getPayload();
    if (!payload) {
      return false;
    }

    const roles = new Set<string>();
    const coletar = (valor: unknown) => {
      if (typeof valor === 'string') {
        roles.add(valor.toUpperCase());
      } else if (Array.isArray(valor)) {
        valor.forEach((item) => {
          if (typeof item === 'string') {
            roles.add(item.toUpperCase());
          }
        });
      }
    };

    coletar(payload['authority']);
    coletar(payload['scope']);
    coletar(payload['perfil']);

    return ['ADMINISTRADOR', 'ADMIN', 'MASTER'].some((regra) => roles.has(regra));
  }

  private tratarErroPermissao(error: unknown, mensagemPadrao: string): void {
    console.error(error);
    if (error instanceof HttpErrorResponse && error.status === 403) {
      this.notificacao.erro('Seu usuário não tem permissão para executar esta operação.');
      return;
    }
    this.notificacao.erro(mensagemPadrao);
  }

  private normalizarSenha(valor: string, atual: Usuario | null): string {
    const senha = (valor ?? '').trim();
    if (!atual) {
      return senha;
    }
    if (!senha || senha === SENHA_PLACEHOLDER || senha.length > 15) {
      return SENHA_SENTINELA;
    }
    return senha;
  }
}
