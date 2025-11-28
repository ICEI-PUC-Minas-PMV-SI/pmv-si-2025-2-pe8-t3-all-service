import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'as-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="'status-badge--' + status">
      {{ status | titlecase }}
    </span>
  `,
  styleUrls: ['./status-badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() status: 'ativo' | 'inativo' | 'pendente' | string = 'inativo';
}
