package br.com.allservice.validator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ValidatorFacade {
    public final ContatoValidator contatoValidator;
    public final EmpresaValidator empresaValidator;
    public final UsuarioValidator usuarioValidator;
    public final ServicoValidator servicoValidator;
}
