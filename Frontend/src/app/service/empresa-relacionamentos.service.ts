import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContatoApi } from '../api/contato.api';
import { UUID } from '../api/models';
import { ServicoApi } from '../api/servico.api';

export interface EmpresaRelacionamentosResumo {
  contatos: number;
  servicos: number;
}

@Injectable({ providedIn: 'root' })
export class EmpresaRelacionamentosService {
  private readonly contatoApi = inject(ContatoApi);
  private readonly servicoApi = inject(ServicoApi);

  async obterResumo(idEmpresa: UUID, nomeEmpresa?: string): Promise<EmpresaRelacionamentosResumo> {
    const [contatos, servicos] = await Promise.all([
      firstValueFrom(
        this.contatoApi.list({
          pagina: 0,
          quantidade: 500,
          ...(nomeEmpresa ? { nomeEmpresa } : {}),
        })
      ),
      firstValueFrom(
        this.servicoApi.list({
          pagina: 0,
          quantidade: 500,
          ...(nomeEmpresa ? { nomeEmpresa } : {}),
        })
      ),
    ]);

    const contatosRelacionados = (contatos.content ?? []).filter((contato) => contato.idEmpresa === idEmpresa).length;
    const servicosRelacionados = (servicos.content ?? []).filter((servico) => servico.idEmpresa === idEmpresa).length;

    return { contatos: contatosRelacionados, servicos: servicosRelacionados };
  }
}
