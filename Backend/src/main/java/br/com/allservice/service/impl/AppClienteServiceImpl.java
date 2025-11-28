package br.com.allservice.service.impl;

import br.com.allservice.domain.AppCliente;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.AppClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class AppClienteServiceImpl implements AppClienteService {

    private final RepositoryFacade repository;

    @Override
    public void save(AppCliente appCliente) {
        repository.appClienteRepository.save(appCliente);
    }

    @Override
    public AppCliente findByClientId(String clientId) {
        return repository.appClienteRepository.findByClientId(clientId);
    }


}
