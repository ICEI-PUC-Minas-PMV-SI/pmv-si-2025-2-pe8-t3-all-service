import { Injectable, inject } from '@angular/core';
import { BaseApi } from './base-api.service';
import { UUID, UsuarioDTO } from './models';
import { Page } from './servico.api';

@Injectable({ providedIn: 'root' })
export class UsuarioApi {
  private api = inject(BaseApi);
  private base = '/usuario';

  list(params?: {
    pagina?: number;
    quantidade?: number;
    nome?: string;
    funcao?: string;
    statusUsuario?: string;
    perfil?: string;
  }) {
    const query: Record<string, any> = {};
    if (params) {
      if (params.pagina !== undefined) query['pagina'] = params.pagina;
      if (params.quantidade !== undefined) query['quantidade'] = params.quantidade;
      if (params.nome) query['nome'] = params.nome;
      if (params.funcao) query['funcao'] = params.funcao;
      if (params.statusUsuario) query['statusUsuario'] = params.statusUsuario;
      if (params.perfil) query['perfil'] = params.perfil;
    }
    return this.api.get<Page<UsuarioDTO>>(this.base, query);
  }

  get(id: UUID) {
    return this.api.get<UsuarioDTO>(`${this.base}/${id}`);
  }

  create(payload: UsuarioDTO) {
    return this.api.post<void>(this.base, payload);
  }

  update(id: UUID, payload: UsuarioDTO) {
    return this.api.put<void>(`${this.base}/${id}`, payload);
  }

  remove(id: UUID) {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}
