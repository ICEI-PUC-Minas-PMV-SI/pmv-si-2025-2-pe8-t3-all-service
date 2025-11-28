import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificacaoService } from './notificacao.service';

@Component({
  selector: 'as-central-notificacoes',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 w-72" aria-live="polite" aria-atomic="true">
      @for (notificacao of servico.notificacoes(); track notificacao.id) {
        <div class="rounded-lg shadow px-3 py-2 text-sm flex items-start gap-2 border"
             [class.bg-green-600]="notificacao.tipo==='sucesso'" [class.text-white]="notificacao.tipo==='sucesso'"
             [class.bg-red-600]="notificacao.tipo==='erro'" [class.text-white]="notificacao.tipo==='erro'"
             [class.bg-green-800]="notificacao.tipo==='info'" [class.text-white]="notificacao.tipo==='info'">
          <i class="fas" [class.fa-check-circle]="notificacao.tipo==='sucesso'" [class.fa-times-circle]="notificacao.tipo==='erro'" [class.fa-info-circle]="notificacao.tipo==='info'"></i>
          <div class="flex-1">{{notificacao.mensagem}}</div>
          <button class="opacity-70 hover:opacity-100" (click)="servico.remover(notificacao.id)" aria-label="Fechar"><i class="fas fa-times"></i></button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentralNotificacoesComponent { servico = inject(NotificacaoService); }
