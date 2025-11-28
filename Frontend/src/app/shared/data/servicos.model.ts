import { StatusServico as ApiStatusServico, TipoImposto as ApiTipoImposto, TipoPagamento as ApiTipoPagamento } from '../../api/models';

export type StatusServico = ApiStatusServico;

export type TipoPagamento =
  | ApiTipoPagamento
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'TRANSFERENCIA';

export type TipoImposto =
  | ApiTipoImposto
  | 'ISS'
  | 'ICMS'
  | 'PIS'
  | 'COFINS'
  | 'ISENTO';

export interface ServicoRelatorio {
  id: string;
  data: string;
  notaFiscal: string | null;
  valorTotal: number;
  imposto: TipoImposto | null;
  valorImposto: number;
  valorLiquido: number;
  tipoPagamento: TipoPagamento;
  status: StatusServico;
  dataVencimento: string | null;
  empresa: { id: string; nome: string; cnpj: string };
  clienteCertificado: string | null;
  quantidadePecas: number | null;
  descricaoPeca: string | null;
  diametroPeca: number | null;
  larguraPeca: number | null;
  larguraTotalPeca: number | null;
  pesoPeca: number | null;
  rpmPeca: number | null;
  observacao: string | null;
  observacaoInterna: string | null;
  planoUmPermitido: number | null;
  planoDoisPermitido: number | null;
  planoUmEncontrado: number | null;
  planoDoisEncontrado: number | null;
  raioPlanoUm: number | null;
  raioPlanoDois: number | null;
  remanescentePlanoUm: number | null;
  remanescentePlanoDois: number | null;
  usuario: { id: string; nome: string };
  dataCriacao: string;
  dataAtualizacao: string;
  numeroCertificado: string | null;
  ordemServico: string | null;
  giroQuadratico: string | null;
  vendedor: string | null;
  comissaoPercentual: number;
  orcamentoReferencia: string | null;
  assinaturaResponsavel: string | null;
}

export type GrupoChave = 'status' | 'tipoPagamento' | 'empresa' | 'imposto';

export interface GrupoResumo {
  chave: string;
  label: string;
  quantidade: number;
  valorTotal: number;
  valorLiquido: number;
  valorImposto: number;
}

export interface TotaisServicos {
  quantidade: number;
  valorTotal: number;
  valorLiquido: number;
  valorImposto: number;
}

export const STATUS_SERVICO_OPCOES: ReadonlyArray<StatusServico> = [
  'ORCAMENTO',
  'ORDEM_SERVICO',
  'FATURAMENTO',
  'CANCELADO',
  'FINALIZADO',
  'EM_ANALISE',
];

export const TIPOS_PAGAMENTO_OPCOES: ReadonlyArray<TipoPagamento> = [
  'PIX',
  'BOLETO',
  'DINHEIRO',
  'DEPOSITO',
];

export const TIPOS_IMPOSTO_OPCOES: ReadonlyArray<TipoImposto> = [
  'ICMS',
  'ISSQN',
  'ISSQN_RETIDO',
];

export const STATUS_CLASSES: Record<StatusServico, string> = {
  CANCELADO: 'bg-red-100 text-red-700',
  ORCAMENTO: 'bg-sky-100 text-sky-700',
  ORDEM_SERVICO: 'bg-indigo-100 text-indigo-700',
  FATURAMENTO: 'bg-emerald-100 text-emerald-700',
  FINALIZADO: 'bg-green-100 text-green-700',
  EM_ANALISE: 'bg-amber-100 text-amber-700',
};

export function formatarEnum(valor: string | null | undefined): string {
  if (!valor) return '—';
  return valor
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

const round2 = (valor: number) => Math.round(valor * 100) / 100;

export function calcularTotais(servicos: ServicoRelatorio[]): TotaisServicos {
  const totais = servicos.reduce<TotaisServicos>(
    (acc, servico) => ({
      quantidade: acc.quantidade + 1,
      valorTotal: acc.valorTotal + servico.valorTotal,
      valorLiquido: acc.valorLiquido + servico.valorLiquido,
      valorImposto: acc.valorImposto + servico.valorImposto,
    }),
    { quantidade: 0, valorTotal: 0, valorLiquido: 0, valorImposto: 0 }
  );

  return {
    quantidade: totais.quantidade,
    valorTotal: round2(totais.valorTotal),
    valorLiquido: round2(totais.valorLiquido),
    valorImposto: round2(totais.valorImposto),
  };
}

export function agruparServicos(servicos: ServicoRelatorio[], chave: GrupoChave): GrupoResumo[] {
  const mapa = new Map<string, GrupoResumo>();

  servicos.forEach((servico) => {
    let chaveAgrupamento = '';
    let label = '';

    switch (chave) {
      case 'status':
        chaveAgrupamento = servico.status;
        label = formatarEnum(servico.status);
        break;
      case 'tipoPagamento':
        chaveAgrupamento = servico.tipoPagamento;
        label = formatarEnum(servico.tipoPagamento);
        break;
      case 'empresa':
        chaveAgrupamento = servico.empresa.id;
        label = servico.empresa.nome;
        break;
      case 'imposto':
        chaveAgrupamento = servico.imposto ?? 'SEM_IMPOSTO';
        label = servico.imposto ? formatarEnum(servico.imposto) : 'Sem imposto';
        break;
    }

    const existente = mapa.get(chaveAgrupamento);

    if (existente) {
      existente.quantidade += 1;
      existente.valorTotal += servico.valorTotal;
      existente.valorLiquido += servico.valorLiquido;
      existente.valorImposto += servico.valorImposto;
    } else {
      mapa.set(chaveAgrupamento, {
        chave: chaveAgrupamento,
        label,
        quantidade: 1,
        valorTotal: servico.valorTotal,
        valorLiquido: servico.valorLiquido,
        valorImposto: servico.valorImposto,
      });
    }
  });

  return Array.from(mapa.values())
    .map((resumo) => ({
      ...resumo,
      valorTotal: round2(resumo.valorTotal),
      valorLiquido: round2(resumo.valorLiquido),
      valorImposto: round2(resumo.valorImposto),
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal);
}
