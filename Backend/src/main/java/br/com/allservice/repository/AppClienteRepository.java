package br.com.allservice.repository;

import br.com.allservice.domain.AppCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AppClienteRepository extends JpaRepository<AppCliente, UUID> {

    AppCliente findByClientId(String clientId);
}
