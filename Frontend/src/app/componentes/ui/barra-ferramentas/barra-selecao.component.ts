import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'as-barra-selecao',
  standalone: true,
  imports: [],
  template: `
    <div class="selection-bar">
      <span class="selection-bar__count"><strong>{{ quantidade() }}</strong> selecionada(s)</span>
      <div class="selection-bar__actions">
        @if (mostrarMarcarPaga()) {
          <button type="button" class="selection-bar__btn" (click)="marcar.emit()">
            <i class="fas fa-check"></i> Marcar como Paga
          </button>
        }
        <button type="button" class="selection-bar__btn" (click)="exportar.emit()">
          <i class="fas fa-file-export"></i> Exportar
        </button>
        <button type="button" class="selection-bar__btn selection-bar__btn--danger" (click)="excluir.emit()">
          <i class="fas fa-trash"></i> Excluir
        </button>
        <button type="button" class="selection-bar__btn selection-bar__btn--ghost" (click)="cancelar.emit()">
          <i class="fas fa-times"></i> Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .selection-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1.25rem;
      padding: 0.85rem 1.25rem;
      border-radius: 1rem;
      border: 1px solid rgba(16, 185, 129, 0.18);
      background: linear-gradient(140deg, rgba(16, 185, 129, 0.12) 0%, rgba(240, 253, 244, 0.75) 100%);
      color: #064e3b;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    [data-theme='dark'] .selection-bar {
      border-color: rgba(52, 211, 153, 0.25);
      background: linear-gradient(140deg, rgba(52, 211, 153, 0.15) 0%, rgba(22, 27, 34, 0.9) 100%);
      color: #a7f3d0;
    }

    .selection-bar__count {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .selection-bar__count strong {
      font-weight: 700;
      color: #047857;
    }

    [data-theme='dark'] .selection-bar__count strong {
      color: #34d399;
    }

    .selection-bar__actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .selection-bar__btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.22);
      background: rgba(255, 255, 255, 0.9);
      color: #047857;
      font-weight: 500;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .selection-bar__btn:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.35);
      transform: translateY(-1px);
    }

    .selection-bar__btn--danger {
      border-color: rgba(220, 38, 38, 0.35);
      color: #b91c1c;
    }

    .selection-bar__btn--danger:hover {
      background: rgba(254, 226, 226, 0.8);
      border-color: rgba(220, 38, 38, 0.5);
    }

    .selection-bar__btn--ghost {
      border-color: rgba(148, 163, 184, 0.3);
      color: #475569;
    }

    .selection-bar__btn--ghost:hover {
      background: rgba(226, 232, 240, 0.7);
      border-color: rgba(148, 163, 184, 0.45);
    }

    /* Dark theme button styles */
    [data-theme='dark'] .selection-bar__btn {
      border-color: rgba(52, 211, 153, 0.25);
      background: rgba(22, 27, 34, 0.9);
      color: #34d399;
    }

    [data-theme='dark'] .selection-bar__btn:hover {
      background: rgba(52, 211, 153, 0.15);
      border-color: rgba(52, 211, 153, 0.4);
    }

    [data-theme='dark'] .selection-bar__btn--danger {
      border-color: rgba(248, 113, 113, 0.3);
      color: #f87171;
    }

    [data-theme='dark'] .selection-bar__btn--danger:hover {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.45);
    }

    [data-theme='dark'] .selection-bar__btn--ghost {
      border-color: rgba(168, 180, 200, 0.2);
      color: #a8b4c8;
    }

    [data-theme='dark'] .selection-bar__btn--ghost:hover {
      background: rgba(168, 180, 200, 0.1);
      border-color: rgba(168, 180, 200, 0.35);
    }

    @media (max-width: 640px) {
      .selection-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .selection-bar__actions {
        width: 100%;
        justify-content: stretch;
      }

      .selection-bar__btn {
        flex: 1;
        justify-content: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraSelecaoComponent {
  quantidade = input<number>(0);
  mostrarMarcarPaga = input<boolean>(false); // Only show on Faturas page
  marcar = output<void>();
  exportar = output<void>();
  excluir = output<void>();
  cancelar = output<void>();
}
