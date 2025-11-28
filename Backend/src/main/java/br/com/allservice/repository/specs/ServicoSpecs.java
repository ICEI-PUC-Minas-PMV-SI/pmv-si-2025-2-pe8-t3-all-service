package br.com.allservice.repository.specs;

import br.com.allservice.domain.Servico;
import br.com.allservice.enums.StatusServico;
import br.com.allservice.enums.TipoImposto;
import br.com.allservice.enums.TipoPagamento;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ServicoSpecs {

    /**
     *             String notaFiscal,
     *             String mesAno,
     *             String ano,
     *             String nomeEmpresa,
     *             StatusServico status,
     *             TipoImposto imposto,
     *             TipoPagamento tipoPagamento,
     *             BigDecimal valorTotal,
     *             LocalDate dataVencimento,
     *             LocalDate data
     */

    public static Specification<Servico> notaFiscalEqual(String notaFiscal) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(criteriaBuilder.upper(root.get("notaFiscal")), notaFiscal.toUpperCase()
                );
    }

    public static Specification<Servico> anoEqual(String ano) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.function(
                                "to_char",
                                String.class,
                                root.get("data"),
                                criteriaBuilder.literal("YYYY")
                        ),
                        ano
                );
    }

    public static Specification<Servico> mesAnoEqual(String mesAno) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.function(
                                "to_char",
                                String.class,
                                root.get("data"),
                                criteriaBuilder.literal("MM/YYYY")
                        ),
                        mesAno
                );
    }

    public static Specification<Servico> nomeEmpresaLike(String nomeEmpresa) {
        return (root, query, criteriaBuilder) -> {
//            Join<Object, Object> joinEmpresa = root.join("empresa", JoinType.LEFT);
//            return criteriaBuilder.like(
//                    criteriaBuilder.upper(
//                            joinEmpresa.get("razaoSocial")
//                    ), "%" + nomeEmpresa.toUpperCase() + "%"
//            );
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("empresa").get("razaoSocial")), "%" + nomeEmpresa.toUpperCase() + "%"
            );
        } ;
    }

    public static Specification<Servico> statusServicoEqual( StatusServico status) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("status")), status.toString().toUpperCase()) ;
    }

    public static Specification<Servico> tipoImpostoEqual(TipoImposto imposto) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("imposto")), imposto.toString().toUpperCase()) ;
    }

    public static Specification<Servico> tipoPagamentoEqual(TipoPagamento tipoPagamento) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("tipoPagamento")), tipoPagamento.toString().toUpperCase()) ;
    }

    public static Specification<Servico> valorTotalEqual(BigDecimal valorTotal) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( root.get("valorTotal"), valorTotal) ;
    }

    public static Specification<Servico> dataVencimentoEqual(LocalDate dataVencimento) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( root.get("dataVencimento"), dataVencimento) ;
    }

    public static Specification<Servico> dataEqual(LocalDate data) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( root.get("data"), data) ;
    }


}
