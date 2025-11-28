import { DataInsightConfig } from '../../../shared/metrics/metrics-config';

/**
 * Configuração usada pelo `DynamicInsightService` para gerar métricas genéricas de faturas.
 * Sempre que adicionar novos indicadores/gráficos, mantenha esta estrutura syncada com o componente.
 */

type Fatura = { numero:string; cliente:string; servico:string; data:string; valor:string; status:'Paga'|'Pendente'|'Vencida' };

// Helper compartilhado para converter strings formatadas em números.
const parseValor = (v:string)=> {
  const limpo = v.replace(/R\$\s?/,'').replace(/\./g,'').replace(',', '.');
  const n = parseFloat(limpo); return isNaN(n)? 0 : n;
};

export const faturasInsightConfig: DataInsightConfig = {
  entity: 'faturas',
  // Métricas exibidas no painel lateral dos insights dinâmicos.
  metrics: [
    { id:'total', label:'Faturas', compute: rows => ({ value: rows.length }) },
    { id:'pagas', label:'Pagas', compute: rows => ({ value: rows.filter((r:Fatura)=> r.status==='Paga').length }) },
    { id:'pendentes', label:'Pendentes', compute: rows => ({ value: rows.filter((r:Fatura)=> r.status==='Pendente').length }) },
    { id:'vencidas', label:'Vencidas', compute: rows => ({ value: rows.filter((r:Fatura)=> r.status==='Vencida').length }) },
  ],
  // Gráficos alimentados automaticamente pelos dados filtrados.
  charts: [
    {
      id:'mensal', label:'Evolução Mensal', type:'line',
      // Utilize apenas datas ISO (yyyy-MM) para manter compatibilidade com filtros de gráfico do componente.
      build: (rows: Fatura[]) => {
        const mapa: Record<string, number> = {};
        rows.forEach(f=> { const d=f.data.substring(0,7); mapa[d]=(mapa[d]||0)+parseValor(f.valor); });
        const labels = Object.keys(mapa).sort();
        return { series:[{ name:'Valor', data: labels.map(l=> +mapa[l].toFixed(2)) }], xaxis:{ categories: labels }, tooltip:{ y:{ formatter:(v:number)=> 'R$ '+v.toLocaleString('pt-BR',{ minimumFractionDigits:2 }) } } };
      }
    },
    {
      id:'status', label:'Distribuição de Status', type:'donut',
      // Labels precisam bater com o enum usado nos chips (`Fatura['status']`).
      build: (rows: Fatura[]) => {
        const labels: Fatura['status'][] = ['Paga','Pendente','Vencida'];
        const series = labels.map(s=> rows.filter(r=> r.status===s).length);
        const colors = ['#059669','#d97706','#dc2626'];
        return { series, labels, colors, tooltip:{ y:{ formatter:(v:number)=> v+' faturas' } } };
      }
    },
    {
      id:'aging', label:'Aging Pendências', type:'bar',
      // Ajuste buckets aqui e em `FaturasAnalyticsService.agingBuckets` para não gerar discrepâncias.
      build: (rows: Fatura[]) => {
        const hoje = new Date();
        const buckets: Record<string, number> = { 'Atual':0, '1-15':0, '16-30':0, '30+':0 };
        rows.forEach(f=> {
          if (f.status==='Paga') return;
          const d = new Date(f.data+'T00:00:00');
          const diff = Math.floor((hoje.getTime()-d.getTime())/86400000);
          if (diff<=0) buckets['Atual']++; else if (diff<=15) buckets['1-15']++; else if (diff<=30) buckets['16-30']++; else buckets['30+']++;
        });
        const labels = Object.keys(buckets);
        return { series:[{ name:'Qtd', data: labels.map(l=> buckets[l]) }], xaxis:{ categories: labels }, tooltip:{ y:{ formatter:(v:number)=> v+' faturas' } } };
      }
    }
  ]
};
