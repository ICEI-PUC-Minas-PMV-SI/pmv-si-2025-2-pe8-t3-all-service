import { Injectable, inject } from '@angular/core';
import { BaseApi } from './base-api.service';
import { ServicoDTO, StatusServico, TipoImposto, TipoPagamento, UUID } from './models';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ServicoApi {
  private api = inject(BaseApi);
  private base = '/servico';

  list(params?: {
    pagina?: number;
    quantidade?: number;
    notaFiscal?: string;
    mesAno?: string;
    ano?: string;
    nomeEmpresa?: string;
    status?: StatusServico;
    imposto?: TipoImposto;
    tipoPagamento?: TipoPagamento;
    valorTotal?: number;
    vencimento?: string;
    data?: string;
  }) {
    const query: Record<string, any> = {};
    if (!params) {
      return this.api.get<Page<ServicoDTO>>(this.base);
    }
    if (params.pagina !== undefined) query['pagina'] = params.pagina;
    if (params.quantidade !== undefined) query['quantidade'] = params.quantidade;
    if (params.notaFiscal) query['nota-fiscal'] = params.notaFiscal;
    if (params.mesAno) query['mes-ano'] = params.mesAno;
    if (params.ano) query['ano'] = params.ano;
    if (params.nomeEmpresa) query['nome-empresa'] = params.nomeEmpresa;
    if (params.status) query['status'] = params.status;
    if (params.imposto) query['imposto'] = params.imposto;
    if (params.tipoPagamento) query['tipo-pagamento'] = params.tipoPagamento;
    if (params.valorTotal !== undefined) query['valor-total'] = params.valorTotal;
    if (params.vencimento) query['vencimento'] = params.vencimento;
    if (params.data) query['data'] = params.data;
    return this.api.get<Page<ServicoDTO>>(this.base, query);
  }

  get(id: UUID) {
    return this.api.get<ServicoDTO>(`${this.base}/${id}`);
  }

  create(payload: ServicoDTO) {
    return this.api.post<UUID>(this.base, payload);
  }

  update(id: UUID, payload: ServicoDTO) {
    return this.api.put<void>(`${this.base}/${id}`, payload);
  }

  remove(id: UUID) {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}
