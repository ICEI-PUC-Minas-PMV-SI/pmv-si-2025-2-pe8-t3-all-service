package br.com.allservice.controller.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record UsuarioDTO(
        UUID id,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 3, max = 120, message = "tamanho fora do padrão")
        String nome,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 3, max = 60, message = "tamanho fora do padrão")
        String funcao,

        @NotNull(message = "campo obrigatorio")
        @Pattern(regexp = "ATIVO|INATIVO", message = "status invalido")
        String statusUsuario,

        @NotNull(message = "campo obrigatorio")
        @Pattern(regexp = "MASTER|ADMINISTRADOR|FINANCEIRO|OPERADOR", message = "perfil invalido")
        String perfil,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 8, max = 15, message = "tamanho fora do padrão")
        String senha,

        @NotBlank(message = "campo obrigatorio")
        @Size(min = 5, max = 30, message = "o login dever o tamanho entre 5 à 30 caracteres")
        String login,

        @NotBlank(message = "campo obrigatorio")
        @Email(message = "invalido")
        String email
) {

}
