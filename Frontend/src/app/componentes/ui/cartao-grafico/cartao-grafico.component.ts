import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'as-cartao-grafico',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  host: { class: 'block h-full' },
  template: `
    <div class="grafico-card" [ngStyle]="accentStyles">
      <div class="grafico-card__header">
        <div class="grafico-card__title">
          @if (icone) {
            <div class="grafico-card__icon-wrapper">
              <i class="grafico-card__icon" [ngClass]="icone"></i>
            </div>
          }
          <span class="grafico-card__title-text">{{ titulo }}</span>
        </div>
        <ng-content select="[chart-extra]"></ng-content>
      </div>
      @if (descricao) { <div class="grafico-card__descricao">{{ descricao }}</div> }
      @if (series && series.length>0) {
        <div class="grafico-shell" [class.grafico-shell--donut]="isDonut">
          <div class="grafico-plot">
            <apx-chart class="h-full" [series]="series" [chart]="configuracaoGrafico" [xaxis]="eixoX" [labels]="rotulos" [colors]="apexColors" [dataLabels]="rotulosDados" [stroke]="tracado" [tooltip]="dica" [legend]="legendaApex"></apx-chart>
          </div>
          @if (isDonut && donutLegend.length) {
            <aside class="grafico-legend-panel" aria-label="Resumo do gráfico em pizza">
              <div class="grafico-legend-scroll">
                @for (item of donutLegend; track item.label) {
                  <div class="grafico-legend-item">
                    <span class="grafico-legend-dot" [style.background]="item.cor"></span>
                    <div class="grafico-legend-text">
                      <span class="grafico-legend-label">{{ item.label }}</span>
                      <span class="grafico-legend-sub">{{ item.valorFormatado }} • {{ item.percentual }}%</span>
                    </div>
                  </div>
                }
              </div>
            </aside>
          }
        </div>
      } @else {
        <div class="flex-1 min-h-[200px] text-xs text-green-500 italic flex items-center justify-center">Sem dados suficientes</div>
      }
    </div>
  `,
  styles: [`
    :host {
      --grafico-legend-width: 13.5rem;
      --grafico-legend-bg: rgba(255, 255, 255, 0.92);
    }

    .grafico-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 260px;
      height: 100%;
      padding: 1.35rem 1.6rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 253, 244, 0.5));
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 1rem;
      border-left: 6px solid var(--grafico-accent-border, rgba(16, 185, 129, 0.45));
      box-shadow: var(
        --grafico-card-shadow,
        -10px 0 22px -18px rgba(15, 118, 110, 0.26),
        0 10px 26px -18px rgba(15, 23, 42, 0.14)
      );
      transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }

    .grafico-card:hover {
      transform: translateY(-2px);
      box-shadow: var(
        --grafico-card-shadow-hover,
        -14px 0 30px -20px rgba(15, 118, 110, 0.42),
        0 18px 34px -22px rgba(15, 23, 42, 0.18)
      );
      border-left-color: var(--grafico-accent-border, rgba(16, 185, 129, 0.48));
    }

    .grafico-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .grafico-card__title {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--grafico-title-color, #065f46);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .grafico-card__title-text {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .grafico-card__icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.6rem;
      background: var(--grafico-icon-bg, rgba(16, 185, 129, 0.18));
      flex-shrink: 0;
    }

    .grafico-card__icon {
      font-size: 1rem;
      color: var(--grafico-icon-color, #047857);
    }

    .grafico-card__descricao {
      font-size: 0.75rem;
      line-height: 1.4;
      color: var(--grafico-description-color, #047857);
      letter-spacing: 0.01em;
    }

    .grafico-shell {
      position: relative;
      flex: 1;
      min-height: 220px;
    }
    .grafico-shell--donut {
      padding-right: var(--grafico-legend-width);
    }
    .grafico-plot {
      min-height: 220px;
      height: 100%;
    }
    .grafico-shell--donut .grafico-plot {
      min-height: 240px;
    }
    .grafico-legend-panel {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: calc(var(--grafico-legend-width) - 1.5rem);
      max-height: calc(100% - 1.5rem);
      padding: 0.75rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(13, 148, 136, 0.18);
      background: var(--grafico-legend-bg);
      box-shadow: 0 18px 36px -24px rgba(15, 118, 110, 0.45);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      backdrop-filter: blur(6px);
    }
    .grafico-legend-scroll {
      overflow-y: auto;
      padding-right: 0.25rem;
      display: grid;
      gap: 0.5rem;
    }
    .grafico-legend-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 0.45rem;
      border-radius: 0.65rem;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(255, 255, 255, 0.85);
    }
    .grafico-legend-dot {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 999px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85);
    }
    .grafico-legend-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .grafico-legend-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #0f172a;
    }
    .grafico-legend-sub {
      font-size: 0.7rem;
      color: #03634d;
      letter-spacing: 0.01em;
    }
    @media (max-width: 960px) {
      .grafico-shell--donut {
        padding-right: 0;
      }
      .grafico-legend-panel {
        position: static;
        width: 100%;
        max-height: 12rem;
        margin-top: 0.75rem;
      }
    }

    /* Dark theme */
    :host-context([data-theme='dark']) {
      --grafico-legend-bg: rgba(22, 27, 34, 0.92);
    }
    :host-context([data-theme='dark']) .grafico-card {
      background: linear-gradient(140deg, rgba(22, 27, 34, 0.98), rgba(13, 17, 23, 0.95));
      border-color: rgba(52, 211, 153, 0.2);
      border-left-color: var(--grafico-accent-border, rgba(52, 211, 153, 0.45));
      box-shadow: var(
        --grafico-card-shadow,
        -10px 0 24px -18px rgba(52, 211, 153, 0.28),
        0 18px 34px -20px rgba(0, 0, 0, 0.55)
      );
    }

    :host-context([data-theme='dark']) .grafico-card:hover {
      box-shadow: var(
        --grafico-card-shadow-hover,
        -14px 0 34px -20px rgba(52, 211, 153, 0.42),
        0 24px 40px -22px rgba(0, 0, 0, 0.65)
      );
      border-color: rgba(52, 211, 153, 0.28);
      border-left-color: var(--grafico-accent-border, rgba(52, 211, 153, 0.52));
    }

    :host-context([data-theme='dark']) .grafico-card__title {
      color: var(--grafico-title-color, #c4f1de);
    }

    :host-context([data-theme='dark']) .grafico-card__descricao {
      color: var(--grafico-description-color, #a5f3fc);
    }

    :host-context([data-theme='dark']) .grafico-card__icon-wrapper {
      background: var(--grafico-icon-bg, rgba(52, 211, 153, 0.18));
    }

    :host-context([data-theme='dark']) .grafico-legend-panel {
      background: var(--grafico-legend-bg);
      border-color: rgba(52, 211, 153, 0.28);
      box-shadow: 0 18px 36px -24px rgba(52, 211, 153, 0.35);
    }
    :host-context([data-theme='dark']) .grafico-legend-item {
      background: rgba(13, 17, 23, 0.85);
      border-color: rgba(52, 211, 153, 0.22);
    }
    :host-context([data-theme='dark']) .grafico-legend-label {
      color: #d1fae5;
    }
    :host-context([data-theme='dark']) .grafico-legend-sub {
      color: #a8b4c8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartaoGraficoComponent implements OnChanges {
  private static readonly DEFAULT_ACCENT = '#0f766e';
  private static readonly TONE_ACCENTS: Record<'sucesso' | 'alerta' | 'erro', string> = {
    sucesso: '#10b981',
    alerta: '#f59e0b',
    erro: '#ef4444',
  };

  @Input() titulo = '';
  @Input() descricao = '';
  @Input() icone?: string;
  @Input() tipo: 'line'|'bar'|'area'|'donut'|'pie' = 'line';
  @Input() series: any[] = [];
  @Input() rotulos: any[] = [];
  @Input() eixoX: any = { categories: [] };
  @Input() cores: unknown = ['#059669', '#047857', '#065f46'];
  @Input() rotulosDados: any = { enabled:false };
  @Input() tracado: any = { curve: 'smooth' };
  @Input() dica: any = {};
  @Input() legenda?: any;
  @Input() accent?: string;
  @Input() tone?: 'sucesso' | 'alerta' | 'erro';
  @Output() pontoSelecionado = new EventEmitter<{indice:number; categoria:string; valor:any}>();
  @Output() fatiaSelecionada = new EventEmitter<{indice:number; rotulo:string; valor:any}>();

  private readonly fallbackColor = '#047857';

  accentStyles: Record<string, string> = this.computeAccentStyles();

  ngOnChanges(_changes: SimpleChanges): void {
    this.accentStyles = this.computeAccentStyles();
  }

  get isDonut(): boolean {
    return this.tipo === 'donut' || this.tipo === 'pie';
  }

  get apexColors(): any[] {
    if (Array.isArray(this.cores)) {
      return this.cores as any[];
    }
    if (typeof this.cores === 'string') {
      return [this.cores];
    }
    if (this.cores == null) {
      return [];
    }
    return [this.cores as Record<string, unknown>];
  }

  get legendaApex(): any {
    if (!this.isDonut) {
      return this.legenda;
    }
    return { ...(this.legenda ?? {}), show: false };
  }

  get donutLegend(): Array<{ label: string; valor: number; valorFormatado: string; percentual: number; cor: string }> {
    if (!this.isDonut || !Array.isArray(this.series)) {
      return [];
    }
    const valores = (this.series as Array<unknown>).map((valor) => {
      const numero = typeof valor === 'number' && Number.isFinite(valor) ? valor : Number(valor);
      return Number.isFinite(numero) ? numero : 0;
    });
    const total = valores.reduce((acc, valor) => acc + valor, 0);
    const palette = Array.isArray(this.cores) ? this.cores : undefined;
    return valores.map((valor, indice) => {
      const corEntry = palette ? palette[indice] : undefined;
      const cor = this.extractColor(corEntry) ?? this.fallbackColor;
      const label = this.rotulos?.[indice] ?? `Item ${indice + 1}`;
      const percentual = total > 0 ? Math.round((valor / total) * 100) : 0;
      return {
        label,
        valor,
        valorFormatado: valor.toLocaleString('pt-BR'),
        percentual,
        cor,
      };
    }).filter((entrada) => entrada.valor > 0 || total === 0);
  }

  get configuracaoGrafico() {
    return {
      type: this.tipo,
      height: 240,
      toolbar: { show:false },
      animations: { enabled:true },
      events: {
        dataPointSelection: (_:any, __:any, config:any) => {
          if (this.tipo==='donut' || this.tipo==='pie') {
            const i = config.dataPointIndex;
            const rotulo = this.rotulos[i];
            const valor = this.series[0]?.data ? this.series[0].data[i] : this.series[i];
            this.fatiaSelecionada.emit({ indice:i, rotulo, valor });
          } else {
            const i = config.dataPointIndex;
            const categoria = this.eixoX?.categories ? this.eixoX.categories[i] : i.toString();
            const valor = this.series[0]?.data ? this.series[0].data[i] : undefined;
            this.pontoSelecionado.emit({ indice:i, categoria, valor });
          }
        }
      }
    };
  }

  private computeAccentStyles(): Record<string, string> {
    const accent = this.resolveAccentColor();
    const border = this.applyAlpha(accent, 0.52);
    const shadow = `-12px 0 26px -18px ${this.applyAlpha(accent, 0.38)}, 0 14px 28px -20px rgba(15, 23, 42, 0.16)`;
    const shadowHover = `-16px 0 34px -20px ${this.applyAlpha(accent, 0.52)}, 0 22px 40px -22px rgba(15, 23, 42, 0.22)`;
    const iconBg = this.applyAlpha(accent, 0.18);
    const descriptionColor = this.applyAlpha(accent, 0.8);

    return {
      '--grafico-accent-border': border,
      '--grafico-card-shadow': shadow,
      '--grafico-card-shadow-hover': shadowHover,
      '--grafico-icon-bg': iconBg,
      '--grafico-icon-color': accent,
      '--grafico-title-color': accent,
      '--grafico-description-color': descriptionColor,
    };
  }

  private resolveAccentColor(): string {
    if (this.accent) {
      return this.accent;
    }
    if (this.tone) {
      return CartaoGraficoComponent.TONE_ACCENTS[this.tone];
    }

    const coreColor = this.pickColorFromCores();
    if (coreColor) {
      return coreColor;
    }

    return CartaoGraficoComponent.DEFAULT_ACCENT;
  }

  private pickColorFromCores(): string | null {
    if (!this.cores) {
      return null;
    }
    if (typeof this.cores === 'string') {
      return this.cores;
    }
    if (Array.isArray(this.cores)) {
      for (const entry of this.cores) {
        const color = this.extractColor(entry);
        if (color) {
          return color;
        }
      }
    }
    if (this.cores && typeof this.cores === 'object' && !Array.isArray(this.cores)) {
      const color = this.extractColor(this.cores as Record<string, unknown>);
      if (color) {
        return color;
      }
    }
    return null;
  }

  private extractColor(entry: unknown): string | null {
    if (!entry) {
      return null;
    }
    if (typeof entry === 'string') {
      return entry;
    }
    if (typeof entry === 'object') {
      const candidate = (entry as Record<string, unknown>);
      const possibleKeys = ['color', 'from', 'to', 'fillColor'];
      for (const key of possibleKeys) {
        const value = candidate[key];
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    return null;
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
