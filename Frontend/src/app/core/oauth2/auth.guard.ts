import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const hasAuthorizationCode = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).has('code');

    if (hasAuthorizationCode) {
        return true;
    }

    return authService.isAuthenticated().then((authenticated) => {
        if (!authenticated && !authService.isAuthorizing()) {
            authService.login();
        }
        return authenticated || authService.isAuthorizing();
    });
};
