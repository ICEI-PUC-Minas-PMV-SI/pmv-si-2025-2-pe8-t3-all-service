import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { BotaoComponent } from '../botao/botao.component';

@Component({
  selector: 'as-paginacao',
  standalone: true,
  imports: [BotaoComponent],
  template: `
    <nav class="flex items-center gap-2">
      <as-botao variante="fantasma" (click)="ir(pagina() - 1)" [desabilitado]="pagina()===1" iconeEsquerda="fas fa-chevron-left">Anterior</as-botao>

      @for (p of intervalo(); track p) {
        <button (click)="ir(p)"
                class="px-3 py-1.5 rounded-md text-sm"
                [class.bg-green-600]="p===pagina()"
                [class.text-white]="p===pagina()"
                [class.text-green-700]="p!==pagina()"
                [class.bg-green-50]="p!==pagina()">
          {{p}}
        </button>
      }

      <as-botao variante="fantasma" (click)="ir(pagina() + 1)" [desabilitado]="pagina()===totalPaginas" iconeDireita="fas fa-chevron-right">Próximo</as-botao>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginacaoComponent {
  pagina = input(1);
  tamanhoPagina = input(10);
  total = input(0);
  mudouPagina = output<number>();

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total() / this.tamanhoPagina()));
  }

  ir(p: number) {
    const prox = Math.min(this.totalPaginas, Math.max(1, p));
    if (prox !== this.pagina()) this.mudouPagina.emit(prox);
  }

  intervalo(): number[] {
    const de = Math.max(1, this.pagina() - 2);
    const ate = Math.min(this.totalPaginas, de + 4);
    return Array.from({length: ate - de + 1}, (_, i) => de + i);
  }
}
