package br.com.allservice.repository;

import br.com.allservice.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID>, JpaSpecificationExecutor<Usuario> {
    Optional<Usuario> findByLogin(String login);

    Usuario findByEmail(String email);
    //List<Usuario> findByDetails();
}
