import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'as-estado-vazio',
  standalone: true,
  template: `
    <div class="text-center p-10 text-green-700">
      <i class="fas fa-folder-open text-3xl mb-3 opacity-60"></i>
      <p class="font-medium">{{ titulo() }}</p>
      @if (descricao()) {
        <p class="text-sm opacity-80 mt-1">{{ descricao() }}</p>
      }
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoVazioComponent {
  titulo = input('Sem dados');
  descricao = input<string | undefined>();
}
