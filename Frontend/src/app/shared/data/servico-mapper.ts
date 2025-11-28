import { EmpresaDTO, ServicoDTO, UsuarioDTO } from '../../api/models';
import { ServicoRelatorio } from './servicos.model';

interface ServicoContexto {
  empresa?: EmpresaDTO | null;
  usuario?: UsuarioDTO | null;
}

/**
 * Converte um {@link ServicoDTO} retornado pela API no contrato rico usado nas telas.
 * Mantém compatibilidade com os campos derivados esperados pelos dashboards.
 */
export function mapServicoDtoToRelatorio(dto: ServicoDTO, contexto: ServicoContexto = {}): ServicoRelatorio {
  const hoje = new Date().toISOString().slice(0, 10);
  const empresa = contexto.empresa ?? null;
  const usuario = contexto.usuario ?? null;

  return {
    id: dto.id ?? `srv-${Math.random().toString(36).slice(2)}`,
    data: dto.data ?? hoje,
    notaFiscal: dto.notaFiscal ?? null,
    valorTotal: Number(dto.valorTotal ?? 0),
    imposto: dto.imposto ?? null,
    valorImposto: Number(dto.valorImposto ?? 0),
    valorLiquido: Number(dto.valorLiquido ?? dto.valorTotal ?? 0),
    tipoPagamento: dto.tipoPagamento,
    status: dto.status,
    dataVencimento: dto.dataVencimento ?? null,
    empresa: {
      id: empresa?.id ?? dto.idEmpresa,
      nome: empresa?.razaoSocial ?? 'Empresa não identificada',
      cnpj: empresa?.cnpj ?? '—',
    },
    clienteCertificado: dto.clienteCertificado ?? null,
    quantidadePecas:
      dto.quantidadePecas != null ? Number(dto.quantidadePecas) : null,
    descricaoPeca: dto.descricaoPeca ?? null,
    diametroPeca: dto.diametroPeca ?? null,
    larguraPeca: dto.larguraPeca ?? null,
    larguraTotalPeca: dto.larguraTotalPeca ?? null,
    pesoPeca: dto.pesoPeca ?? null,
    rpmPeca: dto.rpmPeca != null ? Number(dto.rpmPeca) : null,
    observacao: dto.observacao ?? null,
    observacaoInterna: dto.observacaoInterna ?? null,
    planoUmPermitido: dto.planoUmPermitido ?? null,
    planoDoisPermitido: dto.planoDoisPermitido ?? null,
    planoUmEncontrado: dto.planoUmEncontrado ?? null,
    planoDoisEncontrado: dto.planoDoisEncontrado ?? null,
    raioPlanoUm: dto.raioPlanoUm ?? null,
    raioPlanoDois: dto.raioPlanoDois ?? null,
    remanescentePlanoUm: dto.remanescentePlanoUm ?? null,
    remanescentePlanoDois: dto.remanescentePlanoDois ?? null,
    usuario: {
      id: usuario?.id ?? dto.idUsuario,
      nome: usuario?.nome ?? 'Usuário não identificado',
    },
    dataCriacao: dto.data ? `${dto.data}T00:00:00` : `${hoje}T00:00:00`,
    dataAtualizacao: dto.data ? `${dto.data}T00:00:00` : `${hoje}T00:00:00`,
    numeroCertificado: dto.clienteCertificado ?? null,
    ordemServico: dto.notaFiscal ?? dto.id ?? null,
    giroQuadratico: null,
    vendedor: null,
    comissaoPercentual: 0,
    orcamentoReferencia: null,
    assinaturaResponsavel: null,
  } satisfies ServicoRelatorio;
}
