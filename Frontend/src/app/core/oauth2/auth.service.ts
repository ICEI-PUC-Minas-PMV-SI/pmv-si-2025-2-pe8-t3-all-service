import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { TokenService } from './token.service';

const authConfig: AuthConfig = {
    // URL base do servidor de autenticação
    loginUrl: 'http://localhost:8080/oauth2/authorize',

    // URL do recurso protegido (caso precise)
    tokenEndpoint: 'http://localhost:8080/oauth2/token',

    // ID do cliente registrado
    clientId: 'frontend-allservice', // ✅ igual ao backend

    // Onde o usuário será redirecionado após o login
    redirectUri: 'http://localhost:4200/dashboard',

    scope: 'MASTER',

    // Tipo de resposta (flow)
    responseType: 'code', // ou 'token', dependendo da config do backend

    // Desabilitar discovery document
    disableAtHashCheck: true,
    oidc: false, // 👈 IMPORTANTE: você não está usando OpenID Connect
};

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private authorizing = false;

    constructor(
        private oauthService: OAuthService,
        private tokenService: TokenService,
    ) {
        this.oauthService.configure(authConfig);
        // this.oauthService.loadDiscoveryDocumentAndTryLogin(); // ❌ NÃO usar neste caso
    }

    login() {
        if (this.authorizing) {
            return;
        }
        this.authorizing = true;
        const authUrl = `http://localhost:8080/oauth2/authorize?response_type=code&client_id=frontend-allservice&scope=MASTER&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fdashboard&continue`;
        window.location.href = authUrl;
    }

    logout() {
        this.tokenService.clearToken();
        localStorage.removeItem('refresh_token');
        sessionStorage.clear();
        this.authorizing = false;
        window.location.href = 'http://localhost:8080/logout';
    }

    get accessToken() {
        return this.tokenService.getToken();
    }

    async isAuthenticated(): Promise<boolean> {
        const token = this.tokenService.getToken();
        if (!token) {
            return false;
        }
        if (this.tokenService.isExpired(token)) {
            this.tokenService.clearToken();
            this.authorizing = false;
            return false;
        }
        return true;
    }

    isAuthorizing(): boolean {
        return this.authorizing;
    }

    completeAuthorization(): void {
        this.authorizing = false;
    }

}
