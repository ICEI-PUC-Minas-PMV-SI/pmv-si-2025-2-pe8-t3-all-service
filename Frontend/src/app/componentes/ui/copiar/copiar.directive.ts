import { Directive, HostListener, Input } from '@angular/core';
import { NotificacaoService } from '../notificacao/notificacao.service';

@Directive({
  selector: '[asCopiar]',
  standalone: true,
})
export class DiretivaCopiar {
  @Input('asCopiar') texto = '';
  constructor(private notificacao: NotificacaoService) {}
  @HostListener('click') copiar() {
    if (!this.texto) return;
    navigator.clipboard?.writeText(this.texto);
    this.notificacao.sucesso('Copiado');
  }
}
