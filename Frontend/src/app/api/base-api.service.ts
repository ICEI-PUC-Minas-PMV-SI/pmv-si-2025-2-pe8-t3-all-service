import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

type RequestOptions = {
  headers?: HttpHeaders | Record<string, string>;
  params?: HttpParams | Record<string, any>;
};

@Injectable({ providedIn: 'root' })
export class BaseApi {
  private http = inject(HttpClient);

  private url(path: string): string {
    const base = (environment.apiBaseUrl || '').replace(/\/$/, '');
    const prefix = environment.apiPrefix || '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${prefix}${p}`;
  }

  get<T>(path: string, params?: Record<string, any>, options?: RequestOptions) {
    const httpParams = this.resolveParams(params, options);
    const headers = this.resolveHeaders(options);
    return this.http.get<T>(this.url(path), { params: httpParams, headers });
  }

  post<T>(path: string, body: any, options?: RequestOptions) {
    const headers = this.resolveHeaders(options);
    const params = this.resolveParams(undefined, options);
    return this.http.post<T>(this.url(path), body, { headers, params });
  }

  put<T>(path: string, body: any, options?: RequestOptions) {
    const headers = this.resolveHeaders(options);
    const params = this.resolveParams(undefined, options);
    return this.http.put<T>(this.url(path), body, { headers, params });
  }

  patch<T>(path: string, body: any, options?: RequestOptions) {
    const headers = this.resolveHeaders(options);
    const params = this.resolveParams(undefined, options);
    return this.http.patch<T>(this.url(path), body, { headers, params });
  }

  delete<T>(path: string, options?: RequestOptions) {
    const headers = this.resolveHeaders(options);
    const params = this.resolveParams(undefined, options);
    return this.http.delete<T>(this.url(path), { headers, params });
  }

  private resolveHeaders(options?: RequestOptions): HttpHeaders | undefined {
    if (!options?.headers) {
      return undefined;
    }
    if (options.headers instanceof HttpHeaders) {
      return options.headers;
    }
    return new HttpHeaders(options.headers);
  }

  private resolveParams(
    params?: Record<string, any>,
    options?: RequestOptions,
  ): HttpParams | undefined {
    if (options?.params instanceof HttpParams) {
      return options.params;
    }

    const merged: Record<string, any> = { ...(params ?? {}) };
    if (options?.params && !(options.params instanceof HttpParams)) {
      Object.assign(merged, options.params);
    }

    const entries = Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== '');
    if (entries.length === 0) {
      return undefined;
    }
    return new HttpParams({ fromObject: Object.fromEntries(entries) as any });
  }
}
