package br.com.allservice.validator;

import br.com.allservice.domain.Servico;
import br.com.allservice.execptions.RegistroDuplicadoException;
import br.com.allservice.repository.RepositoryFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ServicoValidator {

    private final RepositoryFacade repository;

    public void validar(Servico servico){
        if(existeCnpjOuRazaoSocial(servico)){
            throw new RegistroDuplicadoException("Servico ja cadastrado!");
        }
    }

    private boolean existeCnpjOuRazaoSocial(Servico servico){
        Optional<Servico> servicoOptional =  repository.servicoRepository.findByNotaFiscal(servico.getNotaFiscal());

        if(servicoOptional.isEmpty() && servico.getId() != null){
            return false;
        }

        if(servico.getId() == null){
            return servicoOptional.isPresent();
        }

        return !servico.getId().equals(servicoOptional.get().getId()) && servicoOptional.isPresent();
    }
}
