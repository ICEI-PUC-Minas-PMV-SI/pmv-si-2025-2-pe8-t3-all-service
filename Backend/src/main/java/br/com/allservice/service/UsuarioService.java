package br.com.allservice.service;

import br.com.allservice.controller.dto.UsuarioDTO;
import br.com.allservice.domain.Usuario;
import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

public interface UsuarioService extends GenericService {
    ResponseEntity<Object> save(UsuarioDTO u);

    ResponseEntity<Page<UsuarioDTO>> filter(
            String nome,
            String funcao,
            StatusUsuario statusUsuario,
            TipoPerfil perfil,
            Integer pagina,
            Integer quantidade
    );

    ResponseEntity<UsuarioDTO> findById(UUID id);

    Usuario findByLogin(String Login);

    Usuario findByEmail(String email);

    ResponseEntity<Object> update(UUID id, UsuarioDTO u);

    ResponseEntity<Void> delete(UUID id);
}
