package br.com.allservice.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Response<T> {
    private int statusCode;
    private String mensagem;
    private T dados;

    public static <T> Response<T> resposta(HttpStatus status, String mensagem,  T data) {
        return new Response<T>(status.value(), mensagem, data);
    }

}
