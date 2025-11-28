package br.com.allservice.service.impl;

import br.com.allservice.controller.dto.ContatoDTO;
import br.com.allservice.controller.mappers.ContatoMapper;
import br.com.allservice.domain.Contato;
import br.com.allservice.enums.TipoSetor;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.ContatoService;
import br.com.allservice.validator.ValidatorFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import static br.com.allservice.repository.specs.ContatoSpecs.*;


@RequiredArgsConstructor
@Service
public class ContatoServiceImpl implements ContatoService {

    private final RepositoryFacade repository;
    private final ValidatorFacade validator;
    private final ContatoMapper mapper;

    @Override
    public ResponseEntity<Object> save(ContatoDTO c) {

        validator.contatoValidator.validar(mapper.toEntity(c));
        var saved = repository.contatoRepository.save(mapper.toEntity(c));

        return ResponseEntity.created(gerarHeaderLocation(saved.getId())).build();

    }

    @Override
    public ResponseEntity<Page<ContatoDTO>> filter(
            String nomeEmpresa,
            String responsavel,
            TipoSetor setor,
            String telefone,
            String email,
            Integer pagina,
            Integer quantidade
    ) {

        Specification<Contato> specs = Specification.unrestricted();

        if (nomeEmpresa != null && !nomeEmpresa.isBlank()) {
            specs = specs.and(nomeEmpresaLike(nomeEmpresa));
        }

        if (responsavel != null && !responsavel.isBlank()) {
            specs = specs.and(responsavelLike(responsavel));
        }

        if (setor != null) {
            specs = specs.and(setorEqual(setor));
        }

        if (telefone != null && !telefone.isBlank()) {
            specs = specs.and(telefoneEqual(telefone));
        }

        if (email != null && !email.isBlank()) {
            specs = specs.and(emailEqual(email));
        }

        Pageable pageableRequest = PageRequest.of(pagina, quantidade);

        var contatos = repository.contatoRepository.findAll(specs, pageableRequest);

        Page<ContatoDTO> contatoResultado = contatos.map(mapper::toDto);

        return ResponseEntity.ok(contatoResultado);

    }


    @Override
    public ResponseEntity<ContatoDTO> findById(UUID id) {

        var contatoOptional = repository.contatoRepository.findById(id);
        return contatoOptional.map(contato ->
                        ResponseEntity.ok(mapper.toDto(contato)))
                .orElseGet(() -> ResponseEntity.notFound()
                        .build());

    }

    @Override
    public ResponseEntity<Object> update(UUID id, ContatoDTO c) {

        validator.contatoValidator.validar(mapper.toEntity(c));
        Optional<Contato> contatoOptional = repository.contatoRepository.findById(id);
        if (contatoOptional.isPresent()) {

            var contato = contatoOptional.get();
            contato.getEmpresa().setId(UUID.fromString(c.idEmpresa()));
            contato.getUsuario().setId(UUID.fromString(c.idUsuario()));
            contato.setResponsavel(c.responsavel());
            contato.setSetor(TipoSetor.valueOf(c.setor()));
            contato.setTelefone(c.telefone());
            contato.setEmail(c.email());

            repository.contatoRepository.save(contato);

            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> delete(UUID id) {

        Optional<Contato> contato = repository.contatoRepository.findById(id);
        if (contato.isPresent()) {
            repository.contatoRepository.delete(contato.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

}
