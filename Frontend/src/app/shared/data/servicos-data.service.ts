import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmpresaApi } from '../../api/empresa.api';
import { EmpresaDTO, ServicoDTO, UsuarioDTO } from '../../api/models';
import { ServicoApi } from '../../api/servico.api';
import { UsuarioApi } from '../../api/usuario.api';
import { mapServicoDtoToRelatorio } from './servico-mapper';
import { ServicoRelatorio } from './servicos.model';

interface ReferenciasServico {
  empresas: Map<string, EmpresaDTO>;
  usuarios: Map<string, UsuarioDTO>;
}

@Injectable({ providedIn: 'root' })
export class ServicosDataService {
  private readonly servicoApi = inject(ServicoApi);
  private readonly empresaApi = inject(EmpresaApi);
  private readonly usuarioApi = inject(UsuarioApi);

  private readonly empresasCache = new Map<string, EmpresaDTO>();
  private readonly usuariosCache = new Map<string, UsuarioDTO>();

  private servicosCache: ServicoRelatorio[] | null = null;
  private carregamentoAtual: Promise<ServicoRelatorio[]> | null = null;

  async obterServicos(force = false): Promise<ServicoRelatorio[]> {
    if (!force) {
      if (this.servicosCache) {
        return this.servicosCache;
      }
      if (this.carregamentoAtual) {
        return this.carregamentoAtual;
      }
    }

    const carregamento = this.carregarServicos();
    if (!force) {
      this.carregamentoAtual = carregamento;
    }

    try {
      const servicos = await carregamento;
      this.servicosCache = servicos;
      return servicos;
    } finally {
      if (!force) {
        this.carregamentoAtual = null;
      }
    }
  }

  async refresh(): Promise<ServicoRelatorio[]> {
    this.servicosCache = null;
    return this.obterServicos(true);
  }

  reset(): void {
    this.servicosCache = null;
    this.carregamentoAtual = null;
  }

  private async carregarServicos(): Promise<ServicoRelatorio[]> {
    const pagina = await firstValueFrom(this.servicoApi.list({ pagina: 0, quantidade: 200 }));
    const conteudo = pagina.content ?? [];

    if (conteudo.length === 0) {
      return [];
    }

    const referencias = await this.carregarReferencias(conteudo);

    return conteudo.map((dto) =>
      mapServicoDtoToRelatorio(dto, {
        empresa: referencias.empresas.get(dto.idEmpresa) ?? this.empresasCache.get(dto.idEmpresa ?? ''),
        usuario: referencias.usuarios.get(dto.idUsuario) ?? this.usuariosCache.get(dto.idUsuario ?? ''),
      })
    );
  }

  private async carregarReferencias(dtos: ServicoDTO[]): Promise<ReferenciasServico> {
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
          console.error('[ServicosDataService] Falha ao carregar empresa', id, erro);
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
          console.error('[ServicosDataService] Falha ao carregar usuário', id, erro);
        }
      })
    );

    return { empresas, usuarios };
  }
}
