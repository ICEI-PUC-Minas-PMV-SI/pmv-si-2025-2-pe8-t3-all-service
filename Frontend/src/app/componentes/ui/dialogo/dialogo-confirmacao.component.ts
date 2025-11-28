import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BotaoComponent } from '../botao/botao.component';
import { DialogoService } from './dialogo.service';

@Component({
  selector: 'as-dialogo-confirmacao',
  standalone: true,
  imports: [BotaoComponent],
  template: `
    @if (servico.estadoConfirmacao()) {
      <div class="fixed inset-0 z-40 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" aria-hidden="true"></div>
        <div class="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 space-y-4 z-10">
          <h2 class="text-lg font-semibold text-green-800">{{ servico.estadoConfirmacao()!.titulo || 'Confirmar' }}</h2>
          <p class="text-sm text-green-700">{{ servico.estadoConfirmacao()!.mensagem || 'Tem certeza?' }}</p>
          <div class="flex justify-end gap-2">
            <as-botao variante="fantasma" (click)="servico.responder(false)">{{ servico.estadoConfirmacao()!.cancelar || 'Cancelar' }}</as-botao>
            <as-botao variante="primario" iconeEsquerda="fas fa-check" (click)="servico.responder(true)">{{ servico.estadoConfirmacao()!.confirmar || 'Confirmar' }}</as-botao>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogoConfirmacaoComponent { servico = inject(DialogoService); }
