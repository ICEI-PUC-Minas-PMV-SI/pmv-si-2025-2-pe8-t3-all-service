import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'as-esqueleto-tabela',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-2">
      @for (r of linhas(); track r) {
        <div class="h-6 bg-green-100/60 rounded"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EsqueletoTabelaComponent {
  linhas = input<number[]>(Array.from({ length: 8 }, (_, indice) => indice));
}
