import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, firstValueFrom } from 'rxjs';
import { EmpresaApi } from '../../../api/empresa.api';
import { EmpresaDTO, ServicoDTO, UsuarioDTO } from '../../../api/models';
import { ServicoApi } from '../../../api/servico.api';
import { UsuarioApi } from '../../../api/usuario.api';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { TokenService } from '../../../core/oauth2/token.service';
import { HeaderAction, HeaderService } from '../../../layout/header.service';
import { mapServicoDtoToRelatorio } from '../../../shared/data/servico-mapper';
import {
    STATUS_CLASSES,
    STATUS_SERVICO_OPCOES,
    ServicoRelatorio,
    TIPOS_IMPOSTO_OPCOES,
    TIPOS_PAGAMENTO_OPCOES,
    formatarEnum,
} from '../../../shared/data/servicos.model';

/**
 * Contrato intermediário usado para preencher o Reactive Form do detalhe de serviço.
 * Agrupa campos do `ServicoRelatorio` e formatações (string vs. number) para facilitar o mapeamento.
 *
 * Ao adicionar novos campos no backend:
 * 1. Amplie `ServicoRelatorio`/`ServicoDTO`.
 * 2. Inclua aqui a representação adequada (string/number/null).
 * 3. Atualize `popularFormulario` e `montarPayload` para ida e volta do dado.
 */
interface ServicoFormulario {
  id: string;
  idEmpresa: string;
  data: string;
  dataVencimento: string | null;
  notaFiscal: string | null;
  numeroCertificado: string | null;
  ordemServico: string | null;
  cliente: string | null;
  clienteCertificado: string | null;
  quantidadePecas: number | null;
  descricaoPeca: string | null;
  diametroPeca: number | null;
  larguraPeca: number | null;
  larguraTotalPeca: number | null;
  pesoPeca: number | null;
  rpmPeca: number | null;
  giroQuadratico: string | null;
  valorTotal: number;
  valorImposto: number;
  valorLiquido: number;
  observacao: string | null;
  observacaoInterna: string | null;
  planoUmPermitido: number | null;
  planoUmEncontrado: number | null;
  raioPlanoUm: number | null;
  remanescentePlanoUm: number | null;
  planoDoisPermitido: number | null;
  planoDoisEncontrado: number | null;
  raioPlanoDois: number | null;
  remanescentePlanoDois: number | null;
  status: ServicoRelatorio['status'];
  tipoPagamento: ServicoRelatorio['tipoPagamento'];
  tipoImposto: ServicoRelatorio['imposto'];
  empresaNome: string;
  empresaCnpj: string;
  usuarioResponsavel: any;
  idUsuario: string;
  vendedor: string | null;
  comissaoPercentual: number;
  orcamentoReferencia: string | null;
  assinaturaResponsavel: string | null;
}

type UsuarioOption = { id: string; nome: string };

function gerarIdTemporario(): string {
  const agora = new Date();
  return `srv-${agora.getFullYear()}${(agora.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${agora.getDate().toString().padStart(2, '0')}-${agora
      .getTime()
      .toString(36)}`;
}

/**
 * Tela de criação/edição de serviços.
 *
 * Principais responsabilidades:
 * - Resgatar empresas/usuários para popular selects.
 * - Controlar modo leitura x edição, inclusive rascunhos/copiar serviço.
 * - Mapear formulário -> `ServicoDTO` respeitando validações de backend.
 * - Invocar `ServicoApi.create/update` e exibir notificações.
 *
 * Pontos de extensão comuns:
 * - `resolverEstado`: alterar lógica de pré-carregamento ou suportar novos query params.
 * - `montarPayload`: incluir anexos/campos customizados antes do POST/PUT.
 * - `headerEffect`: adicionar ações globais (ex.: exportar PDF).
 */
@Component({
  selector: 'as-servico-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BotaoComponent, CentralNotificacoesComponent],
  templateUrl: './servico-detalhe.component.html',
  styleUrls: ['./servico-detalhe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicoDetalheComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly header = inject(HeaderService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicoApi = inject(ServicoApi);
  private readonly empresaApi = inject(EmpresaApi);
  private readonly usuarioApi = inject(UsuarioApi);
  private readonly tokenService = inject(TokenService);

  readonly modoEdicao = signal(false);
  readonly isNovo = signal(false);
  readonly servicoAtual = signal<ServicoRelatorio | null>(null);
  readonly carregando = signal(false);
  readonly carregandoEmpresas = signal(false);
  readonly carregandoUsuarios = signal(false);

  private readonly empresasInternas = signal<EmpresaDTO[]>([]);
  private readonly usuariosInternos = signal<UsuarioOption[]>([]);

  readonly empresas = computed(() => this.empresasInternas());
  readonly usuarios = computed(() => this.usuariosInternos());

  readonly statusOptions = STATUS_SERVICO_OPCOES;
  readonly pagamentoOptions = TIPOS_PAGAMENTO_OPCOES;
  readonly impostoOptions = TIPOS_IMPOSTO_OPCOES;
  readonly formatarEnum = formatarEnum;

  public dadosUsuarioLogado: any = this.tokenService.getPayload(localStorage.getItem('access_token'));


  readonly comissaoCalculada = computed(() => {
    const raw = this.form.getRawValue();
    const valorTotal = Number(raw.valorTotal ?? 0);
    const percentual = Number(raw.comissaoPercentual ?? 0);
    return Number(((valorTotal * percentual) / 100).toFixed(2));
  });

  readonly form = this.fb.group({
    id: [{ value: '', disabled: true }],
    idEmpresa: ['', Validators.required],
    data: ['', Validators.required],
    dataVencimento: [''],
    notaFiscal: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), Validators.pattern(/\S+/)]],
    numeroCertificado: [''],
    ordemServico: [''],
    cliente: [''],
    clienteCertificado: [''],
    quantidadePecas: [null, [Validators.min(0), Validators.max(99999)]],
    descricaoPeca: [''],
    diametroPeca: [null, Validators.min(0)],
    larguraPeca: [null, Validators.min(0)],
    larguraTotalPeca: [null, Validators.min(0)],
    pesoPeca: [null, Validators.min(0)],
    rpmPeca: [null, [Validators.min(0), Validators.max(9999999999)]],
    giroQuadratico: [''],
    valorTotal: [0, [Validators.required, Validators.min(0), Validators.max(99999999.99)]],
    valorImposto: [0, [Validators.min(0), Validators.max(99999999.99)]],
    valorLiquido: [{ value: 0, disabled: true }],
    observacao: [''],
    observacaoInterna: [''],
    planoUmPermitido: [null, Validators.min(0)],
    planoUmEncontrado: [null, Validators.min(0)],
    raioPlanoUm: [null, Validators.min(0)],
    remanescentePlanoUm: [null, Validators.min(0)],
    planoDoisPermitido: [null, Validators.min(0)],
    planoDoisEncontrado: [null, Validators.min(0)],
    raioPlanoDois: [null, Validators.min(0)],
    remanescentePlanoDois: [null, Validators.min(0)],
    status: ['', Validators.required],
    tipoPagamento: ['', Validators.required],
    tipoImposto: [''],
    empresaNome: [{ value: '', disabled: true }],
    empresaCnpj: [{ value: '', disabled: true }],
    usuarioResponsavel: [{ value: this.dadosUsuarioLogado?.nome, disabled: true }],
    idUsuario: [this.dadosUsuarioLogado?.id],
    vendedor: [''],
    comissaoPercentual: [3.5, [Validators.min(0), Validators.max(100)]],
    orcamentoReferencia: [''],
    assinaturaResponsavel: [''],
  });

  private readonly controlesFixos = ['id', 'empresaNome', 'empresaCnpj', 'usuarioResponsavel', 'valorLiquido'];

  private headerEffect = effect(() => {
    const servico = this.servicoAtual();
    if (!servico) {
      return;
    }

    const editando = this.modoEdicao();
    const novo = this.isNovo();
    const tituloBase = novo ? 'Novo serviço' : `Serviço ${servico.id}`;

    const acoes: HeaderAction[] = [
      {
        id: 'voltar-servicos',
        label: 'Voltar',
        icon: 'ph ph-arrow-left',
        variant: 'fantasma',
        execute: () => this.voltar(),
      },
    ];

    if (editando) {
      acoes.push({
        id: 'descartar-servico',
        label: novo ? 'Descartar rascunho' : 'Descartar alterações',
        icon: 'ph ph-arrow-counter-clockwise',
        variant: 'secundario',
        execute: () => this.cancelarEdicao(),
      });
    } else {
      if (!novo) {
        acoes.push({
          id: 'duplicar-servico',
          label: 'Duplicar',
          icon: 'ph ph-copy',
          variant: 'secundario',
          execute: () => this.duplicar(),
        });
      }

      acoes.push({
        id: 'editar-servico',
        label: 'Editar',
        icon: 'ph ph-pencil-simple-line',
        variant: 'primario',
        execute: () => this.habilitarEdicao(),
      });
    }

    if (!novo) {
      acoes.push({
        id: 'excluir-servico',
        label: 'Excluir',
        icon: 'ph ph-trash',
        variant: 'fantasma',
        execute: () => this.excluirServico(),
      });
    }

    this.header.setHeader(tituloBase, acoes);
  });

  constructor() {
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      this.route.url,
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, queryParams, segments]) => {
        const paths = segments.map((segment) => segment.path);
        const ehNovo = paths.includes('novo');
        const forcarEdicao = ehNovo || paths.includes('editar') || queryParams.get('editar') === 'true';
        const id = params.get('id');

        void this.resolverEstado({ ehNovo, id, forcarEdicao });
      });

    this.sincronizarDerivados();
    this.sincronizarReferenciasSelecionadas();
  }

  /**
   * Define se o componente opera em modo "novo", "edição" ou "visualização".
   * Responsável por carregar empresas/usuários antes de qualquer ação e, em seguida,
   * decidir entre criar um rascunho ou buscar o serviço existente via API.
   *
   * Caso precise suportar outros modos (ex.: duplicação via query param), ajuste esta função.
   */
  private async resolverEstado(config: { ehNovo: boolean; id: string | null; forcarEdicao: boolean }): Promise<void> {
    this.carregando.set(true);
    try {
      await Promise.all([this.carregarEmpresas(), this.carregarUsuarios()]);

      if (!this.validarDependencias(config.ehNovo)) {
        return;
      }

      if (config.ehNovo) {
        const rascunho = this.criarServicoRascunho();
        this.isNovo.set(true);
        this.servicoAtual.set(rascunho);
        this.popularFormulario(rascunho);
        this.atualizarModoEdicao(true);
        return;
      }

      if (!config.id) {
        throw new Error('missing-id');
      }

      await this.carregarServicoAtual(config.id, config.forcarEdicao);
      this.isNovo.set(false);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Serviço não encontrado.');
      this.router.navigate(['/ordens']);
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Garante que existem empresas/usuários antes de liberar o fluxo de criação.
   * Customize mensagens ou redirecionamentos conforme regras de negócio.
   */
  private validarDependencias(necessarioParaNovo: boolean): boolean {
    if (!necessarioParaNovo) {
      return true;
    }

    if (this.empresasInternas().length === 0) {
      this.notificacao.erro('Cadastre ao menos uma empresa antes de registrar serviços.');
      void this.router.navigate(['/ordens']);
      return false;
    }

    if (this.usuariosInternos().length === 0) {
      this.notificacao.erro('Cadastre ao menos um usuário responsável antes de registrar serviços.');
      void this.router.navigate(['/ordens']);
      return false;
    }

    return true;
  }

  /**
   * Busca empresas para alimentar o select do formulário.
   * Ajuste os parâmetros de filtro (`list({ pagina, quantidade, razaoSocial })`) quando
   * houver necessidade de paginação ou busca incremental.
   */
  private async carregarEmpresas(): Promise<void> {
    if (this.carregandoEmpresas()) {
      return;
    }
    this.carregandoEmpresas.set(true);
    try {
      const pagina = await firstValueFrom(this.empresaApi.list({ pagina: 0, quantidade: 200 }));
      const empresas = (pagina.content ?? [])
        .filter((empresa): empresa is EmpresaDTO & { id: string } => !!empresa.id);
      this.empresasInternas.set(empresas);
      this.atualizarDadosEmpresa(this.form.get('idEmpresa')?.value ?? null);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível carregar as empresas.');
      this.empresasInternas.set([]);
    } finally {
      this.carregandoEmpresas.set(false);
    }
  }

  /**
   * Recupera usuários responsáveis a partir do backend.
   * Siga o mesmo padrão caso precise disponibilizar outros atores (ex.: aprovadores).
   */
  private async carregarUsuarios(): Promise<void> {
    if (this.carregandoUsuarios()) {
      return;
    }
    this.carregandoUsuarios.set(true);
    try {
      const pagina = await firstValueFrom(this.usuarioApi.list({ pagina: 0, quantidade: 200 }));
      const usuarios = (pagina.content ?? [])
        .filter((usuario): usuario is UsuarioDTO & { id: string } => !!usuario.id)
        .map((usuario) => ({ id: usuario.id!, nome: usuario.nome } satisfies UsuarioOption));
      this.usuariosInternos.set(usuarios);
      this.atualizarDadosUsuario(this.form.get('idUsuario')?.value ?? null);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível carregar os usuários.');
      this.usuariosInternos.set([]);
    } finally {
      this.carregandoUsuarios.set(false);
    }
  }

  /**
   * Busca um serviço isolado e resolve suas referências (empresa/usuário) em paralelo.
   * Utilize este helper sempre que precisar garantir que o formulário tenha os dados completos
   * antes de entrar em modo edição.
   */
  private async carregarServicoPorId(id: string): Promise<ServicoRelatorio> {
    const dto = await firstValueFrom(this.servicoApi.get(id));

    const resultados = await Promise.allSettled([
      dto.idEmpresa ? firstValueFrom(this.empresaApi.get(dto.idEmpresa)) : Promise.resolve(null),
      dto.idUsuario ? firstValueFrom(this.usuarioApi.get(dto.idUsuario)) : Promise.resolve(null),
    ]);

    const empresa = resultados[0].status === 'fulfilled' ? resultados[0].value as EmpresaDTO | null : null;
    const usuario = resultados[1].status === 'fulfilled' ? resultados[1].value as UsuarioDTO | null : null;

    if (empresa && !this.empresasInternas().some((item) => item.id === empresa.id)) {
      this.empresasInternas.update((lista) => [...lista, empresa]);
    }

    if (usuario && !this.usuariosInternos().some((item) => item.id === usuario.id)) {
      this.usuariosInternos.update((lista) => [...lista, { id: usuario.id!, nome: usuario.nome } satisfies UsuarioOption]);
    }

    return mapServicoDtoToRelatorio(dto, { empresa: empresa ?? undefined, usuario: usuario ?? undefined });
  }

  /**
   * Atualiza o estado `servicoAtual`, popula o formulário e opcionalmente já habilita edição.
   */
  private async carregarServicoAtual(id: string, forcarEdicao: boolean): Promise<void> {
    const servico = await this.carregarServicoPorId(id);
    this.servicoAtual.set(servico);
    this.popularFormulario(servico);
    this.atualizarModoEdicao(forcarEdicao);
  }

  private criarServicoRascunho(): ServicoRelatorio {
    const hoje = new Date().toISOString().slice(0, 10);
    const empresa = this.empresasInternas().at(0);
    const usuario = this.usuariosInternos().at(0);

    return {
      id: gerarIdTemporario(),
      data: hoje,
      notaFiscal: null,
      valorTotal: 0,
      imposto: null,
      valorImposto: 0,
      valorLiquido: 0,
      tipoPagamento: 'PIX',
      status: 'ORCAMENTO',
      dataVencimento: hoje,
      empresa: {
        id: empresa?.id ?? 'empresa-indefinida',
        nome: empresa?.razaoSocial ?? 'Selecione uma empresa',
        cnpj: empresa?.cnpj ?? '—',
      },
      clienteCertificado: null,
      quantidadePecas: null,
      descricaoPeca: null,
      diametroPeca: null,
      larguraPeca: null,
      larguraTotalPeca: null,
      pesoPeca: null,
      rpmPeca: null,
      observacao: null,
      observacaoInterna: null,
      planoUmPermitido: null,
      planoDoisPermitido: null,
      planoUmEncontrado: null,
      planoDoisEncontrado: null,
      raioPlanoUm: null,
      raioPlanoDois: null,
      remanescentePlanoUm: null,
      remanescentePlanoDois: null,
      usuario: {
        id: usuario?.id ?? 'usuario-indefinido',
        nome: usuario?.nome ?? 'Selecione o responsável',
      },
      dataCriacao: `${hoje}T08:00:00`,
      dataAtualizacao: `${hoje}T08:00:00`,
      numeroCertificado: null,
      ordemServico: null,
      giroQuadratico: null,
      vendedor: null,
      comissaoPercentual: 0,
      orcamentoReferencia: null,
      assinaturaResponsavel: null,
    } satisfies ServicoRelatorio;
  }

  private atualizarDadosEmpresa(empresaId: string | null | undefined): void {
    const empresa = empresaId ? this.empresasInternas().find((item) => item.id === empresaId) ?? null : null;
    const nome = empresa?.razaoSocial ?? '';
    const cnpj = empresa?.cnpj ?? '';
    this.form.patchValue(
      {
        cliente: nome,
        empresaNome: nome,
        empresaCnpj: cnpj,
      },
      { emitEvent: false }
    );
  }

  private atualizarDadosUsuario(usuarioId: string | null | undefined): void {
    const usuario = usuarioId ? this.usuariosInternos().find((item) => item.id === usuarioId) ?? null : null;
    this.form.patchValue({ usuarioResponsavel: usuario?.nome ?? '' }, { emitEvent: false });
  }

  private sincronizarReferenciasSelecionadas(): void {
    this.form
      .get('idEmpresa')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => this.atualizarDadosEmpresa(valor));

    this.form
      .get('idUsuario')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => this.atualizarDadosUsuario(valor));
  }

  private criarServicoVazio(): ServicoRelatorio {
    const hoje = new Date().toISOString().slice(0, 10);
    return {
      id: gerarIdTemporario(),
      data: hoje,
      notaFiscal: null,
      valorTotal: 0,
      imposto: null,
      valorImposto: 0,
      valorLiquido: 0,
      tipoPagamento: 'PIX',
      status: 'ORCAMENTO',
      dataVencimento: hoje,
      empresa: { id: 'empresa-marco', nome: 'All Service Industrial', cnpj: '04.321.876/0001-68' },
      clienteCertificado: null,
      quantidadePecas: null,
      descricaoPeca: null,
      diametroPeca: null,
      larguraPeca: null,
      larguraTotalPeca: null,
      pesoPeca: null,
      rpmPeca: null,
      observacao: null,
      observacaoInterna: null,
      planoUmPermitido: null,
      planoDoisPermitido: null,
      planoUmEncontrado: null,
      planoDoisEncontrado: null,
      raioPlanoUm: null,
      raioPlanoDois: null,
      remanescentePlanoUm: null,
      remanescentePlanoDois: null,
      usuario: { id: 'usr-ana', nome: 'Ana Ribeiro' },
      dataCriacao: `${hoje}T08:00:00`,
      dataAtualizacao: `${hoje}T08:00:00`,
      numeroCertificado: null,
      ordemServico: null,
      giroQuadratico: null,
      vendedor: 'Marina Lopes',
      comissaoPercentual: 3.5,
      orcamentoReferencia: null,
      assinaturaResponsavel: 'M. Lopes',
    };
  }

  /**
   * Converte o `ServicoRelatorio` carregado para valores compatíveis com o Reactive Form.
   * Use este ponto para aplicar máscaras/formatações (ex.: transformar BigDecimal -> number).
   */
  private popularFormulario(servico: ServicoRelatorio): void {
    const statusValido = this.statusOptions.includes(servico.status as any)
      ? servico.status
      : this.statusOptions[0];

    const pagamentoValido = this.pagamentoOptions.includes(servico.tipoPagamento as any)
      ? servico.tipoPagamento
      : this.pagamentoOptions[0];

    const impostoValido = servico.imposto && this.impostoOptions.includes(servico.imposto as any)
      ? servico.imposto
      : null;

    const valores: ServicoFormulario = {
      id: '',
      idEmpresa: servico.empresa.id,
      data: servico.data,
      dataVencimento: servico.dataVencimento,
      notaFiscal: servico.notaFiscal,
      numeroCertificado: servico.numeroCertificado,
      ordemServico: servico.ordemServico,
      cliente: servico.empresa?.nome ?? null,
      clienteCertificado: servico.clienteCertificado,
      quantidadePecas: servico.quantidadePecas,
      descricaoPeca: servico.descricaoPeca,
      diametroPeca: servico.diametroPeca,
      larguraPeca: servico.larguraPeca,
      larguraTotalPeca: servico.larguraTotalPeca,
      pesoPeca: servico.pesoPeca,
      rpmPeca: servico.rpmPeca,
      giroQuadratico: servico.giroQuadratico,
      valorTotal: servico.valorTotal,
      valorImposto: servico.valorImposto,
      valorLiquido: servico.valorLiquido,
      observacao: servico.observacao,
      observacaoInterna: servico.observacaoInterna,
      planoUmPermitido: servico.planoUmPermitido,
      planoUmEncontrado: servico.planoUmEncontrado,
      raioPlanoUm: servico.raioPlanoUm,
      remanescentePlanoUm: servico.remanescentePlanoUm,
      planoDoisPermitido: servico.planoDoisPermitido,
      planoDoisEncontrado: servico.planoDoisEncontrado,
      raioPlanoDois: servico.raioPlanoDois,
      remanescentePlanoDois: servico.remanescentePlanoDois,
      status: statusValido,
      tipoPagamento: pagamentoValido,
      tipoImposto: impostoValido,
      empresaNome: servico.empresa.nome,
      empresaCnpj: servico.empresa.cnpj,
      usuarioResponsavel: this.dadosUsuarioLogado.nome,
      idUsuario: this.dadosUsuarioLogado.id,
      vendedor: servico.vendedor,
      comissaoPercentual: servico.comissaoPercentual,
      orcamentoReferencia: servico.orcamentoReferencia,
      assinaturaResponsavel: servico.assinaturaResponsavel,
    };

    this.form.reset(valores as any, { emitEvent: false });
    this.atualizarDadosEmpresa(valores.idEmpresa);
    this.atualizarDadosUsuario(valores.idUsuario);
  }

  /**
   * Centraliza a lógica de habilitar/desabilitar campos ao alternar entre leitura e edição.
   * Se adicionar novos campos "somente leitura", inclua-os em `controlesFixos`.
   */
  private atualizarModoEdicao(editavel: boolean): void {
    this.modoEdicao.set(editavel);
    if (editavel) {
      Object.entries(this.form.controls).forEach(([chave, controle]) => {
        if (!this.controlesFixos.includes(chave)) {
          controle.enable({ emitEvent: false });
        }
      });
    } else {
      this.form.disable({ emitEvent: false });
      this.controlesFixos.forEach((chave) => {
        const controle = this.form.get(chave);
        if (controle && !controle.disabled) {
          controle.disable({ emitEvent: false });
        }
      });
    }
  }

  private sincronizarDerivados(): void {
    this.form
      .get('valorTotal')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.atualizarValorLiquido());

    this.form
      .get('valorImposto')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.atualizarValorLiquido());
  }

  private atualizarValorLiquido(): void {
    const total = Number(this.form.get('valorTotal')?.value ?? 0);
    const imposto = Number(this.form.get('valorImposto')?.value ?? 0);
    const liquido = Number((total - imposto).toFixed(2));
    const controle = this.form.get('valorLiquido');
    if (controle && controle.value !== liquido) {
      controle.setValue(liquido, { emitEvent: false });
    }
  }

  /**
   * Responsável por transformar o formulário em `ServicoDTO`, aplicando normalizações
   * (enums válidos, números positivos, trim de strings). Qualquer novo campo enviado ao backend
   * deve ser calculado aqui.
   */
  private montarPayload(): ServicoDTO {
    const raw = this.form.getRawValue();
    const toNumber = (valor: unknown) =>
      valor === null || valor === undefined || valor === '' ? undefined : Number(valor);

    const statusPadrao = this.statusOptions[0] as ServicoDTO['status'];
    const pagamentoPadrao = this.pagamentoOptions[0] as ServicoDTO['tipoPagamento'];

    const status = this.statusOptions.includes(raw.status as any)
      ? (raw.status as ServicoDTO['status'])
      : statusPadrao;

    const tipoPagamento = this.pagamentoOptions.includes(raw.tipoPagamento as any)
      ? (raw.tipoPagamento as ServicoDTO['tipoPagamento'])
      : pagamentoPadrao;

    const tipoImposto = raw.tipoImposto && this.impostoOptions.includes(raw.tipoImposto as any)
      ? (raw.tipoImposto as ServicoDTO['imposto'])
      : undefined;

    const valorTotal = toNumber(raw.valorTotal) ?? 0;
    const valorImposto = toNumber(raw.valorImposto) ?? 0;
    const valorLiquido = toNumber(raw.valorLiquido) ?? Number((valorTotal - valorImposto).toFixed(2));
    const notaFiscal = (raw.notaFiscal ?? '').trim();

    return {
      data: raw.data ?? '',
      dataVencimento: raw.dataVencimento || undefined,
      notaFiscal,
      valorTotal,
      imposto: tipoImposto,
      valorImposto,
      valorLiquido,
      tipoPagamento,
      status,
      clienteCertificado: raw.clienteCertificado || undefined,
      quantidadePecas: toNumber(raw.quantidadePecas),
      descricaoPeca: raw.descricaoPeca || undefined,
      diametroPeca: toNumber(raw.diametroPeca),
      larguraPeca: toNumber(raw.larguraPeca),
      larguraTotalPeca: toNumber(raw.larguraTotalPeca),
      pesoPeca: toNumber(raw.pesoPeca),
      rpmPeca: toNumber(raw.rpmPeca),
      observacao: raw.observacao || undefined,
      observacaoInterna: raw.observacaoInterna || undefined,
      planoUmPermitido: toNumber(raw.planoUmPermitido),
      planoUmEncontrado: toNumber(raw.planoUmEncontrado),
      raioPlanoUm: toNumber(raw.raioPlanoUm),
      remanescentePlanoUm: toNumber(raw.remanescentePlanoUm),
      planoDoisPermitido: toNumber(raw.planoDoisPermitido),
      planoDoisEncontrado: toNumber(raw.planoDoisEncontrado),
      raioPlanoDois: toNumber(raw.raioPlanoDois),
      remanescentePlanoDois: toNumber(raw.remanescentePlanoDois),
      idEmpresa: raw.idEmpresa!,
      idUsuario: raw.idUsuario!,
    } satisfies ServicoDTO;
  }

  habilitarEdicao(): void {
    this.atualizarModoEdicao(true);
    this.notificacao.mostrar('Edição liberada. Faça as alterações e salve para confirmar.', 'info');
    const servico = this.servicoAtual();
    if (!this.isNovo() && servico) {
      this.router.navigate(['/servicos', servico.id, 'editar'], { replaceUrl: true });
    }
  }

  cancelarEdicao(): void {
    const servico = this.servicoAtual();
    if (!servico) {
      return;
    }
    if (this.isNovo()) {
      this.notificacao.mostrar('Cadastro cancelado.', 'info');
      this.voltar();
      return;
    }

    this.popularFormulario(servico);
    this.atualizarModoEdicao(false);
    this.notificacao.mostrar('Alterações descartadas.', 'info');
    this.router.navigate(['/servicos', servico.id], { replaceUrl: true });
  }

  /**
   * Fluxo de persistência compartilhado pelos botões "Salvar" (novo e edição).
   * Mostra toasts, controla estado de carregamento e decide entre POST/PUT.
   */
  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacao.erro('Revise os campos obrigatórios antes de salvar.');
      return;
    }

    const payload = this.montarPayload();
    this.carregando.set(true);

    try {
      if (this.isNovo()) {
        const id = await firstValueFrom(this.servicoApi.create(payload));
        this.notificacao.sucesso('Serviço cadastrado com sucesso!');
        this.isNovo.set(false);
        await this.carregarServicoAtual(id, false);
        await this.router.navigate(['/servicos', id], { replaceUrl: true });
      } else {
        const atual = this.servicoAtual();
        if (!atual?.id) {
          throw new Error('missing-id');
        }
        payload.id = atual.id;
        await firstValueFrom(this.servicoApi.update(atual.id, payload));
        this.notificacao.sucesso('Serviço atualizado com sucesso!');
        await this.carregarServicoAtual(atual.id, false);
      }
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível salvar o serviço.');
    } finally {
      this.carregando.set(false);
    }
  }

  async excluirServico(): Promise<void> {
    const servico = this.servicoAtual();
    if (!servico?.id) {
      return;
    }

    const confirmar = window.confirm(`Excluir o serviço ${servico.ordemServico ?? servico.id}? Esta ação não poderá ser desfeita.`);
    if (!confirmar) {
      return;
    }

    this.carregando.set(true);
    try {
      await firstValueFrom(this.servicoApi.remove(servico.id));
      this.notificacao.sucesso('Serviço removido com sucesso.');
      await this.router.navigate(['/servicos']);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível excluir o serviço.');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Cria um rascunho com base no serviço atual, gerando novo ID temporário e limpando campos sensíveis.
   * Ajuste aqui se quiser copiar anexos ou manter determinados campos.
   */
  duplicar(): void {
    const servico = this.servicoAtual();
    if (!servico) {
      return;
    }

    const agora = new Date().toISOString();
    const duplicado: ServicoRelatorio = {
      ...servico,
      id: gerarIdTemporario(),
      ordemServico: servico.ordemServico ? `${servico.ordemServico}-C` : null,
      notaFiscal: null,
      numeroCertificado: null,
      status: 'ORCAMENTO',
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    this.isNovo.set(true);
    this.servicoAtual.set(duplicado);
    this.popularFormulario(duplicado);
    this.atualizarModoEdicao(true);
    this.notificacao.mostrar('Criamos uma cópia. Ajuste os campos e salve para confirmar.', 'info');
  }

  voltar(): void {
    this.router.navigate(['/ordens']);
  }

  statusClasse(status: ServicoRelatorio['status'] | string | null | undefined): string {
    if (!status) {
      return 'status neutro';
    }
    return STATUS_CLASSES[status as ServicoRelatorio['status']] ?? 'status neutro';
  }

  ngOnDestroy(): void {
    this.header.reset();
  }
}
