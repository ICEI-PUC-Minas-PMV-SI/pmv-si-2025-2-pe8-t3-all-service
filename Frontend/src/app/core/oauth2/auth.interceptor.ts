import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenService = inject(TokenService);
    const authService = inject(AuthService);
    const token = tokenService.getToken();
    const shouldAttach = Boolean(token) && !req.headers.has('Authorization');
    const request = shouldAttach
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && shouldHandleUnauthorized(error)) {
                tokenService.clearToken();
                authService.login();
            }
            return throwError(() => error);
        }),
    );
};

const shouldHandleUnauthorized = (error: HttpErrorResponse): boolean => {
    if (!error.url) {
        return true;
    }
    return !error.url.includes('/oauth2/token') && !error.url.includes('/oauth2/authorize');
};
