package br.com.allservice.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;

import java.util.UUID;

public record EmpresaDTO(
        UUID id,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 5, max = 160, message = "tamanho fora do padrão")
        String razaoSocial,

        @Size(min = 14, max = 18, message = "tamanho fora do padrão")
        @NotBlank(message = "campo obrigatorio")
        @CNPJ
        String cnpj,

        @Size(min = 20, max = 200, message = "tamanho fora do padrão")
        @NotBlank(message = "campo obrigatorio")
        String endereco,

        @NotBlank(message = "campo obrigatorio")
        @org.hibernate.validator.constraints.UUID
        String idUsuario
) {

}
