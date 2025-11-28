import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ContatoApi } from '../../../api/contato.api';
import { EmpresaApi } from '../../../api/empresa.api';
import { ContatoDTO, EmpresaDTO, UsuarioDTO } from '../../../api/models';
import { UsuarioApi } from '../../../api/usuario.api';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { CentralNotificacoesComponent } from '../../../componentes/ui/notificacao/central-notificacoes.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { TokenService } from '../../../core/oauth2/token.service';
import { EmpresaRelacionamentosService } from '../../../service/empresa-relacionamentos.service';
import { Cliente, Contato } from './clientes-insight.config';

type ModalModo = 'novo' | 'visualizar' | 'editar';
type UsuarioOption = { id: string; nome: string };

@Component({
  selector: 'app-cliente-detalhe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BotaoComponent, CentralNotificacoesComponent],
  templateUrl: './cliente-detalhe.component.html',
  styleUrls: ['./cliente-detalhe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteDetalheComponent {
  private readonly empresaApi = inject(EmpresaApi);
  private readonly contatoApi = inject(ContatoApi);
  private readonly usuarioApi = inject(UsuarioApi);
  private readonly notificacao = inject(NotificacaoService);
  private readonly fb = inject(FormBuilder);
  private readonly tokenService = inject(TokenService);
  private readonly relacionamentos = inject(EmpresaRelacionamentosService);

  readonly aberto = input(false);
  readonly clienteId = input<string | null>(null);
  readonly modoInicial = input<ModalModo>('visualizar');

  readonly fechar = output<void>();
  readonly salvo = output<void>();
  readonly excluido = output<void>();

  readonly modoEdicao = signal(false);
  readonly isNovo = signal(false);
  readonly clienteAtual = signal<Cliente | null>(null);
  readonly painelContatosAberto = signal(false);
  readonly mostrarFormularioContato = signal(false);
  readonly carregando = signal(false);
  readonly carregandoContatos = signal(false);
  readonly carregandoUsuarios = signal(false);
  readonly contatoAlertas = signal<{ telefone?: string; email?: string; geral?: string } | null>(null);

  private readonly contatosInternos = signal<Contato[]>([]);
  private readonly usuariosInternos = signal<UsuarioOption[]>([]);

  readonly contatos = computed(() => this.contatosInternos());
  readonly usuarios = computed(() => this.usuariosInternos());

  public dadosUsuarioLogado: any = this.tokenService.getPayload(localStorage.getItem('access_token'));

  readonly categorias: Cliente['categoria'][] = ['Industria', 'Comercio', 'Servico', 'Outro'];
  readonly setores: Contato['setor'][] = [
    'FINANCEIRO',
    'MANUTENCAO',
    'COMERCIAL',
    'VENDAS',
    'COMPRAS',
    'JURIDICO',
    'OPERACIONAL',
    'ADMINISTRACAO',
    'FISCAL',
    'RH',
    'LOGISTICA',
  ];

  readonly form = this.fb.group({
    id: [{ value: '', disabled: true }],
    razaoSocial: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(160)]],
    cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(18)]],
    endereco: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]],
    // Legacy optional fields
    categoria: ['Industria'],
    ativo: [true],
    // usuarioResponsavel: [{ value: this.dadosUsuarioLogado?.nome, disabled: true }],
    idUsuario: [this.dadosUsuarioLogado?.id],
  });

  readonly contatoForm = this.fb.group({
    idUsuario: [this.dadosUsuarioLogado?.id, [Validators.required]],
    responsavel: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    setor: ['COMERCIAL', [Validators.required]],
    telefone: ['', [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(15),
      Validators.pattern(/^\d{11,15}$/),
    ]],
    email: ['', [Validators.required, Validators.email, Validators.minLength(11), Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      if (!this.aberto()) {
        this.resetarFormulario();
        this.painelContatosAberto.set(false);
        this.resetContatoForm();
        return;
      }

      const modo = this.modoInicial();
      const id = this.clienteId();
      void this.inicializarModal(modo, id);
    });

    effect(() => {
      if (!this.aberto()) {
        return;
      }
      if (this.painelContatosAberto() && this.clienteAtual()) {
        void this.carregarContatos(this.clienteAtual()!.id);
      }
    });
  }

  habilitarEdicao(): void {
    if (this.isNovo()) {
      return;
    }
    this.atualizarModoEdicao(true);
  }

  cancelar(): void {
    if (this.isNovo()) {
      this.fecharModal();
      return;
    }
    const cliente = this.clienteAtual();
    if (!cliente) {
      return;
    }
    this.popularFormulario(cliente);
    this.atualizarModoEdicao(false);
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacao.erro('Revise os campos obrigatórios antes de salvar.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: EmpresaDTO = {
      id: this.isNovo() ? undefined : this.clienteAtual()?.id,
      razaoSocial: (raw.razaoSocial ?? '').trim(),
      cnpj: (raw.cnpj ?? '').trim(),
      endereco: (raw.endereco ?? '').trim(),
      idUsuario: (raw.idUsuario ?? '').trim(),
    };

    this.carregando.set(true);

    try {
      if (this.isNovo()) {
        await firstValueFrom(this.empresaApi.create(payload));
        this.notificacao.sucesso('Empresa cadastrada com sucesso!');
      } else {
        const clienteAtual = this.clienteAtual();
        if (!clienteAtual?.id) {
          throw new Error('missing-id');
        }
        await firstValueFrom(this.empresaApi.update(clienteAtual.id, payload));
        this.notificacao.sucesso('Empresa atualizada com sucesso!');
      }
      this.salvo.emit();
      this.fecharModal();
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível salvar a empresa.');
    } finally {
      this.carregando.set(false);
    }
  }

  fecharModal(): void {
    this.fecharPainelContatos();
    this.fechar.emit();
  }

  abrirPainelContatos(): void {
    if (this.isNovo() || !this.clienteAtual()) {
      return;
    }
    this.resetContatoForm();
    this.painelContatosAberto.set(true);
    this.mostrarFormularioContato.set(false);
  }

  fecharPainelContatos(): void {
    this.painelContatosAberto.set(false);
    this.resetContatoForm();
    this.mostrarFormularioContato.set(false);
    this.contatosInternos.set([]);
  }

  async salvarContato(): Promise<void> {
    this.contatoAlertas.set(null);
    if (this.contatoForm.invalid) {
      this.contatoForm.markAllAsTouched();
      this.notificacao.erro('Preencha os dados obrigatórios do contato.');
      return;
    }

    const cliente = this.clienteAtual();
    if (!cliente) {
      return;
    }

    const raw = this.contatoForm.getRawValue();
    const telefoneLimpo = (raw.telefone ?? '').replace(/\D+/g, '');
    this.contatoForm.patchValue({ telefone: telefoneLimpo }, { emitEvent: false });
    const payload: ContatoDTO = {
      idEmpresa: cliente.id,
      idUsuario: (raw.idUsuario ?? '').trim(),
      responsavel: (raw.responsavel ?? '').trim(),
      setor: raw.setor as Contato['setor'],
      telefone: telefoneLimpo,
      email: (raw.email ?? '').trim(),
    };

    this.carregandoContatos.set(true);
    try {
      await firstValueFrom(this.contatoApi.create(payload));
      this.notificacao.sucesso('Contato adicionado com sucesso!');
      await this.carregarContatos(cliente.id);
      this.resetContatoForm();
      this.mostrarFormularioContato.set(false);
    } catch (erro) {
      this.tratarErroContato(erro);
    } finally {
      this.carregandoContatos.set(false);
    }
  }

  obterRotuloSetor(setor: Contato['setor']): string {
    const rotulos: Record<Contato['setor'], string> = {
      FINANCEIRO: 'Financeiro',
      MANUTENCAO: 'Manutenção',
      COMERCIAL: 'Comercial',
      VENDAS: 'Vendas',
      COMPRAS: 'Compras',
      JURIDICO: 'Jurídico',
      OPERACIONAL: 'Operacional',
      ADMINISTRACAO: 'Administração',
      FISCAL: 'Fiscal',
      RH: 'Recursos Humanos',
      LOGISTICA: 'Logística',
    };
    return rotulos[setor] ?? setor;
  }

  private inicializarFormularioNovo(): void {
    this.form.reset({
      id: 'Será gerado ao salvar',
      razaoSocial: '',
      cnpj: '',
      endereco: '',
      categoria: 'Industria',
      ativo: true,
      idUsuario: this.usuarios().at(0)?.id ?? '',
    });
    this.atualizarModoEdicao(true);
  }

  private popularFormulario(cliente: Cliente): void {
    this.form.reset({
      id: '',
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj,
      endereco: cliente.endereco,
      categoria: cliente.categoria,
      ativo: cliente.ativo,
      idUsuario: this.dadosUsuarioLogado.id,
    });
  }

  private atualizarModoEdicao(editar: boolean): void {
    this.modoEdicao.set(editar);
    if (editar) {
      this.form.enable({ emitEvent: false });
      this.form.get('id')?.disable({ emitEvent: false });
    } else {
      this.form.disable({ emitEvent: false });
    }
  }

  private resetarFormulario(): void {
    this.form.reset({
      id: '',
      razaoSocial: '',
      cnpj: '',
      endereco: '',
      categoria: 'Industria',
      ativo: true,
      idUsuario: '',
    });
    this.form.disable({ emitEvent: false });
    this.modoEdicao.set(false);
    this.isNovo.set(false);
    this.clienteAtual.set(null);
    this.painelContatosAberto.set(false);
    this.resetContatoForm();
    this.mostrarFormularioContato.set(false);
  }

  private resetContatoForm(): void {
    this.contatoForm.reset({
      idUsuario: this.clienteAtual()?.idUsuario ?? this.usuarios().at(0)?.id ?? '',
      responsavel: '',
      setor: 'COMERCIAL',
      telefone: '',
      email: '',
    });
    this.contatoAlertas.set(null);
  }

  abrirFormularioContato(): void {
    this.resetContatoForm();
    this.mostrarFormularioContato.set(true);
  }

  cancelarFormularioContato(): void {
    this.resetContatoForm();
    this.mostrarFormularioContato.set(false);
  }

  async excluir(): Promise<void> {
    const cliente = this.clienteAtual();
    if (!cliente?.id) {
      return;
    }

    const podeExcluir = await this.podeExcluirEmpresa(cliente);
    if (!podeExcluir) {
      return;
    }

    this.carregando.set(true);
    try {
      await firstValueFrom(this.empresaApi.remove(cliente.id));
      this.notificacao.sucesso('Empresa removida com sucesso!');
      this.excluido.emit();
      this.fecharModal();
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível excluir a empresa.');
    } finally {
      this.carregando.set(false);
    }
  }

  private async podeExcluirEmpresa(cliente: Cliente): Promise<boolean> {
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
        this.notificacao.erro(`Não é possível excluir a empresa. Existem ${blocos.join(' e ')} vinculados.`);
        return false;
      }
      return window.confirm(`Excluir a empresa "${cliente.razaoSocial}"? Esta ação não poderá ser desfeita.`);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível validar dependências da empresa.');
      return false;
    }
  }

  private async inicializarModal(modo: ModalModo, id: string | null): Promise<void> {
    this.carregando.set(true);
    this.painelContatosAberto.set(false);
    this.mostrarFormularioContato.set(false);
    try {
      await this.carregarUsuarios();

      if (modo === 'novo') {
        this.isNovo.set(true);
        this.clienteAtual.set(null);
        this.inicializarFormularioNovo();
        return;
      }

      if (!id) {
        throw new Error('Cliente não encontrado');
      }

      const dto = await firstValueFrom(this.empresaApi.get(id));
      const cliente = this.mapEmpresa(dto);
      this.isNovo.set(false);
      this.clienteAtual.set(cliente);
      this.popularFormulario(cliente);
      this.atualizarModoEdicao(modo === 'editar');
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Cliente não encontrado.');
      queueMicrotask(() => this.fechar.emit());
    } finally {
      this.carregando.set(false);
    }
  }

  private async carregarUsuarios(): Promise<void> {
    this.carregandoUsuarios.set(true);
    try {
      const pagina = await firstValueFrom(this.usuarioApi.list({ pagina: 0, quantidade: 200 }));
      const usuarios = (pagina.content ?? [])
        .filter((usuario): usuario is UsuarioDTO & { id: string } => !!usuario.id)
        .map((usuario) => ({ id: usuario.id!, nome: usuario.nome }));
      this.usuariosInternos.set(usuarios);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível carregar a lista de usuários.');
      this.usuariosInternos.set([]);
    } finally {
      this.carregandoUsuarios.set(false);
    }
  }

  private async carregarContatos(idEmpresa: string): Promise<void> {
    this.carregandoContatos.set(true);
    try {
      const razaoSocial = this.clienteAtual()?.razaoSocial;
      const pagina = await firstValueFrom(
        this.contatoApi.list({ pagina: 0, quantidade: 200, ...(razaoSocial ? { nomeEmpresa: razaoSocial } : {}) })
      );
      const contatos = (pagina.content ?? [])
        .map((contato) => this.mapContato(contato.idEmpresa ? contato : { ...contato, idEmpresa }));
      this.contatosInternos.set(contatos);
      this.contatoAlertas.set(null);
    } catch (erro) {
      console.error(erro);
      this.notificacao.erro('Não foi possível carregar os contatos da empresa.');
      this.contatosInternos.set([]);
    } finally {
      this.carregandoContatos.set(false);
    }
  }

  private tratarErroContato(erro: unknown): void {
    console.error(erro);
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 409) {
        this.contatoAlertas.set({ telefone: 'Telefone ou email já cadastrado.', email: 'Telefone ou email já cadastrado.' });
        this.notificacao.erro('Telefone ou email já cadastrado em outro contato.');
        return;
      }

      if (erro.status === 422) {
        const alertas: { telefone?: string; email?: string; geral?: string } = {};
        const detalhes = Array.isArray(erro.error?.erros) ? erro.error.erros : [];
        detalhes.forEach((campo: { campo?: string; mensagem?: string }) => {
          if (!campo || !campo.campo) {
            return;
          }
          if (campo.campo === 'telefone') {
            alertas.telefone = campo.mensagem ?? 'Telefone inválido.';
          }
          if (campo.campo === 'email') {
            alertas.email = campo.mensagem ?? 'Email inválido.';
          }
        });
        if (!alertas.telefone && !alertas.email && typeof erro.error?.mensagem === 'string') {
          alertas.geral = erro.error.mensagem;
        }
        this.contatoAlertas.set(alertas);
        this.notificacao.erro('Revise os campos destacados do contato.');
        return;
      }
    }

    this.notificacao.erro('Não foi possível adicionar o contato.');
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

  private mapContato(dto: ContatoDTO): Contato {
    return {
      id: dto.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      idEmpresa: dto.idEmpresa,
      idUsuario: dto.idUsuario,
      responsavel: dto.responsavel,
      setor: dto.setor,
      telefone: dto.telefone,
      email: dto.email,
    } satisfies Contato;
  }
}
