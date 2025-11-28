package br.com.allservice.repository;

import br.com.allservice.domain.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> , JpaSpecificationExecutor<Empresa> {
    Optional<Empresa> findByCnpjOrRazaoSocial(String cnpj, String razaoSocial);
}
