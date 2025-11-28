package br.com.allservice.repository;

import br.com.allservice.domain.Contato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ContatoRepository extends JpaRepository<Contato, UUID>, JpaSpecificationExecutor<Contato> {
    Optional<Contato> findByTelefoneAndEmail(String telefone, String email);

}
