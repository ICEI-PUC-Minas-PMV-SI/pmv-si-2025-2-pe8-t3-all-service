package br.com.allservice.domain;

import br.com.allservice.enums.StatusServico;
import br.com.allservice.enums.TipoImposto;
import br.com.allservice.enums.TipoPagamento;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Servico implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID")
    private UUID id;

    @Column(name = "DATA", nullable = false)
    private LocalDate data;

    @Column(name = "NOTA_FISCAL", length = 10, unique = true)
    private String notaFiscal;

    @Column(name = "VALOR_TOTAL", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "IMPOSTO", length = 13)
    private TipoImposto imposto;

    @Column(name = "VALOR_IMPOSTO", precision = 10, scale = 2)
    private BigDecimal valorImposto;

    @Column(name = "VALOR_LIQUIDO", precision = 10, scale = 2)
    private BigDecimal valorLiquido;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_PAGAMENTO", length = 10)
    private TipoPagamento tipoPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private StatusServico status;

    @Column(name = "DATA_VENCIMENTO")
    private LocalDate dataVencimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_EMPRESA")
    @JsonBackReference
    private Empresa empresa;

    @Column(name = "CLIENTE_CERTIFICADO", length = 100)
    private String clienteCertificado;

    @Column(name = "QUANTIDADE_PECAS", length = 5)
    private Long quantidadePecas;

    @Column(name = "DESCRICAO_PECA", length = 200)
    private String descricaoPeca;

    @Column(name = "DIAMENTRO_PECA", precision = 10, scale = 2)
    private BigDecimal diametroPeca;

    @Column(name = "LARGURA_PECA", precision = 10, scale = 2)
    private BigDecimal larguraPeca;

    @Column(name = "LARGURA_TOTAL_PECA", precision = 10, scale = 2)
    private BigDecimal larguraTotalPeca;

    @Column(name = "PESO_PECA", precision = 10, scale = 2)
    private BigDecimal pesoPeca;

    @Column(name = "RPM_PECA", length = 10)
    private Long rpmPeca;

    @Column(name = "OBSERVACAO", length = 250)
    private String observacao;

    @Column(name = "OBSERVACAO_INTERNA",  length = 250)
    private String observacaoInterna;

    @Column(name = "PLANO_UM_PERMITIDO", precision = 10, scale = 2)
    private BigDecimal  planoUmPermitido;

    @Column(name = "PLANO_DOIS_PERMITIDO", precision = 10, scale = 2)
    private BigDecimal  planoDoisPermitido;

    @Column(name = "PLANO_UM_ENCONTRADO", precision = 10, scale = 2)
    private BigDecimal  planoUmEncontrado;

    @Column(name = "PLANO_DOIS_ENCONTRADO", precision = 10, scale = 2)
    private BigDecimal  planoDoisEncontrado;

    @Column(name = "RAIO_PLANO_UM", precision = 10, scale = 2)
    private BigDecimal  raioPlanoUm;

    @Column(name = "RAIO_PLANO_DOIS", precision = 10, scale = 2)
    private BigDecimal  raioPlanoDois;

    @Column(name = "REMANESCENTE_PLANO_UM", precision = 10, scale = 2)
    private BigDecimal  remanescentePlanoUm;

    @Column(name = "REMANESCENTE_PLANO_DOIS", precision = 10, scale = 2)
    private BigDecimal  remanescentePlanoDois;

    //campos de auditoria

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private Usuario usuario;

    @CreatedDate
    @Column(name = "DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @LastModifiedDate
    @Column(name = "DATA_ATUALIZACAO", nullable = false)
    private LocalDateTime dataAtualizacao;

    //private Usuario vendedor;
//    @Column(name = "VENDENDOR")
//    private String vendedor;

//    @Column(name = "ORÇAMENTO")
//    private BigDecimal orcamento;
}
