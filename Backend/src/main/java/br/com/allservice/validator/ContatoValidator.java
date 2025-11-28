package br.com.allservice.validator;

import br.com.allservice.domain.Contato;
import br.com.allservice.execptions.RegistroDuplicadoException;
import br.com.allservice.repository.RepositoryFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ContatoValidator {

    private final RepositoryFacade repository;


    public void validar(Contato contato){
        if(existeTelefoneEEmail(contato)){
            throw new RegistroDuplicadoException("Contato ja cadastrado!");
        }
    }

    private boolean existeTelefoneEEmail(Contato contato){
        Optional<Contato> contatoOptional =  repository.contatoRepository.findByTelefoneAndEmail(contato.getTelefone(), contato.getEmail());

        if(contatoOptional.isEmpty() && contato.getId() != null){
            return false;
        }

        if(contato.getId() == null){
            return contatoOptional.isPresent();
        }

        return !contato.getId().equals(contatoOptional.get().getId()) && contatoOptional.isPresent();
    }

}
