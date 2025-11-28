package br.com.allservice.security;

import br.com.allservice.domain.Usuario;
import br.com.allservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UsuarioService service;
    private final PasswordEncoder encoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Usuario usuarioEncontrado = service.findByLogin(authentication.getName());

        if (usuarioEncontrado == null) {
            throw getErrorUsuarioOuSenhaInvalida();
        }

        if(encoder.matches(authentication.getCredentials().toString(), usuarioEncontrado.getSenha())){
            return new CustomAuthentication(usuarioEncontrado);
        }

        throw getErrorUsuarioOuSenhaInvalida();
    }

    private UsernameNotFoundException getErrorUsuarioOuSenhaInvalida() {
        return new UsernameNotFoundException("Usuario e/ou senha inválidos!");
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.isAssignableFrom(UsernamePasswordAuthenticationToken.class);
    }
}
