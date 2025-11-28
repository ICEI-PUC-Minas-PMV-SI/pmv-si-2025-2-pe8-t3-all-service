import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmpresaApi } from '../../../api/empresa.api';
import { EmpresaDTO, ServicoDTO, UsuarioDTO } from '../../../api/models';
import { ServicoApi } from '../../../api/servico.api';
import { UsuarioApi } from '../../../api/usuario.api';
import { BotaoComponent } from '../../../componentes/ui/botao/botao.component';
import { CartaoIndicadorComponent } from '../../../componentes/ui/indicador/cartao-indicador.component';
import { NotificacaoService } from '../../../componentes/ui/notificacao/notificacao.service';
import { HeaderService } from '../../../layout/header.service';
import { mapServicoDtoToRelatorio } from '../../../shared/data/servico-mapper';
import {
  STATUS_CLASSES,
  ServicoRelatorio,
  formatarEnum,
} from '../../../shared/data/servicos.model';

/**
 * Quick KPI descriptor used by the summary cards rendered at the top of the page.
 * Extend this when you want to expose new metrics for the services table.
 */
interface ServicoKpi {
  id: string;
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  tendencia: 'up' | 'down' | 'flat';
  accent: string;
  tipo?: 'sucesso' | 'alerta' | 'erro';
}

/**
 * Página de listagem dos serviços.
 *
 * Responsável por:
 * - Buscar serviços via `ServicoApi.list()` (pode receber filtros adicionais).
 * - Carregar dados auxiliares de empresa/usuário para montar o `ServicoRelatorio` usado pela UI.
 * - Expor sinais (signals) que alimentam filtro textual, KPIs e totalizadores.
 *
 * Para adicionar novos botões ou filtros:
 * - Use `header.setHeader` para registrar ações na AppBar.
 * - Amplie `filtro` ou crie novos signals/computed para controles adicionais.
 */
@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, BotaoComponent, CartaoIndicadorComponent],
  templateUrl: './servicos.component.html',
  styleUrls: ['./servicos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicosComponent implements OnInit, OnDestroy {
  private readonly header = inject(HeaderService);
  private readonly router = inject(Router);
  private readonly notificacao = inject(NotificacaoService);
  private readonly servicoApi = inject(ServicoApi);
  private readonly empresaApi = inject(EmpresaApi);
  private readonly usuarioApi = inject(UsuarioApi);

  private empresasCache = new Map<string, EmpresaDTO>();
  private usuariosCache = new Map<string, UsuarioDTO>();

  private readonly numero = new Intl.NumberFormat('pt-BR');
  private readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  readonly filtro = signal('');
  readonly servicos = signal<ServicoRelatorio[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly filtrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.servicos();
    }

    return this.servicos().filter((servico) =>
      [
        servico.empresa.nome,
        servico.notaFiscal ?? '',
        servico.ordemServico ?? '',
        servico.descricaoPeca ?? '',
        servico.clienteCertificado ?? '',
        servico.status,
      ]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(termo))
    );
  });

  readonly totalizador = computed(() => {
    const lista = this.filtrados();
    const valorTotal = lista.reduce((acc, item) => acc + item.valorTotal, 0);
    const valorLiquido = lista.reduce((acc, item) => acc + item.valorLiquido, 0);
    return {
      quantidade: lista.length,
      valorTotal,
      valorLiquido,
    };
  });

  readonly metricas = computed<ServicoKpi[]>(() => {
    const total = this.totalizador();
    const totalRegistros = this.servicos().length;
    const visiveis = total.quantidade;
    const foraDoFiltro = totalRegistros - visiveis;

    const visibilidadeDescricao =
      foraDoFiltro > 0
        ? `${this.numero.format(visiveis)} de ${this.numero.format(totalRegistros)} visíveis`
        : 'Todos os registros disponíveis';

    return [
      {
        id: 'servicos-total',
        titulo: 'Serviços listados',
        valor: this.numero.format(visiveis),
        descricao: visibilidadeDescricao,
        icone: 'fas fa-layer-group',
        tendencia: 'flat',
        accent: '#2563eb',
      },
      {
        id: 'servicos-bruto',
        titulo: 'Valor bruto',
        valor: this.moeda.format(total.valorTotal),
        descricao: `${this.numero.format(visiveis)} contratos acumulados`,
        icone: 'fas fa-coins',
        tendencia: 'up',
        accent: '#16a34a',
        tipo: 'sucesso',
      },
      {
        id: 'servicos-liquido',
        titulo: 'Valor líquido',
        valor: this.moeda.format(total.valorLiquido),
        descricao: 'Após retenções e impostos',
        icone: 'fas fa-wallet',
        tendencia: 'flat',
        accent: '#0ea5e9',
      },
    ];
  });

  readonly formatarEnum = formatarEnum;

  ngOnInit(): void {
    this.header.setHeader('Serviços', [
      {
        id: 'novo-servico',
        label: 'Novo serviço',
        icon: 'ph ph-plus',
        variant: 'primario',
        execute: () => this.novo(),
      },
    ]);
    void this.carregarServicos();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  atualizarFiltroEvento(evento: Event): void {
    const valor = (evento.target as HTMLInputElement | null)?.value ?? '';
    this.filtro.set(valor);
  }

  /**
   * Handler do botão "Novo serviço" exibido no Header.
   * Customize a navegação ou pré-condições (ex.: exigir seleção de empresa) aqui.
   */
  novo(): void {
    this.router.navigate(['/servicos/novo']);
  }

  abrir(servico: ServicoRelatorio): void {
    this.visualizar(servico);
  }

  /**
   * Navega para o detalhe do serviço em modo leitura.
   * Passe `queryParams: { editar: true }` caso queira entrar direto em modo edição.
   */
  visualizar(servico: ServicoRelatorio): void {
    this.router.navigate(['/servicos', servico.id]);
  }

  /**
   * Atalho para abrir o detalhe já em modo edição.
   */
  editar(servico: ServicoRelatorio): void {
    this.router.navigate(['/servicos', servico.id, 'editar']);
  }

  /**
   * Resolve as classes utilitárias usadas nos badges de status.
   * Amplie `STATUS_CLASSES` em `servicos.model.ts` para suportar novos estados.
   */
  statusClasse(status: ServicoRelatorio['status']): string {
    return STATUS_CLASSES[status] ?? 'bg-slate-200 text-slate-700';
  }

  /**
   * Efeito principal de carregamento da tabela.
   *
   * Adapte o objeto passado para `servicoApi.list()` para aplicar filtros avançados
   * (status, período, empresa etc). Após obter os DTOs, converte para `ServicoRelatorio`
   * resolvendo referências de empresa e usuário.
   */
  private async carregarServicos(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const pagina = await firstValueFrom(this.servicoApi.list({ pagina: 0, quantidade: 200 }));
      const conteudo = pagina.content ?? [];
      const { empresas, usuarios } = await this.carregarReferencias(conteudo);
      const mapped = conteudo.map((dto) =>
        mapServicoDtoToRelatorio(dto, {
          empresa: empresas.get(dto.idEmpresa) ?? this.empresasCache.get(dto.idEmpresa),
          usuario: usuarios.get(dto.idUsuario) ?? this.usuariosCache.get(dto.idUsuario),
        })
      );
      this.servicos.set(mapped);
    } catch (erro) {
      console.error(erro);
      this.erro.set('Não foi possível carregar os serviços.');
      this.notificacao.erro('Não foi possível carregar os serviços.');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Carrega e cacheia empresas/usuários utilizados na lista de serviços.
   * Utilize este padrão quando precisar buscar entidades relacionadas (ex.: contatos).
   */
  private async carregarReferencias(dtos: ServicoDTO[]): Promise<{ empresas: Map<string, EmpresaDTO>; usuarios: Map<string, UsuarioDTO> }> {
    const empresas = new Map<string, EmpresaDTO>();
    const usuarios = new Map<string, UsuarioDTO>();

    const empresaIds = Array.from(new Set(dtos.map((dto) => dto.idEmpresa).filter((id): id is string => !!id)));
    const usuarioIds = Array.from(new Set(dtos.map((dto) => dto.idUsuario).filter((id): id is string => !!id)));

    await Promise.all(
      empresaIds.map(async (id) => {
        if (this.empresasCache.has(id)) {
          empresas.set(id, this.empresasCache.get(id)!);
          return;
        }
        try {
          const dto = await firstValueFrom(this.empresaApi.get(id));
          this.empresasCache.set(id, dto);
          empresas.set(id, dto);
        } catch (erro) {
          console.error(erro);
        }
      })
    );

    await Promise.all(
      usuarioIds.map(async (id) => {
        if (this.usuariosCache.has(id)) {
          usuarios.set(id, this.usuariosCache.get(id)!);
          return;
        }
        try {
          const dto = await firstValueFrom(this.usuarioApi.get(id));
          this.usuariosCache.set(id, dto);
          usuarios.set(id, dto);
        } catch (erro) {
          console.error(erro);
        }
      })
    );

    return { empresas, usuarios };
  }

}
