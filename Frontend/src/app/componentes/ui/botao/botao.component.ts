import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'link';

@Component({
  selector: 'as-botao',
  standalone: true,
  template: `
    <button [class]="'as-btn as-btn--' + variante()" [disabled]="desabilitado()" [attr.type]="tipo()">
      @if (iconeEsquerda()) { <i [class]="iconeEsquerda() + ' as-btn__icon-left'"></i> }
      <ng-content></ng-content>
      @if (iconeDireita()) { <i [class]="iconeDireita() + ' as-btn__icon-right'"></i> }
    </button>
  `,
  styles: [`
    .as-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      white-space: nowrap;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .as-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
    }

    [data-theme='dark'] .as-btn:focus {
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
    }

    .as-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .as-btn__icon-left {
      margin-right: 0.5rem;
    }

    .as-btn__icon-right {
      margin-left: 0.5rem;
    }

    /* Primary variant */
    .as-btn--primario {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .as-btn--primario:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transform: translateY(-1px);
    }

    [data-theme='dark'] .as-btn--primario {
      background: linear-gradient(135deg, #34d399, #10b981);
      color: #0a0f14;
    }

    [data-theme='dark'] .as-btn--primario:hover:not(:disabled) {
      background: linear-gradient(135deg, #6ee7b7, #34d399);
      box-shadow: 0 4px 12px rgba(52, 211, 153, 0.4);
    }

    /* Secondary variant */
    .as-btn--secundario {
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .as-btn--secundario:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.3);
    }

    [data-theme='dark'] .as-btn--secundario {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border-color: rgba(52, 211, 153, 0.2);
    }

    [data-theme='dark'] .as-btn--secundario:hover:not(:disabled) {
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.35);
    }

    /* Ghost variant */
    .as-btn--fantasma {
      background: transparent;
      color: #047857;
    }

    .as-btn--fantasma:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.1);
    }

    [data-theme='dark'] .as-btn--fantasma {
      color: #34d399;
    }

    [data-theme='dark'] .as-btn--fantasma:hover:not(:disabled) {
      background: rgba(52, 211, 153, 0.15);
    }

    /* Link variant */
    .as-btn--link {
      background: transparent;
      color: #047857;
      text-decoration: underline;
      padding: 0.25rem 0.5rem;
    }

    .as-btn--link:hover:not(:disabled) {
      color: #065f46;
    }

    [data-theme='dark'] .as-btn--link {
      color: #34d399;
    }

    [data-theme='dark'] .as-btn--link:hover:not(:disabled) {
      color: #6ee7b7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotaoComponent {
  variante = input<Variante>('primario');
  desabilitado = input(false);
  iconeEsquerda = input<string>();
  iconeDireita = input<string>();
  tipo = input<'button' | 'submit' | 'reset'>('button', { alias: 'type' });
}
