package br.com.allservice.execptions;

public class RegistroDuplicadoException extends RuntimeException {
    public RegistroDuplicadoException(String message) {
        super(message);
    }
}
