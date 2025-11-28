export type UUID = string;
export type LocalDate = string;
export type BigDecimal = number;

export type TipoImposto = 'ICMS' | 'ISSQN' | 'ISSQN_RETIDO';
export type TipoPagamento = 'PIX' | 'DINHEIRO' | 'DEPOSITO' | 'BOLETO';
export type StatusServico = 'ORCAMENTO' | 'ORDEM_SERVICO' | 'FATURAMENTO' | 'CANCELADO' | 'FINALIZADO' | 'EM_ANALISE';
export type StatusUsuario = 'ATIVO' | 'INATIVO';
export type TipoPerfil = 'MASTER' | 'ADMINISTRADOR' | 'FINANCEIRO' | 'OPERADOR';
export type TipoSetor =
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

export interface ServicoDTO {
  id?: UUID;
  data: LocalDate;
  notaFiscal: string;
  valorTotal: BigDecimal;
  imposto?: TipoImposto;
  valorImposto?: BigDecimal;
  valorLiquido?: BigDecimal;
  tipoPagamento: TipoPagamento;
  status: StatusServico;
  dataVencimento?: LocalDate;
  clienteCertificado?: string;
  quantidadePecas?: number;
  descricaoPeca?: string;
  diametroPeca?: BigDecimal;
  larguraPeca?: BigDecimal;
  larguraTotalPeca?: BigDecimal;
  pesoPeca?: BigDecimal;
  rpmPeca?: number;
  observacao?: string;
  observacaoInterna?: string;
  planoUmPermitido?: BigDecimal;
  planoDoisPermitido?: BigDecimal;
  planoUmEncontrado?: BigDecimal;
  planoDoisEncontrado?: BigDecimal;
  raioPlanoUm?: BigDecimal;
  raioPlanoDois?: BigDecimal;
  remanescentePlanoUm?: BigDecimal;
  remanescentePlanoDois?: BigDecimal;
  idEmpresa: UUID;
  idUsuario: UUID;
}

export interface EmpresaDTO {
  id?: UUID;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  idUsuario: UUID;
}

export interface UsuarioDTO {
  id?: UUID;
  nome: string;
  funcao: string;
  email: string;
  senha: string;
  perfil: TipoPerfil;
  statusUsuario: StatusUsuario;
  login: string;
  dataCriacao?: string;
}

export interface ContatoDTO {
  id?: UUID;
  idEmpresa: UUID;
  idUsuario: UUID;
  responsavel: string;
  setor: TipoSetor;
  telefone: string;
  email: string;
}

export interface AppCliente {
  id?: UUID;
  scope: string;
  clientId: string;
  redirectUri: string;
  clientSecret: string;
}
