import { Injectable, signal } from '@angular/core';

interface OpcaoConfirmacao { titulo?: string; mensagem?: string; confirmar?: string; cancelar?: string; }

@Injectable({ providedIn: 'root' })
export class DialogoService {
  readonly estadoConfirmacao = signal<(OpcaoConfirmacao & { resolver?: (valor:boolean)=>void }) | null>(null);

  solicitarConfirmacao(opcoes: OpcaoConfirmacao): Promise<boolean> {
    return new Promise(resolve => {
      this.estadoConfirmacao.set({ ...opcoes, resolver: resolve });
    });
  }

  responder(valor: boolean): void {
    const estado = this.estadoConfirmacao();
    estado?.resolver?.(valor);
    this.estadoConfirmacao.set(null);
  }
}
