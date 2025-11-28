package br.com.allservice.security;

import br.com.allservice.domain.Usuario;
import br.com.allservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioService service;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Usuario usuario = service.findByLogin(login);
        if(usuario == null){
            throw new UsernameNotFoundException("Usuario não encontrado!");
        }
        var user = User.builder()
                .username(usuario.getLogin())
                .password(usuario.getSenha())
                .roles(usuario.getPerfil().name())
                .authorities(usuario.getPerfil().name())
                .build();

        System.out.println("Usuario encontrado!" + usuario);
        System.out.println("User builder!" + user);

        return user;
    }
}
