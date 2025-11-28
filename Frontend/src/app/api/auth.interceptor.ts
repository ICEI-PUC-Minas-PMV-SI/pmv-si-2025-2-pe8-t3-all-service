import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHandlerFn,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../core/oauth2/auth.service';
import { TokenService } from '../core/oauth2/token.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.forward((request) => next.handle(request), req);
  }

  handle(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    return this.forward(next, req);
  }

  private forward(
    next: (request: HttpRequest<any>) => Observable<HttpEvent<any>>,
    req: HttpRequest<any>,
  ): Observable<HttpEvent<any>> {
    return next(this.enrich(req)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.shouldHandleUnauthorized(error)) {
          this.tokenService.clearToken();
          this.authService.login();
        }
        return throwError(() => error);
      }),
    );
  }

  private enrich(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenService.getToken();
    if (!token || req.headers.has('Authorization')) {
      return req;
    }
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private shouldHandleUnauthorized(error: HttpErrorResponse): boolean {
    const url = error.url ?? '';
    return !url.includes('/oauth2/token') && !url.includes('/oauth2/authorize');
  }
}
