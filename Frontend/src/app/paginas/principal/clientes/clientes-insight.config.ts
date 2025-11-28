import { DataInsightConfig } from '../../../shared/metrics/metrics-config';

export type ContatoSetor =
  | 'FINANCEIRO'
  | 'MANUTENCAO'
  | 'COMERCIAL'
  | 'VENDAS'
  | 'COMPRAS'
  | 'JURIDICO'
  | 'OPERACIONAL'
  | 'ADMINISTRACAO'
  | 'FISCAL'
  | 'RH'
  | 'LOGISTICA';

export interface Contato {
  id: string;
  idEmpresa: string;
  idUsuario: string;
  responsavel: string;
  setor: ContatoSetor;
  telefone: string;
  email: string;
}

export interface Cliente {
  id: string;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  idUsuario: string;
  // Optional legacy fields for insights only
  categoria?: 'Industria'|'Comercio'|'Servico'|'Outro';
  cidade?: string;
  uf?: string;
  ativo?: boolean;
  faturamento12m?: number;
  contatos?: Contato[];
}

export const clientesInsightConfig: DataInsightConfig = {
  entity: 'clientes',
  metrics: [
    { 
      id:'total', 
      label:'Empresas', 
      compute: rows => ({ 
        value: rows.length,
        description: 'Total na carteira',
        trend: 'flat' as const
      }) 
    },
    { 
      id:'ativos', 
      label:'Ativos', 
      compute: rows => {
        const ativos = rows.filter((r:Cliente)=> r.ativo).length;
        const percentual = rows.length > 0 ? (ativos / rows.length * 100).toFixed(1) : '0';
        return { 
          value: ativos,
          description: `${percentual}% do total`,
          trend: 'up' as const
        };
      }
    },
    { 
      id:'industria', 
      label:'Indústria', 
      compute: rows => {
        const industria = rows.filter((r:Cliente)=> r.categoria==='Industria').length;
        const percentual = rows.length > 0 ? (industria / rows.length * 100).toFixed(1) : '0';
        return { 
          value: industria,
          description: `${percentual}% por categoria`,
          trend: 'flat' as const
        };
      }
    },
    { 
      id:'inativos', 
      label:'Inativos', 
      compute: rows => {
        const inativos = rows.filter((r:Cliente)=> r.ativo === false).length;
        const percentual = rows.length > 0 ? (inativos / rows.length * 100).toFixed(1) : '0.0';
        const trend = inativos > 0 ? 'down' : 'flat';
        return { 
          value: inativos,
          description: `${percentual}% do total`,
          trend
        };
      }
    },
  ],
  charts: []
};
