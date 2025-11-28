import { Injectable } from '@angular/core';

type DecodedJwt = {
    exp?: number;
    [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class TokenService {
    private readonly storageKey = 'access_token';

    getToken(): string | null {
        return localStorage.getItem(this.storageKey);
    }

    setToken(token: string): void {
        localStorage.setItem(this.storageKey, token);
    }

    clearToken(): void {
        localStorage.removeItem(this.storageKey);
    }

    isExpired(token?: string | null): boolean {
        const value = token ?? this.getToken();
        if (!value) {
            return true;
        }
        const payload = this.decodePayload(value);
        if (!payload?.exp) {
            return false;
        }
        const expiresAt = payload.exp * 1000;
        return Number.isFinite(expiresAt) && Date.now() >= expiresAt;
    }

    getPayload(token?: string | null): DecodedJwt | null {
        const value = token ?? this.getToken();
        if (!value) {
            return null;
        }
        return this.decodePayload(value);
    }

    private decodePayload(token: string): DecodedJwt | null {
        const segments = token.split('.');
        if (segments.length < 2) {
            return null;
        }
        try {
            const normalized = segments[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(
                atob(normalized)
                    .split('')
                    .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(json) as DecodedJwt;
        } catch {
            return null;
        }
    }
}
