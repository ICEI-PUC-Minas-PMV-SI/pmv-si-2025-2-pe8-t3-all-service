import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BotaoComponent } from '../../componentes/ui/botao/botao.component';
import { HeaderService } from '../header.service';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [BotaoComponent],
  template: `
  <header class="barra-superior">
    <div class="min-w-0">
      <h1 class="barra-superior__titulo" [title]="titulo()">{{ titulo() }}</h1>
    </div>

    @if (pesquisa()) {
      <div class="flex-1 flex justify-center">
        <label class="barra-superior__busca">
          <i class="fas fa-search barra-superior__busca-icone"></i>
          <input
            type="search"
            class="barra-superior__busca-input"
            [attr.aria-label]="pesquisa()!.ariaLabel || pesquisa()!.placeholder || 'Buscar'"
            [placeholder]="pesquisa()!.placeholder || 'Buscar'"
            [value]="valorPesquisa()"
            (input)="atualizarPesquisa($any($event.target).value)"
            (keyup.enter)="submeterPesquisa()"
          />
        </label>
      </div>
    } @else {
      <div class="flex-1 hidden md:block"></div>
    }

    @if (acoes().length > 0) {
      <div class="flex items-center gap-2">
        @for (acao of acoes(); track trackAcao($index, acao)) {
          <span [class]="acao.className || ''">
            <as-botao
              [variante]="acao.variant || 'secundario'"
              [iconeEsquerda]="acao.icon"
              (click)="acao.execute()"
              [desabilitado]="acaoDesabilitada(acao)"
            >{{ acao.label }}</as-botao>
          </span>
        }
      </div>
    } @else {
      <div class="barra-superior__versao">v0.1.0 • Demo</div>
    }
  </header>
  `,
  styleUrls: ['./barra-superior.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraSuperiorComponent {
  private readonly header = inject(HeaderService);
  private readonly router = inject(Router);

  titulo = computed(() => this.header.title());
  acoes = computed(() => this.header.actions());
  pesquisa = computed(() => this.header.search());
  valorPesquisa = computed(() => this.pesquisa()?.value ?? '');

  trackAcao = (_: number, a: any) => a.id || a.label;
  acaoDesabilitada(a: any) { return typeof a.disabled === 'function' ? a.disabled() : !!a.disabled; }

  atualizarPesquisa(valor: string) {
    const config = this.header.search();
    if (!config) return;
    if (config.value !== valor) {
      this.header.patchSearch({ value: valor });
    }
    config.onChange?.(valor);
  }

  submeterPesquisa() {
    const config = this.header.search();
    if (!config) return;
    const valor = config.value ?? '';
    config.onSubmit?.(valor);
  }

  constructor() {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) this.header.setTitleForPath(ev.urlAfterRedirects);
    });
  }
}
