import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/oauth2/auth.service';
import { ThemeService } from '../../shared/theme/theme.service';

type TipoAcesso = 'administrador' | 'geral';

type ItemMenu = {
  titulo: string;
  icone: string;
  rota: string;
  exato?: boolean;
  acesso: TipoAcesso;
};

type SecaoMenu = {
  titulo: string;
  itens: ItemMenu[];
};

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './barra-lateral.component.html',
  styleUrls: ['./barra-lateral.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraLateralComponent {

  constructor(private authService: AuthService,) {

  }


  recolhida = input(false);
  alternar = output<void>();

  readonly themeService = inject(ThemeService);

  readonly secoes: SecaoMenu[] = [
    {
      titulo: 'Seção Principal',
      itens: [
        { titulo: 'Resumo', icone: 'fas fa-gauge-high', rota: '/dashboard', exato: true, acesso: 'administrador' },
        { titulo: 'Faturamento', icone: 'fas fa-file-invoice-dollar', rota: '/faturas', exato: true, acesso: 'geral' },
        { titulo: 'Ordens de serviço', icone: 'fas fa-list-check', rota: '/ordens', exato: true, acesso: 'geral' },
        { titulo: 'Clientes', icone: 'fas fa-people-group', rota: '/clientes', exato: true, acesso: 'geral' },
      ],
    },
    {
      titulo: 'Relatórios',
      itens: [
        { titulo: 'Relatórios', icone: 'fas fa-chart-line', rota: '/relatorios/servicos', acesso: 'geral' },
        { titulo: 'Usuários', icone: 'fas fa-users-gear', rota: '/usuarios', exato: true, acesso: 'administrador' },
      ],
    },
    {
      titulo: 'Diversos',
      itens: [
        { titulo: 'Conta', icone: 'fas fa-user-circle', rota: '/conta', acesso: 'geral' },
      ],
    },
  ];

  sairSistema(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
