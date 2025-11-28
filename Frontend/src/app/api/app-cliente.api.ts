import { Injectable, inject } from '@angular/core';
import { BaseApi } from './base-api.service';
import { AppCliente } from './models';

@Injectable({ providedIn: 'root' })
export class AppClienteApi {
  private api = inject(BaseApi);
  private base = '/app/cliente';

  get(id: string) {
    return this.api.get<AppCliente>(`${this.base}/${id}`);
  }

  create(payload: AppCliente) {
    return this.api.post<void>(this.base, payload);
  }
}
