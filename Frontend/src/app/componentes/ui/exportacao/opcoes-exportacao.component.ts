import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'as-menu-exportacao',
  standalone: true,
  template: `
    <div class="export-menu">
      <button type="button" class="export-trigger" (click)="alternar()">
        <i class="fas fa-file-export"></i>
        <span>Exportar</span>
        <i class="fas" [class.fa-chevron-up]="aberto()" [class.fa-chevron-down]="!aberto()"></i>
      </button>
      @if (aberto()) {
        <div class="export-dropdown">
          <button type="button" (click)="selecionar('csv')">CSV</button>
          <button type="button" (click)="selecionar('pdf')">PDF</button>
          <button type="button" (click)="selecionar('xlsx')">Excel</button>
          <button type="button" (click)="selecionar('json')">JSON</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .export-menu {
      position: relative;
      display: inline-block;
    }
    .export-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.85rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(16, 185, 129, 0.32);
      background: rgba(255, 255, 255, 0.92);
      color: #047857;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
    }
    .export-trigger:hover {
      border-color: rgba(5, 150, 105, 0.45);
      background: rgba(240, 253, 244, 0.95);
      box-shadow: 0 12px 24px -18px rgba(13, 148, 136, 0.6);
    }
    .export-trigger:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      border-color: rgba(5, 150, 105, 0.65);
    }
    .export-trigger i {
      font-size: 0.9rem;
    }
    .export-trigger i.fa-chevron-up,
    .export-trigger i.fa-chevron-down {
      font-size: 0.75rem;
      opacity: 0.8;
    }
    .export-dropdown {
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      width: 11rem;
      background: #fff;
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 0.85rem;
      box-shadow: 0 18px 36px -24px rgba(7, 89, 76, 0.55);
      z-index: 20;
      padding: 0.4rem 0;
      text-transform: none;
      font-size: 0.85rem;
    }
    .export-dropdown button {
      width: 100%;
      text-align: left;
      padding: 0.55rem 0.95rem;
      background: transparent;
      border: none;
      color: #065f46;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease;
    }
    .export-dropdown button:hover {
      background-color: rgba(236, 253, 245, 0.85);
      color: #047857;
    }
    .export-dropdown button:focus-visible {
      outline: none;
      background-color: rgba(209, 250, 229, 0.9);
    }

    /* Dark theme */
    :host-context([data-theme='dark']) .export-trigger {
      background: rgba(22, 27, 34, 0.92);
      border-color: rgba(52, 211, 153, 0.32);
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) .export-trigger:hover {
      background: rgba(13, 17, 23, 0.95);
      border-color: rgba(52, 211, 153, 0.45);
      box-shadow: 0 12px 24px -18px rgba(52, 211, 153, 0.5);
    }
    :host-context([data-theme='dark']) .export-trigger:focus-visible {
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.25);
      border-color: rgba(52, 211, 153, 0.65);
    }
    :host-context([data-theme='dark']) .export-dropdown {
      background: rgba(22, 27, 34, 0.98);
      border-color: rgba(52, 211, 153, 0.35);
      box-shadow: 0 18px 36px -24px rgba(52, 211, 153, 0.4);
    }
    :host-context([data-theme='dark']) .export-dropdown button {
      color: #a8b4c8;
    }
    :host-context([data-theme='dark']) .export-dropdown button:hover {
      background-color: rgba(52, 211, 153, 0.1);
      color: #6ee7b7;
    }
    :host-context([data-theme='dark']) .export-dropdown button:focus-visible {
      background-color: rgba(52, 211, 153, 0.15);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuExportacaoComponent {
  aberto = signal(false);
  selecionou = output<string>();
  selecionar(tipo: string) { this.selecionou.emit(tipo); this.aberto.set(false); }
  alternar() { this.aberto.set(!this.aberto()); }
}
