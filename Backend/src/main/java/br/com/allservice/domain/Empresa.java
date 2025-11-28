package br.com.allservice.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Empresa implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID")
    private UUID id;

    @Column(name = "RAZAO_SOCIAL", length = 160, nullable = false)
    private String razaoSocial;

    @Column(name = "CNPJ", length = 20, nullable = false, unique = true)
    private String cnpj;

    @Column(name = "ENDERECO", length = 200, nullable = false)
    private String endereco;

    @OneToMany(mappedBy = "empresa")
    @JsonManagedReference
    private List<Servico> servicos;

    @OneToMany(mappedBy = "empresa")
    private List<Contato> contatos;

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
}
