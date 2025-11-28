import { Injectable, computed, signal } from '@angular/core';

export type FaturaLike = { numero:string; cliente:string; servico:string; data:string; valor:string; status:'Paga'|'Pendente'|'Vencida'};

/**
 * Serviço reativo para métricas rápidas das faturas atualmente filtradas.
 *
 * Mantenha todo cálculo derivado aqui para evitar duplicidade no componente.
 * Sempre converta valores para número usando `parseValor` antes de gerar novas métricas.
 */
@Injectable({ providedIn: 'root' })
export class FaturasAnalyticsService {
  private _fonte = signal<FaturaLike[]>([]);
  /** Atualize a fonte (geralmente `filtradas()` do componente) para recalcular as métricas em tempo real. */
  setFonte(faturas: FaturaLike[]) { this._fonte.set(faturas); }

  /** Converte valores formatados (R$) para número decimal confiável. */
  private parseValor(v: string): number {
    // exemplos: "R$ 1.500,00" ou "R$ 1500,00" ou "R$ 1500,25"
    const limpo = v.replace(/R\$\s?/,'').replace(/\./g,'').replace(',','.');
    const num = parseFloat(limpo); return isNaN(num) ? 0 : num;
  }

  total = computed(()=> this._fonte().length);
  totalValor = computed(()=> this._fonte().reduce((acc,f)=> acc + this.parseValor(f.valor),0));
  pagas = computed(()=> this._fonte().filter(f=>f.status==='Paga').length);
  pendentes = computed(()=> this._fonte().filter(f=>f.status==='Pendente').length);
  vencidas = computed(()=> this._fonte().filter(f=>f.status==='Vencida').length);

  valorMedio = computed(()=> {
    const t = this.total();
    return t? this.totalValor()/t : 0;
  });

  distribuicaoStatus = computed(()=> ([
    { status:'Paga', quantidade: this.pagas() },
    { status:'Pendente', quantidade: this.pendentes() },
    { status:'Vencida', quantidade: this.vencidas() },
  ]));

  /** Totais mensais (valor) considerando ano da própria data das faturas. */
  mensalValor = computed(()=> {
    const mapa: Record<string, number> = {};
    for (const f of this._fonte()) {
      const d = new Date(f.data + 'T00:00:00');
      if (isNaN(d.getTime())) continue;
      const chave = d.getFullYear()+ '-' + String(d.getMonth()+1).padStart(2,'0');
      const v = this.parseValor(f.valor);
      mapa[chave] = (mapa[chave]||0) + v;
    }
    // ordenar por chave (ano-mes)
    return Object.entries(mapa).sort(([a],[b])=> a.localeCompare(b)).map(([k,total])=> ({ mes:k, total }));
  });

  /** Aging buckets para pendentes ou vencidas; ajuste faixas se o negócio mudar. */
  agingBuckets = computed(()=> {
    const hoje = new Date();
    const buckets: Record<string, number> = { 'Atual':0, '1-15':0, '16-30':0, '30+':0 };
    for (const f of this._fonte()) {
      if (f.status==='Paga') continue;
      const d = new Date(f.data + 'T00:00:00');
      const diffDias = Math.floor((hoje.getTime()-d.getTime())/86400000);
      if (diffDias <= 0) buckets['Atual']++; else if (diffDias<=15) buckets['1-15']++; else if (diffDias<=30) buckets['16-30']++; else buckets['30+']++;
    }
    return Object.entries(buckets).map(([bucket, quantidade])=> ({ bucket, quantidade }));
  });
}
