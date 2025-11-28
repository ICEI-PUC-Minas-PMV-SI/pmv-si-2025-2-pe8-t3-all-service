import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { BotaoComponent } from '../botao/botao.component';

@Component({
  selector: 'as-seletor-colunas',
  standalone: true,
  imports: [BotaoComponent],
  template: `
    <div class="relative inline-block">
      <as-botao variante="fantasma" iconeEsquerda="fas fa-columns" (click)="alternarMenu()">Colunas</as-botao>
      @if (aberto()) {
        <div class="absolute right-0 mt-2 bg-white border border-green-100 rounded-lg shadow p-3 z-30 w-56 text-sm space-y-1">
          @for (c of colunas(); track c.id) {
            <label class="flex items-center gap-2">
              <input type="checkbox" [checked]="!c.oculta" (change)="alternar(c.id)" />
              <span>{{c.label}}</span>
            </label>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeletorColunasComponent {
  colunas = input<{id:string; label:string; oculta:boolean}[]>([]);
  alterou = output<string>();
  aberto = signal(false);
  alternar(id: string) { this.alterou.emit(id); }
  alternarMenu() { this.aberto.set(!this.aberto()); }
}
