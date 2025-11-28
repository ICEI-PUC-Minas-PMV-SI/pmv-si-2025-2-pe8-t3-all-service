import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'as-cartao-estatistica',
  standalone: true,
  template: `
    <div class="bg-white rounded-lg shadow p-6 border-l-4" [class]="corBorda()">
      <p class="text-sm" [class]="classeTexto()">{{titulo()}}</p>
      <h3 class="text-2xl font-bold text-green-800">{{valor()}}</h3>
      @if (descricao()) {
        <p class="text-xs mt-2" [class]="classeTexto()">{{descricao()}}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaoEstatisticaComponent {
  titulo = input('');
  valor = input('');
  descricao = input('');
  tipo = input<'sucesso'|'alerta'|'erro'>('sucesso');

  corBorda() {
    return this.tipo() === 'sucesso' ? 'border-green-500' :
           this.tipo() === 'alerta'  ? 'border-yellow-500' : 'border-red-500';
  }
  classeTexto() {
    return this.tipo() === 'sucesso' ? 'text-green-500' :
           this.tipo() === 'alerta'  ? 'text-yellow-500' : 'text-red-500';
  }
}
