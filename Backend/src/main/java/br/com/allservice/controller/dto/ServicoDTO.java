package br.com.allservice.controller.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServicoDTO(
        UUID id,

//        @NotNull(message = "data obrigatória")
//        @FutureOrPresent(message = "data do serviço deve ser presente ou futura")
        LocalDate data,

//        @NotBlank(message = "campo não pode ser vazio")
//        @Size(max = 10, message = "tamanho fora do padrão")
        String notaFiscal,

//        @NotBlank(message = "campo obrigatorio")
//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal valorTotal,

//        @Size( max = 13, message = "tamanho fora do padrão")
//        @Pattern(regexp = "ICMS|ISSQN|ISSQN_RETIDO", message = "imposto invalido")
        String imposto,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal valorImposto,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal valorLiquido,

//        @NotBlank(message = "campo obrigatorio")
//        @Pattern(regexp = "PIX|DINHEIRO|DEPOSITO|BOLETO", message = "pagamento invalido")
        String tipoPagamento,

//        @NotBlank(message = "campo obrigatorio")
//        @Pattern(regexp = "ORCAMENTO|ORDEM_SERVICO|FATURAMENTO|CANCELADO|FINALIZADO|EM_ANALISE", message = "o status do servico não é válido")
        String status,

//        @FutureOrPresent(message = "data de vencimento deve ser presente ou futura")
        LocalDate dataVencimento,


//        @Size( max = 100, message = "tamanho fora do padrão")
        String clienteCertificado,

//        @Digits(integer = 5, fraction = 0, message = "O valor deve ter no máximo 5 dígitos inteiros")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
//        @Max(value = 99999L, message = "O valor deve ser menor ou igual a 99.999")
        Long quantidadePecas,

//        @Size( max = 200, message = "tamanho fora do padrão")
        String descricaoPeca,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  diametroPeca,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  larguraPeca,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  larguraTotalPeca,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  pesoPeca,

//        @Digits(integer = 10, fraction = 0, message = "O valor deve ter no máximo 10 dígitos inteiros")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
//        @Max(value = 9999999999L, message = "O valor deve ser menor ou igual a 9.999.999.999")
        Long rpmPeca,

//        @Size( max = 250, message = "tamanho fora do padrão")
        String observacao,

//        @Size( max = 250, message = "tamanho fora do padrão")
        String observacaoInterna,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  planoUmPermitido,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  planoDoisPermitido,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  planoUmEncontrado,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  planoDoisEncontrado,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  raioPlanoUm,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  raioPlanoDois,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  remanescentePlanoUm,

//        @DecimalMin(value = "0.00", message = "O valor mínimo permitido é 0.00")
//        @DecimalMax(value = "99999999.99", message = "O valor máximo permitido é 99999999.99")
//        @Digits(integer = 8, fraction = 2, message = "O valor deve ter no máximo 8 dígitos inteiros e 2 decimais")
//        @PositiveOrZero(message = "O valor não pode ser negativo")
        BigDecimal  remanescentePlanoDois,

//        @NotBlank(message = "campo obrigatorio")
        String idEmpresa,

//        @NotBlank(message = "campo obrigatorio")
        String idUsuario,

        EmpresaDTO empresaDTO,

        UsuarioDTO usuarioDTO
) {
}
