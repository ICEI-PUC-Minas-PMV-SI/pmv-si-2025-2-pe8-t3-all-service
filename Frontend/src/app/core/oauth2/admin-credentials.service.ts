import { Injectable } from '@angular/core';

/**
 * Mantido apenas para compatibilidade: a lógica de escalonamento de credenciais
 * administrativas foi removida e as chamadas privilegiadas agora dependem do
 * próprio token JWT do usuário autenticado. Este serviço permanece como stub
 * para evitar impactos em outros módulos que possam referenciá-lo indiretamente.
 */
@Injectable({ providedIn: 'root' })
export class AdminCredentialsService {
  ensureAuthorization(): Promise<null> {
    return Promise.resolve(null);
  }

  clear(): Promise<void> {
    return Promise.resolve();
  }
}
