package br.com.allservice.service;

import br.com.allservice.domain.AppCliente;

public interface AppClienteService {

    void save(AppCliente appCliente);
    AppCliente findByClientId(String clientId);

}