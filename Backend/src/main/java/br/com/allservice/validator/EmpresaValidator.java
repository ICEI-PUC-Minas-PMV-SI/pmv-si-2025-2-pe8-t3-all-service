package br.com.allservice.validator;

import br.com.allservice.domain.Empresa;
import br.com.allservice.execptions.RegistroDuplicadoException;
import br.com.allservice.repository.RepositoryFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EmpresaValidator {

    private final RepositoryFacade repository;

    public void validar(Empresa empresa){
        if(existeCnpjOuRazaoSocial(empresa)){
            throw new RegistroDuplicadoException("Empresa ja cadastrado!");
        }
    }

    private boolean existeCnpjOuRazaoSocial(Empresa empresa){
        Optional<Empresa> empresaOptional =  repository.empresaRepository.findByCnpjOrRazaoSocial(empresa.getCnpj(), empresa.getRazaoSocial());

        if(empresaOptional.isEmpty() && empresa.getId() != null){
            return false;
        }

        if(empresa.getId() == null){
            return empresaOptional.isPresent();
        }

        return !empresa.getId().equals(empresaOptional.get().getId()) && empresaOptional.isPresent();
    }
}
