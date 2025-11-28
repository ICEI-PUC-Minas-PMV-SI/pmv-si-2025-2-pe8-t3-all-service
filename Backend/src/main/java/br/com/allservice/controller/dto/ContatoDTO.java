package br.com.allservice.controller.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record ContatoDTO(
        UUID id,

        @NotBlank(message = "campo obrigatorio")
        @org.hibernate.validator.constraints.UUID
        String idEmpresa,

        @NotBlank(message = "campo obrigatorio")
        @org.hibernate.validator.constraints.UUID
        String idUsuario,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 3, max = 100, message = "tamanho fora do padrão")
        String responsavel,

        @NotNull(message = "campo obrigatorio")
        @Pattern(regexp = "FINANCEIRO|MANUTENCAO|COMERCIAL|VENDAS|COMPRAS|JURIDICO|OPERACIONAL|ADMINISTRACAO|FISCAL|RH|LOGISTICA", message = "setor invalido")
        String setor,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 11, max = 15, message = "tamanho fora do padrão")
        String telefone,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 11, max = 100, message = "tamanho fora do padrão")
        @Email
        String email
) {
}
