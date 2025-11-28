import { Injectable } from '@angular/core';

/**
 * @deprecated O fluxo de clientes agora consome a API real via ClienteDetalheComponent/ClientesComponent.
 * Mantido apenas para compatibilidade eventual até a remoção definitiva.
 */
@Injectable({ providedIn: 'root' })
export class ClientesStore {}
