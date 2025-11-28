import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'as-etiqueta-status',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded px-2 py-1 text-xs font-medium"
          [class.bg-green-100]="valor()==='Paga'"
          [class.text-green-800]="valor()==='Paga'"
          [class.bg-yellow-100]="valor()==='Pendente'"
          [class.text-yellow-800]="valor()==='Pendente'"
          [class.bg-red-100]="valor()==='Vencida'"
          [class.text-red-800]="valor()==='Vencida'">
      <ng-content /> {{valor()}}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtiquetaStatusComponent {
  valor = input<'Paga'|'Pendente'|'Vencida'>('Pendente');
}
