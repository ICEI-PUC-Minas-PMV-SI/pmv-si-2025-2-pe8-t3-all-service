import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'as-atalho-conta',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <div class="flex items-center gap-3">
      <!-- avatar com fallback -->
      @if (avatarUrl()) {
        <img
          ngSrc="{{ avatarUrl()! }}"
          width="40" height="40" alt="Foto do perfil"
          class="rounded-full ring-2 ring-green-200"
        />
      } @else {
        <div
          class="rounded-full w-10 h-10 flex items-center justify-center bg-green-100 text-green-700 font-semibold ring-2 ring-green-200"
          [attr.aria-label]="'Avatar com iniciais de ' + nome()"
        >
          {{ iniciais }}
        </div>
      }

      <!-- nome + email -->
      <div class="min-w-0">
        <p class="text-sm font-medium text-green-900 truncate">{{ nome() }}</p>
        <p class="text-xs text-green-600 truncate">{{ email() }}</p>
      </div>

      <!-- ações -->
      <div class="ml-auto flex items-center gap-2">
        <button type="button" class="px-2 py-1 rounded text-green-700 hover:bg-green-50 text-xs"
                (click)="abrirConta.emit()" aria-label="Abrir conta">
          <i class="fas fa-user-cog"></i>
        </button>
        <button type="button" class="px-2 py-1 rounded text-red-700 hover:bg-red-50 text-xs"
                (click)="sair.emit()" aria-label="Sair">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtalhoContaComponent {
  nome = input<string>('Usuário');
  email = input<string>('usuario@empresa.com');
  /** Caminho/URL da foto. Ex.: 'assets/perfis/victor.jpg' */
  avatarUrl = input<string | undefined>();

  abrirConta = output<void>();
  sair = output<void>();

  get iniciais(): string {
    const n = (this.nome() ?? '').trim();
    if (!n) return 'U';
    const partes = n.split(/\s+/);
    const a = partes[0]?.[0] ?? '';
    const b = partes.length > 1 ? partes.at(-1)![0] ?? '' : '';
    return (a + b).toUpperCase();
  }
}
