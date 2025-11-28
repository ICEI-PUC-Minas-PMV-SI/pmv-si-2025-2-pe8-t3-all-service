import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/oauth2/auth.service';
import { TokenService } from './core/oauth2/token.service';
import { ShellComponent } from './layout/shell/shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  template: `<app-shell></app-shell>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private route: Router,
    private http: HttpClient,
    private tokenService: TokenService,
  ) {

  }

  ngOnInit() {
    const code = new URLSearchParams(window.location.search).get('code');
    const token = this.tokenService.getToken();

    if (token) {
      // Já temos token, nada a fazer
      this.authService.completeAuthorization();
      return;
    }

    if (code) {
      // Troca o código pelo token
      this.exchangeCodeForToken(code);
    } else {
      // Nenhum token nem código -> redireciona para login
      this.authService.login();
    }
  }

  exchangeCodeForToken(code: string) {
    // 2. Crie o corpo da requisição com HttpParams
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', 'http://localhost:4200/dashboard'); // ✅ Corrigido: 'redirect_uri' com underscore

    // O seu authorization header decodifica para "frontend-allservice:Allservice2025"
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa('frontend-allservice:Allservice2025')}`,
    });

    this.http.post<TokenResponse>(
      'http://localhost:8080/oauth2/token',
      body.toString(),
      { headers }
    ).subscribe({
      next: (token) => {
        this.tokenService.setToken(token.access_token);
        this.authService.completeAuthorization();
        this.route.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.authService.completeAuthorization();
        if (err.error instanceof ProgressEvent) {
        } else {
        }
      },
      complete: () => console.log('✅ Requisição finalizada')
    });
  }


}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
