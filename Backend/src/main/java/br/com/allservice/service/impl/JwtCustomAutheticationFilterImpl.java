package br.com.allservice.service.impl;

import br.com.allservice.domain.Usuario;
import br.com.allservice.security.CustomAuthentication;
import br.com.allservice.service.UsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtCustomAutheticationFilterImpl extends OncePerRequestFilter {

    private final UsuarioService usuarioService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(isJwtAuthenticationToken(authentication)){
            String login = authentication.getName();
            Usuario usuario = usuarioService.findByLogin(login);
            if(usuario != null){
                authentication = new CustomAuthentication(usuario);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);

    }

    private boolean isJwtAuthenticationToken(Authentication authentication ){
       return  authentication != null && authentication instanceof JwtAuthenticationToken;
    }
}
