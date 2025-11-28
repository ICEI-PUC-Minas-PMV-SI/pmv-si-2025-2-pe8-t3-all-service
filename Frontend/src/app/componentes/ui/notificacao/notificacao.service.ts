import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'sucesso' | 'erro' | 'info';
  mensagem: string;
  tempo?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private sequencia = 0;
  readonly notificacoes = signal<Aviso[]>([]);

  mostrar(mensagem: string, tipo: Aviso['tipo']='info', tempo=3500) {
    const id = ++this.sequencia;
    this.notificacoes.update(lista => [...lista, { id, mensagem, tipo, tempo }]);
    if (tempo>0) setTimeout(()=> this.remover(id), tempo);
  }
  sucesso(mensagem: string) { this.mostrar(mensagem, 'sucesso'); }
  erro(mensagem: string) { this.mostrar(mensagem, 'erro', 6000); }
  remover(id: number) { this.notificacoes.update(lista => lista.filter(n=>n.id!==id)); }
  limpar() { this.notificacoes.set([]); }
}
