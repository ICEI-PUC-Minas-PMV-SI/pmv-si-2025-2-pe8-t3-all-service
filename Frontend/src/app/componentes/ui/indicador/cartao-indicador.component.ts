import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

type KpiTone = 'sucesso' | 'alerta' | 'erro';

interface KpiColors {
  base: string;
  border: string;
  shadow: string;
  shadowHover: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'as-cartao-indicador',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'block h-full' },
  template: `
    <div
      class="kpi-card"
      [style.--kpi-accent-border]="colors.border"
      [style.--kpi-card-shadow]="colors.shadow"
      [style.--kpi-card-shadow-hover]="colors.shadowHover"
      [style.--kpi-icon-bg]="colors.iconBg"
      [style.--kpi-icon-color]="colors.iconColor"
    >
      <div class="kpi-card__header">
        @if (icone) {
          <div class="kpi-card__icon-wrapper">
            <i class="kpi-card__icon" [ngClass]="icone" [style.color]="colors.iconColor"></i>
          </div>
        }
        <h3 class="kpi-card__titulo">{{ titulo }}</h3>
      </div>

      <div
        class="kpi-card__valor"
        [ngClass]="{
          'kpi-card__valor--sucesso': tipo === 'sucesso',
          'kpi-card__valor--alerta': tipo === 'alerta',
          'kpi-card__valor--erro': tipo === 'erro'
        }"
      >
        {{ valor }}
      </div>

      @if (descricao) {
        <div class="kpi-card__footer">
          @if (iconeTendencia) {
            <i class="kpi-card__trend-icon" [ngClass]="iconeTendencia"></i>
          }
          <span
            class="kpi-card__descricao"
            [ngClass]="{
              'kpi-card__descricao--sucesso': tipo === 'sucesso',
              'kpi-card__descricao--alerta': tipo === 'alerta',
              'kpi-card__descricao--erro': tipo === 'erro'
            }"
          >
            {{ descricao }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 140px;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 253, 244, 0.5));
      border: 1px solid rgba(16, 185, 129, 0.12);
      border-radius: 1rem;
      border-left: 6px solid var(--kpi-accent-border, rgba(16, 185, 129, 0.35));
      box-shadow: var(
        --kpi-card-shadow,
        -8px 0 18px -14px rgba(15, 118, 110, 0.28),
        0 6px 18px -12px rgba(15, 23, 42, 0.12)
      );
      transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }

    [data-theme='dark'] .kpi-card {
      background: linear-gradient(135deg, rgba(22, 27, 34, 0.98), rgba(13, 17, 23, 0.95));
      border-color: rgba(52, 211, 153, 0.2);
      border-left-color: var(--kpi-accent-border, rgba(52, 211, 153, 0.35));
      box-shadow: var(
        --kpi-card-shadow,
        -8px 0 18px -16px rgba(52, 211, 153, 0.24),
        0 8px 20px -12px rgba(0, 0, 0, 0.45)
      );
    }

    .kpi-card:hover {
      box-shadow: var(
        --kpi-card-shadow-hover,
        -12px 0 26px -18px rgba(15, 118, 110, 0.42),
        0 14px 28px -18px rgba(15, 23, 42, 0.18)
      );
      transform: translateY(-2px);
      border-left-color: var(--kpi-accent-border, rgba(16, 185, 129, 0.42));
    }

    [data-theme='dark'] .kpi-card:hover {
      box-shadow: var(
        --kpi-card-shadow-hover,
        -12px 0 28px -18px rgba(52, 211, 153, 0.4),
        0 18px 34px -20px rgba(0, 0, 0, 0.6)
      );
      border-color: rgba(52, 211, 153, 0.3);
      border-left-color: var(--kpi-accent-border, rgba(52, 211, 153, 0.45));
    }

    .kpi-card__header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .kpi-card__icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      background: var(--kpi-icon-bg, rgba(16, 185, 129, 0.14));
      flex-shrink: 0;
    }

    .kpi-card__icon {
      font-size: 1rem;
      color: var(--kpi-icon-color, #059669);
    }

    .kpi-card__titulo {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #047857;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    [data-theme='dark'] .kpi-card__titulo {
      color: #6ee7b7;
    }

    .kpi-card__valor {
      font-size: 2rem;
      font-weight: 700;
      color: #065f46;
      line-height: 1.1;
      margin: auto 0 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    [data-theme='dark'] .kpi-card__valor {
      color: #a7f3d0;
    }

    .kpi-card__footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(16, 185, 129, 0.1);
    }

    [data-theme='dark'] .kpi-card__footer {
      border-top-color: rgba(52, 211, 153, 0.2);
    }

    .kpi-card__trend-icon {
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .kpi-card__trend-icon.up {
      color: #10b981;
    }

    [data-theme='dark'] .kpi-card__trend-icon.up {
      color: #34d399;
    }

    .kpi-card__trend-icon.down {
      color: #ef4444;
    }

    [data-theme='dark'] .kpi-card__trend-icon.down {
      color: #f87171;
    }

    .kpi-card__trend-icon.flat {
      color: #94a3b8;
    }

    [data-theme='dark'] .kpi-card__trend-icon.flat {
      color: #a8b4c8;
    }

    .kpi-card__descricao {
      font-size: 0.8125rem;
      color: #059669;
      font-weight: 500;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    [data-theme='dark'] .kpi-card__descricao {
      color: #6ee7b7;
    }

    .kpi-card__valor--sucesso {
      color: #047857;
    }

    .kpi-card__valor--alerta {
      color: #b45309;
    }

    .kpi-card__valor--erro {
      color: #dc2626;
    }

    .kpi-card__descricao--sucesso {
      color: #047857;
    }

    .kpi-card__descricao--alerta {
      color: #b45309;
    }

    .kpi-card__descricao--erro {
      color: #dc2626;
    }

    [data-theme='dark'] .kpi-card__valor--sucesso,
    [data-theme='dark'] .kpi-card__descricao--sucesso {
      color: #34d399;
    }

    [data-theme='dark'] .kpi-card__valor--alerta,
    [data-theme='dark'] .kpi-card__descricao--alerta {
      color: #fbbf24;
    }

    [data-theme='dark'] .kpi-card__valor--erro,
    [data-theme='dark'] .kpi-card__descricao--erro {
      color: #f87171;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartaoIndicadorComponent implements OnChanges {
  private static readonly DEFAULT_ACCENT = '#0f766e';
  private static readonly TONE_ACCENTS: Record<KpiTone, string> = {
    sucesso: '#10b981',
    alerta: '#f59e0b',
    erro: '#ef4444',
  };

  @Input() titulo = '';
  @Input() valor: string | number = '';
  @Input() descricao = '';
  @Input() icone?: string;
  @Input() tendencia?: 'up' | 'down' | 'flat';
  @Input() tipo?: KpiTone;
  @Input() accent?: string;
  @Input() iconColor?: string;
  @Input() iconBackground?: string;

  colors: KpiColors = this.calculateColors();

  ngOnChanges(_changes: SimpleChanges): void {
    this.colors = this.calculateColors();
  }

  get iconeTendencia() {
    switch (this.tendencia) {
      case 'up':
        return 'fas fa-arrow-up up';
      case 'down':
        return 'fas fa-arrow-down down';
      case 'flat':
        return 'fas fa-minus flat';
      default:
        return undefined;
    }
  }

  private calculateColors(): KpiColors {
    const baseAccent = this.resolveAccent();
    const iconColor = this.iconColor ?? baseAccent;
    const iconBg = this.iconBackground ?? this.applyAlpha(baseAccent, 0.16);
    const border = this.applyAlpha(baseAccent, 0.45);
    const shadow = `-10px 0 22px -16px ${this.applyAlpha(baseAccent, 0.38)}, 0 10px 24px -16px rgba(15, 23, 42, 0.16)`;
    const shadowHover = `-12px 0 28px -18px ${this.applyAlpha(baseAccent, 0.52)}, 0 18px 36px -22px rgba(15, 23, 42, 0.2)`;

    return {
      base: baseAccent,
      border,
      shadow,
      shadowHover,
      iconBg,
      iconColor,
    };
  }

  private resolveAccent(): string {
    if (this.accent) {
      return this.accent;
    }
    if (this.tipo) {
      return CartaoIndicadorComponent.TONE_ACCENTS[this.tipo];
    }
    return CartaoIndicadorComponent.DEFAULT_ACCENT;
  }

  private applyAlpha(color: string, alpha: number): string {
    const rgb = this.toRgb(color);
    if (!rgb) {
      return `rgba(15, 118, 110, ${alpha})`;
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  private toRgb(color: string): { r: number; g: number; b: number } | null {
    if (!color) {
      return null;
    }

    const hex = color.trim();
    if (hex.startsWith('#')) {
      const raw = hex.slice(1);
      if (raw.length === 3) {
        const r = raw[0] + raw[0];
        const g = raw[1] + raw[1];
        const b = raw[2] + raw[2];
        return {
          r: Number.parseInt(r, 16),
          g: Number.parseInt(g, 16),
          b: Number.parseInt(b, 16),
        };
      }
      if (raw.length === 6) {
        return {
          r: Number.parseInt(raw.slice(0, 2), 16),
          g: Number.parseInt(raw.slice(2, 4), 16),
          b: Number.parseInt(raw.slice(4, 6), 16),
        };
      }
      return null;
    }

    const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1]
        .split(',')
        .map((part) => Number.parseFloat(part.trim()))
        .filter((value) => Number.isFinite(value));
      if (parts.length >= 3) {
        return { r: parts[0], g: parts[1], b: parts[2] };
      }
    }

    return null;
  }
}
