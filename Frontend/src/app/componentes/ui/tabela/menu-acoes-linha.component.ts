import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface AcaoLinha { id: string; icone: string; titulo: string; variante?: 'perigo' | 'padrao'; }

@Component({
  selector: 'as-menu-acoes-linha',
  standalone: true,
  template: `
  <div class="inline-flex items-center gap-1.5 flex-nowrap" (click)="$event.stopPropagation()">
      @for (acao of acoes(); track acao.id) {
        <button
          type="button"
          [attr.class]="classeParaAcao(acao)"
          (click)="acionar.emit(acao.id)"
          [attr.title]="acao.titulo"
          [attr.aria-label]="acao.titulo">
          <i [class]="acao.icone" class="text-base"></i>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuAcoesLinhaComponent {
  acoes = input<AcaoLinha[]>([]);
  acionar = output<string>();
  readonly classeBotao = 'group inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-200 shadow-[0_4px_12px_-8px_rgba(13,148,136,0.4)]';
  private readonly cores = {
    padrao: 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300',
    ver: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300',
    editar: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300',
    duplicar: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300',
    excluir: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300',
    pdf: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300',
    certificado: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300',
  } as const;

  classeParaAcao(acao: AcaoLinha): string {
    const destaque = acao.variante === 'perigo' ? this.cores.excluir : this.cores[acao.id as keyof typeof this.cores] ?? this.cores.padrao;
    return `${this.classeBotao} ${destaque}`;
  }
}
