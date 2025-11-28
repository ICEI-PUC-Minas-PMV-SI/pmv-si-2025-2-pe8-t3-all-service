export type StatusServico =
  | 'ORCAMENTO'
  | 'ORDEM_SERVICO'
  | 'FATURAMENTO'
  | 'CANCELADO'
  | 'FINALIZADO'
  | 'EM_ANALISE';

export type TipoPagamento =
  | 'PIX'
  | 'BOLETO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'TRANSFERENCIA'
  | 'DINHEIRO'
  | 'DEPOSITO';

export type TipoImposto = 'ISS' | 'ICMS' | 'PIS' | 'COFINS' | 'ISENTO' | 'ISSQN' | 'ISSQN_RETIDO';

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

type PlanoMedicao = {
  permitido: number | null;
  encontrado: number | null;
  raio: number | null;
  remanescente: number | null;
};

interface ServicoSeed {
  data: string;
  dataVencimento: string | null;
  notaFiscal: string | null;
  empresaIdx: number;
  status: StatusServico;
  tipoPagamento: TipoPagamento;
  tipoImposto: TipoImposto | null;
  aliquota?: number;
  valor: number;
  cliente: string | null;
  descricao: string | null;
  pecas: number | null;
  diametro: number | null;
  largura: number | null;
  larguraTotal: number | null;
  peso: number | null;
  rpm: number | null;
  observacao: string | null;
  observacaoInterna: string | null;
  planoUm: PlanoMedicao;
  planoDois: PlanoMedicao;
  usuarioIdx: number;
}

const STATUS_SERVICO: StatusServico[] = [
  'ORCAMENTO',
  'ORDEM_SERVICO',
  'FATURAMENTO',
  'FATURAMENTO',
  'FINALIZADO',
  'CANCELADO',
  'ORCAMENTO',
  'ORDEM_SERVICO',
  'FATURAMENTO',
  'FINALIZADO',
  'EM_ANALISE',
];

const TIPOS_PAGAMENTO: TipoPagamento[] = [
  'PIX',
  'BOLETO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'TRANSFERENCIA',
  'DINHEIRO',
  'DEPOSITO',
];

const TIPOS_IMPOSTO: TipoImposto[] = ['ISS', 'ICMS', 'PIS', 'COFINS', 'ISENTO', 'ISSQN', 'ISSQN_RETIDO'];

const EMPRESAS = [
  { id: 'empresa-01', nome: 'Metalúrgica Horizonte', cnpj: '12.345.678/0001-90' },
  { id: 'empresa-02', nome: 'Precision Labs Brasil', cnpj: '45.987.654/0001-22' },
  { id: 'empresa-03', nome: 'Engenharia Sul Sistemas', cnpj: '78.321.654/0001-45' },
  { id: 'empresa-04', nome: 'Montagens Industriais Alpha', cnpj: '03.555.777/0001-08' },
];

const USUARIOS = [
  { id: 'usr-ana', nome: 'Ana Ribeiro' },
  { id: 'usr-joao', nome: 'João Martins' },
  { id: 'usr-luiza', nome: 'Luiza Mota' },
  { id: 'usr-andre', nome: 'André Vasques' },
];

const VENDEDORES = ['Marina Lopes', 'Ricardo Azevedo', 'Juliana Torres', 'Felipe Duarte'];
const ASSINATURAS = ['M. Lopes', 'R. Azevedo', 'J. Torres', 'F. Duarte'];

const round2 = (valor: number) => Math.round(valor * 100) / 100;
const uuidFromIndex = (index: number) =>
  `00000000-0000-4000-8000-${(index + 1).toString().padStart(12, '0')}`;

const seeds: ServicoSeed[] = [
  {
    data: '2024-01-12',
    dataVencimento: '2024-01-30',
    notaFiscal: 'NF-2024-0001',
    empresaIdx: 0,
    status: 'FINALIZADO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 18450.75,
    cliente: 'Companhia Sideral',
    descricao: 'Revestimento anticorrosivo em rotores',
    pecas: 12,
    diametro: 45.5,
    largura: 12.3,
    larguraTotal: 48.2,
    peso: 128.5,
    rpm: 1450,
    observacao: 'Inspeção final aprovada.',
    observacaoInterna: 'Entregar certificado digital.',
    planoUm: { permitido: 0.08, encontrado: 0.07, raio: 0.58, remanescente: 0.01 },
    planoDois: { permitido: 0.06, encontrado: 0.05, raio: 0.54, remanescente: 0.02 },
    usuarioIdx: 0,
  },
  {
    data: '2024-01-28',
    dataVencimento: '2024-02-12',
    notaFiscal: 'NF-2024-0002',
    empresaIdx: 1,
    status: 'FATURAMENTO',
    tipoPagamento: 'BOLETO',
    tipoImposto: 'ICMS',
    aliquota: 0.07,
    valor: 23580.9,
    cliente: 'Refinaria Atlântico',
    descricao: 'Calibração de sensores de pressão',
    pecas: 24,
    diametro: 18.9,
    largura: 8.2,
    larguraTotal: 21.5,
    peso: 84.1,
    rpm: 0,
    observacao: 'Aguardando confirmação financeira.',
    observacaoInterna: 'Cobrar adiantamento de 30%.',
    planoUm: { permitido: 0.06, encontrado: 0.06, raio: 0.4, remanescente: 0.0 },
    planoDois: { permitido: 0.05, encontrado: 0.05, raio: 0.37, remanescente: 0.0 },
    usuarioIdx: 1,
  },
  {
    data: '2024-02-10',
    dataVencimento: '2024-02-25',
    notaFiscal: 'NF-2024-0003',
    empresaIdx: 2,
    status: 'ORDEM_SERVICO',
    tipoPagamento: 'TRANSFERENCIA',
    tipoImposto: 'PIS',
    aliquota: 0.0165,
    valor: 9870.4,
    cliente: 'Energia Limpa S/A',
    descricao: 'Retrofit de painéis de controle',
    pecas: 8,
    diametro: 22.4,
    largura: 10.1,
    larguraTotal: 29.1,
    peso: 62.5,
    rpm: 0,
    observacao: 'Equipe de campo mobilizada.',
    observacaoInterna: 'Planejar turno extra.',
    planoUm: { permitido: 0.07, encontrado: 0.06, raio: 0.49, remanescente: 0.01 },
    planoDois: { permitido: 0.05, encontrado: 0.04, raio: 0.45, remanescente: 0.01 },
    usuarioIdx: 2,
  },
  {
    data: '2024-03-05',
    dataVencimento: '2024-03-20',
    notaFiscal: 'NF-2024-0004',
    empresaIdx: 0,
    status: 'FATURAMENTO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 27840.0,
    cliente: 'Porto Soluções Logísticas',
    descricao: 'Manutenção em ponte rolante',
    pecas: 14,
    diametro: 38.2,
    largura: 15.6,
    larguraTotal: 46.0,
    peso: 142.3,
    rpm: 900,
    observacao: 'Emitida NF para pagamento imediato.',
    observacaoInterna: 'Incluir laudo fotográfico.',
    planoUm: { permitido: 0.09, encontrado: 0.08, raio: 0.63, remanescente: 0.01 },
    planoDois: { permitido: 0.07, encontrado: 0.06, raio: 0.6, remanescente: 0.01 },
    usuarioIdx: 0,
  },
  {
    data: '2024-03-22',
    dataVencimento: '2024-04-04',
    notaFiscal: 'NF-2024-0005',
    empresaIdx: 3,
    status: 'FINALIZADO',
    tipoPagamento: 'CARTAO_CREDITO',
    tipoImposto: 'COFINS',
    aliquota: 0.03,
    valor: 15230.55,
    cliente: 'Montadora Fênix',
    descricao: 'Ajuste dimensional em eixos',
    pecas: 18,
    diametro: 19.5,
    largura: 7.4,
    larguraTotal: 23.2,
    peso: 45.9,
    rpm: 1200,
    observacao: 'Entrega realizada conforme cronograma.',
    observacaoInterna: 'Registrar feedback do cliente.',
    planoUm: { permitido: 0.06, encontrado: 0.05, raio: 0.5, remanescente: 0.01 },
    planoDois: { permitido: 0.05, encontrado: 0.04, raio: 0.46, remanescente: 0.01 },
    usuarioIdx: 3,
  },
  {
    data: '2024-04-18',
    dataVencimento: '2024-05-05',
    notaFiscal: null,
    empresaIdx: 1,
    status: 'CANCELADO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISENTO',
    aliquota: 0,
    valor: 12500.0,
    cliente: 'Química Vale Azul',
    descricao: 'Revisão de reatores químicos',
    pecas: 0,
    diametro: null,
    largura: null,
    larguraTotal: null,
    peso: null,
    rpm: null,
    observacao: 'Cancelado por alteração de escopo.',
    observacaoInterna: 'Reprogramar visita comercial.',
    planoUm: { permitido: null, encontrado: null, raio: null, remanescente: null },
    planoDois: { permitido: null, encontrado: null, raio: null, remanescente: null },
    usuarioIdx: 1,
  },
  {
    data: '2024-05-02',
    dataVencimento: '2024-05-30',
    notaFiscal: 'NF-2024-0006',
    empresaIdx: 2,
    status: 'ORCAMENTO',
    tipoPagamento: 'TRANSFERENCIA',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 16890.32,
    cliente: 'Solaris Energia',
    descricao: 'Instalação de linha robotizada',
    pecas: 10,
    diametro: 30.0,
    largura: 12.0,
    larguraTotal: 36.0,
    peso: 80.4,
    rpm: 0,
    observacao: 'Aguardando kickoff com cliente.',
    observacaoInterna: 'Garantir disponibilidade de equipe elétrica.',
    planoUm: { permitido: 0.07, encontrado: null, raio: null, remanescente: null },
    planoDois: { permitido: 0.05, encontrado: null, raio: null, remanescente: null },
    usuarioIdx: 2,
  },
  {
    data: '2024-06-16',
    dataVencimento: '2024-07-01',
    notaFiscal: 'NF-2024-0007',
    empresaIdx: 0,
    status: 'ORDEM_SERVICO',
    tipoPagamento: 'BOLETO',
    tipoImposto: 'ICMS',
    aliquota: 0.07,
    valor: 21450.77,
    cliente: 'AgroMaq Center',
    descricao: 'Usinagem de componentes agrícolas',
    pecas: 20,
    diametro: 25.5,
    largura: 9.4,
    larguraTotal: 27.5,
    peso: 66.7,
    rpm: 1100,
    observacao: 'Processo em fase de usinagem fina.',
    observacaoInterna: 'Reduzir vibração do torno principal.',
    planoUm: { permitido: 0.08, encontrado: 0.07, raio: 0.58, remanescente: 0.01 },
    planoDois: { permitido: 0.06, encontrado: 0.05, raio: 0.5, remanescente: 0.01 },
    usuarioIdx: 0,
  },
  {
    data: '2024-07-08',
    dataVencimento: '2024-07-25',
    notaFiscal: 'NF-2024-0008',
    empresaIdx: 3,
    status: 'FATURAMENTO',
    tipoPagamento: 'CARTAO_DEBITO',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 19480.12,
    cliente: 'Termomecânica Ar',
    descricao: 'Balanceamento de turbinas industriais',
    pecas: 6,
    diametro: 52.0,
    largura: 14.6,
    larguraTotal: 60.4,
    peso: 210.3,
    rpm: 1750,
    observacao: 'Aguardando compensação bancária.',
    observacaoInterna: 'Garantir disponibilidade de laudo vibracional.',
    planoUm: { permitido: 0.09, encontrado: 0.08, raio: 0.64, remanescente: 0.01 },
    planoDois: { permitido: 0.07, encontrado: 0.06, raio: 0.6, remanescente: 0.01 },
    usuarioIdx: 3,
  },
  {
    data: '2024-08-19',
    dataVencimento: '2024-09-05',
    notaFiscal: 'NF-2024-0009',
    empresaIdx: 1,
    status: 'FINALIZADO',
    tipoPagamento: 'PIX',
    tipoImposto: 'COFINS',
    aliquota: 0.03,
    valor: 28640.98,
    cliente: 'BioSteel Latin America',
    descricao: 'Tratamento térmico em lotes seriados',
    pecas: 32,
    diametro: 16.4,
    largura: 6.8,
    larguraTotal: 19.6,
    peso: 58.9,
    rpm: 0,
    observacao: 'Cliente solicitou entrega antecipada.',
    observacaoInterna: 'Agendar transporte especial.',
    planoUm: { permitido: 0.06, encontrado: 0.05, raio: 0.47, remanescente: 0.01 },
    planoDois: { permitido: 0.05, encontrado: 0.04, raio: 0.44, remanescente: 0.01 },
    usuarioIdx: 1,
  },
  {
    data: '2024-09-27',
    dataVencimento: '2024-10-12',
    notaFiscal: 'NF-2024-0010',
    empresaIdx: 2,
    status: 'FATURAMENTO',
    tipoPagamento: 'BOLETO',
    tipoImposto: 'ICMS',
    aliquota: 0.07,
    valor: 17590.67,
    cliente: 'Construtora Horizonte',
    descricao: 'Ensaios não destrutivos em vigas',
    pecas: 16,
    diametro: 12.0,
    largura: 5.6,
    larguraTotal: 18.3,
    peso: 44.2,
    rpm: 0,
    observacao: 'NF enviada, aguardando pagamento.',
    observacaoInterna: 'Arquivar relatórios ultrassom.',
    planoUm: { permitido: 0.05, encontrado: 0.05, raio: 0.42, remanescente: 0.0 },
    planoDois: { permitido: 0.04, encontrado: 0.04, raio: 0.39, remanescente: 0.0 },
    usuarioIdx: 2,
  },
  {
    data: '2024-10-11',
    dataVencimento: '2024-10-28',
    notaFiscal: 'NF-2024-0011',
    empresaIdx: 0,
    status: 'FINALIZADO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 20980.44,
    cliente: 'MetalNordic',
    descricao: 'Fresagem de carcaças pesadas',
    pecas: 9,
    diametro: 39.0,
    largura: 13.2,
    larguraTotal: 41.5,
    peso: 134.7,
    rpm: 1350,
    observacao: 'Liberação concluída com sucesso.',
    observacaoInterna: 'Registrar peças no acervo.',
    planoUm: { permitido: 0.08, encontrado: 0.07, raio: 0.6, remanescente: 0.01 },
    planoDois: { permitido: 0.07, encontrado: 0.06, raio: 0.57, remanescente: 0.01 },
    usuarioIdx: 0,
  },
  {
    data: '2024-11-05',
    dataVencimento: '2024-11-26',
    notaFiscal: 'NF-2024-0012',
    empresaIdx: 3,
    status: 'ORCAMENTO',
    tipoPagamento: 'TRANSFERENCIA',
    tipoImposto: 'PIS',
    aliquota: 0.0165,
    valor: 14220.31,
    cliente: 'Petro Óleos do Brasil',
    descricao: 'Limpeza e certificação de válvulas',
    pecas: 28,
    diametro: 9.5,
    largura: 4.2,
    larguraTotal: 15.1,
    peso: 38.4,
    rpm: 0,
    observacao: 'Planejamento logístico em andamento.',
    observacaoInterna: 'Criar checklist de segurança.',
    planoUm: { permitido: 0.05, encontrado: null, raio: null, remanescente: null },
    planoDois: { permitido: 0.04, encontrado: null, raio: null, remanescente: null },
    usuarioIdx: 3,
  },
  {
    data: '2024-12-14',
    dataVencimento: '2024-12-30',
    notaFiscal: 'NF-2024-0013',
    empresaIdx: 1,
    status: 'ORDEM_SERVICO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 31560.88,
    cliente: 'Fibras Nacionais',
    descricao: 'Supervisão de linha de extrusão',
    pecas: 11,
    diametro: 27.8,
    largura: 11.6,
    larguraTotal: 33.9,
    peso: 72.6,
    rpm: 980,
    observacao: 'Prazo crítico, equipe em regime 24h.',
    observacaoInterna: 'Solicitar backup de peças críticas.',
    planoUm: { permitido: 0.09, encontrado: 0.07, raio: 0.62, remanescente: 0.02 },
    planoDois: { permitido: 0.07, encontrado: 0.06, raio: 0.57, remanescente: 0.01 },
    usuarioIdx: 1,
  },
  {
    data: '2025-01-09',
    dataVencimento: '2025-01-24',
    notaFiscal: 'NF-2025-0001',
    empresaIdx: 2,
    status: 'FINALIZADO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 22640.12,
    cliente: 'Mineração Oeste',
    descricao: 'Recuperação de tambores de tração',
    pecas: 7,
    diametro: 48.0,
    largura: 16.0,
    larguraTotal: 53.5,
    peso: 195.2,
    rpm: 1020,
    observacao: 'Cliente elogiou a qualidade.',
    observacaoInterna: 'Registrar depoimento.',
    planoUm: { permitido: 0.08, encontrado: 0.07, raio: 0.61, remanescente: 0.01 },
    planoDois: { permitido: 0.06, encontrado: 0.05, raio: 0.57, remanescente: 0.01 },
    usuarioIdx: 2,
  },
  {
    data: '2025-02-03',
    dataVencimento: '2025-02-20',
    notaFiscal: 'NF-2025-0002',
    empresaIdx: 0,
    status: 'FATURAMENTO',
    tipoPagamento: 'BOLETO',
    tipoImposto: 'COFINS',
    aliquota: 0.03,
    valor: 19870.78,
    cliente: 'TechWave Automação',
    descricao: 'Integração de células robotizadas',
    pecas: 5,
    diametro: 34.0,
    largura: 13.8,
    larguraTotal: 37.2,
    peso: 98.6,
    rpm: 0,
    observacao: 'NF emitida, aguardando comprovante.',
    observacaoInterna: 'Acionar financeiro para follow-up.',
    planoUm: { permitido: 0.07, encontrado: 0.06, raio: 0.55, remanescente: 0.01 },
    planoDois: { permitido: 0.06, encontrado: 0.05, raio: 0.52, remanescente: 0.01 },
    usuarioIdx: 0,
  },
  {
    data: '2025-03-14',
    dataVencimento: '2025-03-31',
    notaFiscal: 'NF-2025-0003',
    empresaIdx: 1,
    status: 'ORDEM_SERVICO',
    tipoPagamento: 'TRANSFERENCIA',
    tipoImposto: 'ICMS',
    aliquota: 0.07,
    valor: 25670.55,
    cliente: 'Petrovia Engenharia',
    descricao: 'Alinhamento de dutos e flanges',
    pecas: 15,
    diametro: 21.0,
    largura: 9.8,
    larguraTotal: 26.4,
    peso: 76.3,
    rpm: 0,
    observacao: 'Realocação de equipe para turno extra.',
    observacaoInterna: 'Monitorar temperatura ambiente.',
    planoUm: { permitido: 0.08, encontrado: 0.07, raio: 0.59, remanescente: 0.01 },
    planoDois: { permitido: 0.06, encontrado: 0.05, raio: 0.55, remanescente: 0.01 },
    usuarioIdx: 1,
  },
  {
    data: '2025-04-07',
    dataVencimento: '2025-04-22',
    notaFiscal: 'NF-2025-0004',
    empresaIdx: 3,
    status: 'FATURAMENTO',
    tipoPagamento: 'PIX',
    tipoImposto: 'ISS',
    aliquota: 0.05,
    valor: 17450.6,
    cliente: 'Siderúrgica Vale Verde',
    descricao: 'Soldagem especializada em rolos laminadores',
    pecas: 13,
    diametro: 28.5,
    largura: 11.2,
    larguraTotal: 35.6,
    peso: 118.4,
    rpm: 980,
    observacao: 'Pagamento previsto em 48h.',
    observacaoInterna: 'Enviar relatório fotográfico atualizado.',
    planoUm: { permitido: 0.07, encontrado: 0.06, raio: 0.53, remanescente: 0.01 },
    planoDois: { permitido: 0.05, encontrado: 0.05, raio: 0.49, remanescente: 0.0 },
    usuarioIdx: 3,
  },
];

export const SERVICOS_MOCK: ServicoRelatorio[] = seeds.map((seed, index) => {
  const empresa = EMPRESAS[seed.empresaIdx];
  const usuario = USUARIOS[seed.usuarioIdx];
  const aliquota =
    seed.tipoImposto && seed.tipoImposto !== 'ISENTO' ? seed.aliquota ?? 0 : 0;
  const valorImposto = round2(seed.valor * aliquota);
  const valorLiquido = round2(seed.valor - valorImposto);
  const vendedor = VENDEDORES[index % VENDEDORES.length];
  const indiceAssinatura = index % ASSINATURAS.length;
  const dataObj = new Date(seed.data);
  const ano = Number.isNaN(dataObj.getTime()) ? 2024 : dataObj.getFullYear();
  const osSequencial = (index + 1).toString().padStart(3, '0');

  return {
    id: uuidFromIndex(index),
    data: seed.data,
    notaFiscal: seed.notaFiscal,
    valorTotal: round2(seed.valor),
    imposto: seed.tipoImposto,
    valorImposto,
    valorLiquido,
    tipoPagamento: seed.tipoPagamento,
    status: seed.status,
    dataVencimento: seed.dataVencimento,
    empresa,
    clienteCertificado: seed.cliente,
    quantidadePecas: seed.pecas,
    descricaoPeca: seed.descricao,
    diametroPeca: seed.diametro,
    larguraPeca: seed.largura,
    larguraTotalPeca: seed.larguraTotal,
    pesoPeca: seed.peso,
    rpmPeca: seed.rpm,
    observacao: seed.observacao,
    observacaoInterna: seed.observacaoInterna,
    planoUmPermitido: seed.planoUm.permitido,
    planoDoisPermitido: seed.planoDois.permitido,
    planoUmEncontrado: seed.planoUm.encontrado,
    planoDoisEncontrado: seed.planoDois.encontrado,
    raioPlanoUm: seed.planoUm.raio,
    raioPlanoDois: seed.planoDois.raio,
    remanescentePlanoUm: seed.planoUm.remanescente,
    remanescentePlanoDois: seed.planoDois.remanescente,
    usuario,
    dataCriacao: `${seed.data}T08:15:00`,
    dataAtualizacao: `${(seed.dataVencimento ?? seed.data)}T17:45:00`,
    numeroCertificado: seed.notaFiscal ? `CERT-${seed.notaFiscal.slice(-4)}` : null,
    ordemServico: `OS-${ano}${(dataObj.getMonth() + 1).toString().padStart(2, '0')}-${osSequencial}`,
    giroQuadratico: seed.rpm ? `${Math.max(80, Math.round(seed.rpm * 1.5))} gf·cm` : null,
    vendedor,
    comissaoPercentual: 2 + ((index % 4) + 1) * 0.5,
    orcamentoReferencia: `ORC-${ano}-${(200 + index).toString().padStart(3, '0')}`,
    assinaturaResponsavel: ASSINATURAS[indiceAssinatura],
  };
});

export const STATUS_SERVICO_OPCOES = [...STATUS_SERVICO];
export const TIPOS_PAGAMENTO_OPCOES = [...TIPOS_PAGAMENTO];
export const TIPOS_IMPOSTO_OPCOES = [...TIPOS_IMPOSTO];
export const NOMES_EMPRESAS = EMPRESAS.map((empresa) => empresa.nome);

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

export function agruparServicos(
  servicos: ServicoRelatorio[],
  chave: GrupoChave
): GrupoResumo[] {
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

