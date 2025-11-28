package br.com.allservice.domain;

import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
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
import java.util.UUID;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Usuario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ID")
    private UUID id;

    @Column(name = "NOME", length = 120, nullable = false)
    private String nome;

    @Column(name = "FUNCAO", length = 60, nullable = false)
    private String funcao;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 10, nullable = false)
    private StatusUsuario statusUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERFIL", length = 30, nullable = false)
    private TipoPerfil perfil;

    @Column(name = "SENHA", length = 300, nullable = false)
    private String senha;

    @Column(name = "LOGIN", length = 100, nullable = false, unique = true)
    private String login;

    @Column(name = "EMAIL", length = 100, nullable = false, unique = true)
    private String email;

    // campos de auditoria
    @CreatedDate
    @Column(name = "DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    @LastModifiedDate
    @Column(name = "DATA_ATUALIZACAO", nullable = false)
    private LocalDateTime dataAtualizacao;


}
