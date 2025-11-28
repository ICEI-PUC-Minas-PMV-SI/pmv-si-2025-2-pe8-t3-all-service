import { Injectable, inject } from '@angular/core';
import { BaseApi } from './base-api.service';
import { ContatoDTO, UUID } from './models';
import { Page } from './servico.api';

@Injectable({ providedIn: 'root' })
export class ContatoApi {
  private api = inject(BaseApi);
  private base = '/contato';

  list(params?: {
    pagina?: number;
    quantidade?: number;
    nomeEmpresa?: string;
    responsavel?: string;
    setor?: string;
    telefone?: string;
    email?: string;
  }) {
    const query: Record<string, any> = {};
    if (params) {
      if (params.pagina !== undefined) query['pagina'] = params.pagina;
      if (params.quantidade !== undefined) query['quantidade'] = params.quantidade;
      if (params.nomeEmpresa) query['nome-empresa'] = params.nomeEmpresa;
      if (params.responsavel) query['responsavel'] = params.responsavel;
      if (params.setor) query['setor'] = params.setor;
      if (params.telefone) query['telefone'] = params.telefone;
      if (params.email) query['email'] = params.email;
    }
    return this.api.get<Page<ContatoDTO>>(this.base, query);
  }

  get(id: UUID) {
    return this.api.get<ContatoDTO>(`${this.base}/${id}`);
  }

  create(payload: ContatoDTO) {
    return this.api.post<UUID>(this.base, payload);
  }

  update(id: UUID, payload: ContatoDTO) {
    return this.api.put<void>(`${this.base}/${id}`, payload);
  }

  remove(id: UUID) {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}
