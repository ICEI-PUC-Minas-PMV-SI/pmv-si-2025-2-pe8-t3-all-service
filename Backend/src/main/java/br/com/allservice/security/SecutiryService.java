package br.com.allservice.security;

import br.com.allservice.domain.Usuario;
import br.com.allservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecutiryService {

    private final UsuarioService service;

    public Usuario getUsuario() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication instanceof CustomAuthentication auth){
            return auth.getUsuario();
        }

        return null;
    }
}
