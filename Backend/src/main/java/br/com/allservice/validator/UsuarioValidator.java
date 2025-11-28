package br.com.allservice.validator;

import br.com.allservice.domain.Usuario;
import br.com.allservice.execptions.RegistroDuplicadoException;
import br.com.allservice.repository.RepositoryFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UsuarioValidator {

    private final RepositoryFacade repository;

    public void validar(Usuario usuario){
        if(existeLogin(usuario)){
            throw new RegistroDuplicadoException("Usuario ja cadastrado!");
        }
    }

    private boolean existeLogin(Usuario usuario){
        Optional<Usuario> usuarioOptional =  repository.usuarioRepository.findByLogin(usuario.getLogin());

        if(usuarioOptional.isEmpty() && usuario.getId() != null){
            return false;
        }

        if(usuario.getId() == null){
            return usuarioOptional.isPresent();
        }

        return !usuario.getId().equals(usuarioOptional.get().getId()) && usuarioOptional.isPresent();
    }
}
