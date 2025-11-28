import { Injectable } from '@angular/core';
import { BigDecimal, TipoImposto } from '../../api/models';

@Injectable({ providedIn: 'root' })
export class TaxCalculatorService {
  calcular(valorTotal: BigDecimal, imposto: TipoImposto, aliquotaPercent: number) {
    const a = (aliquotaPercent ?? 0) / 100;
    const valorImposto = +((imposto === 'ICMS' || imposto === 'ISSQN' || imposto === 'ISSQN_RETIDO') ? valorTotal * a : 0).toFixed(2);
    const valorLiquido = +(valorTotal - valorImposto).toFixed(2);
    return { valorImposto, valorLiquido };
  }
}
