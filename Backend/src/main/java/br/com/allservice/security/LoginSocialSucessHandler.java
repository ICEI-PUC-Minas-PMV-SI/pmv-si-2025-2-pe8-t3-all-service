package br.com.allservice.security;

import br.com.allservice.domain.Usuario;
import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.UsuarioService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class LoginSocialSucessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UsuarioService usuarioService;
    private final RepositoryFacade repository;
    private final PasswordEncoder encoder;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws ServletException, IOException {

        OAuth2AuthenticationToken  auth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = auth2AuthenticationToken.getPrincipal();

        Usuario usuario = usuarioService.findByEmail(oAuth2User.getAttribute("email"));

        if(usuario == null){
            usuario = novoUsuarioLogado(oAuth2User);
        }

        authentication = new CustomAuthentication(usuario);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        super.onAuthenticationSuccess(request, response, authentication);
    }

    private Usuario novoUsuarioLogado(OAuth2User oAuth2User) {
        String loginESenha = obterLoginESenhaDoEmail(oAuth2User);
        System.out.println("loginESenha = " + loginESenha);
        return repository.usuarioRepository.save(
                Usuario.builder()
                        .email(oAuth2User.getAttribute("email"))
                        .senha(encoder.encode(loginESenha))
                        .login(loginESenha)
                        .nome(oAuth2User.getAttribute("name"))
                        .funcao("N/A")
                        .statusUsuario(StatusUsuario.ATIVO)
                        .perfil(TipoPerfil.OPERADOR)
                        .build()
        );
    }

    private static String obterLoginESenhaDoEmail(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return email.substring(0, email.indexOf("@")) ;
    }
}
