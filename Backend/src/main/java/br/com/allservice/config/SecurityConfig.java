package br.com.allservice.config;

import br.com.allservice.security.LoginSocialSucessHandler;
import br.com.allservice.service.impl.JwtCustomAutheticationFilterImpl;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            LoginSocialSucessHandler sucessHandler,
            JwtCustomAutheticationFilterImpl jwtFilter,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
              .formLogin(configurer -> {
                  configurer
                          .loginPage("/login").permitAll()
                          .defaultSuccessUrl("http://localhost:4200/dashboard", true);
              })
//                .formLogin(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults())
                .authorizeHttpRequests(authorizeRequests -> {
//                        authorizeRequests.requestMatchers(HttpMethod.POST, "/usuario").hasRole("ADMIN");
//                        authorizeRequests.requestMatchers(HttpMethod.PUT, "/usuario").hasRole("ADMIN");
//                        authorizeRequests.requestMatchers(HttpMethod.DELETE, "/usuario").hasRole("ADMIN");
                            authorizeRequests
                                    .requestMatchers("/oauth2/**", "/login/**").permitAll()
                                    .anyRequest().permitAll();
                        }
                )
                .oauth2Login(oauth2 ->{
                    oauth2
                            .loginPage("/login")
                            .successHandler(sucessHandler);
                })
                .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer.jwt(Customizer.withDefaults()))
                .addFilterAfter(jwtFilter, BearerTokenAuthenticationFilter.class)
                .build();
    }

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults("");
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        var jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return converter;
    }

    //JWK - JSON Web Key
    @Bean
    public JWKSource<SecurityContext> jwkSetSource() throws Exception {
        RSAKey rsaKey = gerarChaveRSA();
        JWKSet jwkSet = new JWKSet(rsaKey);

        return new ImmutableJWKSet<>(jwkSet);
    }

    private RSAKey gerarChaveRSA() throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);

        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        RSAPublicKey chavePublica = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey chavePrivada = (RSAPrivateKey) keyPair.getPrivate();


        return new RSAKey
                .Builder(chavePublica)
                .privateKey(chavePrivada)
                .keyID(UUID.randomUUID().toString())
                .build();

    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSetSource) throws Exception {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSetSource);
    }

}
