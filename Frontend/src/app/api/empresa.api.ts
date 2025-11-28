import { Injectable, inject } from '@angular/core';
import { BaseApi } from './base-api.service';
import { EmpresaDTO, UUID } from './models';
import { Page } from './servico.api';

@Injectable({ providedIn: 'root' })
export class EmpresaApi {
  private api = inject(BaseApi);
  private base = '/empresa';

  list(params?: { pagina?: number; quantidade?: number; razaoSocial?: string; cnpj?: string; endereco?: string }) {
    const query: Record<string, any> = {};
    if (params) {
      if (params.pagina !== undefined) query['pagina'] = params.pagina;
      if (params.quantidade !== undefined) query['quantidade'] = params.quantidade;
      if (params.razaoSocial) query['razao-social'] = params.razaoSocial;
      if (params.cnpj) query['cnpj'] = params.cnpj;
      if (params.endereco) query['endereco'] = params.endereco;
    }
    return this.api.get<Page<EmpresaDTO>>(this.base, query);
  }

  get(id: UUID) {
    return this.api.get<EmpresaDTO>(`${this.base}/${id}`);
  }

  create(payload: EmpresaDTO) {
    return this.api.post<UUID>(this.base, payload);
  }

  update(id: UUID, payload: EmpresaDTO) {
    return this.api.put<void>(`${this.base}/${id}`, payload);
  }

  remove(id: UUID) {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}
