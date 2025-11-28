/**
 * Ponto de entrada da aplicação Angular (standalone).
 *
 * Use este arquivo para registrar novas rotas ou providers globais:
 * - Adicione componentes standalone diretamente em `provideRouter`.
 * - Habilite `withInMemoryScrolling`/guards adicionais aqui.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';

// Páginas - Principal
import { ClienteDetalheComponent } from './app/paginas/principal/clientes/cliente-detalhe.component';
import { ClientesComponent } from './app/paginas/principal/clientes/clientes.component';
import { DashboardComponent } from './app/paginas/principal/dashboard/dashboard.component';
import { FaturasComponent } from './app/paginas/principal/faturas/faturas.component';
import { OrdensComponent } from './app/paginas/principal/ordens/ordens.component';
import { ServicoDetalheComponent } from './app/paginas/principal/servicos/servico-detalhe.component';

// Páginas - Relatórios

import { RelatoriosComponent } from './app/paginas/relatorios/relatorios.component';
import { RelatoriosServicosComponent } from './app/paginas/relatorios/servicos/relatorios-servicos.component';

// Páginas - Conta
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AuthInterceptor } from './app/api/auth.interceptor';
import { authGuard } from './app/core/oauth2/auth.guard';
import { UsuariosComponent } from './app/paginas/admin/usuarios/usuarios.component';
import { ContaComponent } from './app/paginas/conta/conta.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([
        (req, next) => inject(AuthInterceptor).handle(req, next),
      ])
    ),
    importProvidersFrom(OAuthModule.forRoot()),
    provideRouter(
      [
        // Cada rota aponta para um componente standalone.
        // Para criar uma nova página:
        // 1. Gere o componente em `src/app/paginas/...` com `standalone: true`.
        // 2. Declare aqui com `component: NovoComponente` e, se necessário, `canActivate`.
        // 3. Atualize `HeaderService.setTitleForPath` para o título automático.
        // Rotas principais
        { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
        { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], },
        { path: 'faturas', component: FaturasComponent, canActivate: [authGuard], },
        { path: 'ordens', component: OrdensComponent, canActivate: [authGuard], },
        { path: 'clientes/novo', component: ClienteDetalheComponent, canActivate: [authGuard], },
        { path: 'clientes/:id/editar', component: ClienteDetalheComponent, canActivate: [authGuard], },
        { path: 'clientes/:id', component: ClienteDetalheComponent, canActivate: [authGuard], },
        { path: 'clientes', component: ClientesComponent, canActivate: [authGuard], },
        // Serviços
        { path: 'servicos/novo', component: ServicoDetalheComponent, canActivate: [authGuard], },
        { path: 'servicos/:id/editar', component: ServicoDetalheComponent, canActivate: [authGuard], },
        { path: 'servicos/:id', component: ServicoDetalheComponent, canActivate: [authGuard], },
        { path: 'servicos', pathMatch: 'full', redirectTo: 'ordens' },

        // Relatórios
        {
          path: 'relatorios',
          component: RelatoriosComponent,
          children: [
            { path: '', pathMatch: 'full', redirectTo: 'servicos' },
            { path: 'servicos', component: RelatoriosServicosComponent, canActivate: [authGuard], },
          ],
          canActivate: [authGuard],
        },

        // Conta do usuário
        { path: 'conta', component: ContaComponent, canActivate: [authGuard], },
        { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard], },

        // Rota de fallback
        { path: '**', redirectTo: 'dashboard' },
      ],
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
  ],
});
