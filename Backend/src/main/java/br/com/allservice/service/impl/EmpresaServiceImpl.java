package br.com.allservice.service.impl;

import br.com.allservice.controller.dto.EmpresaDTO;
import br.com.allservice.controller.mappers.EmpresaMapper;
import br.com.allservice.domain.Empresa;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.EmpresaService;
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

import static br.com.allservice.repository.specs.EmpresaSpecs.*;


@RequiredArgsConstructor
@Service
public class EmpresaServiceImpl implements EmpresaService {
    private final RepositoryFacade repository;
    private final ValidatorFacade validator;
    private final EmpresaMapper mapper;

    @Override
    public ResponseEntity<Object> save(EmpresaDTO e) {

        validator.empresaValidator.validar(mapper.toEntity(e));
        var saved = repository.empresaRepository.save(mapper.toEntity(e));

        return ResponseEntity.created(gerarHeaderLocation(saved.getId())).build();


    }

    @Override
    public ResponseEntity<Page<EmpresaDTO>> filter(
            String razaoSocial,
            String cnpj,
            String endereco,
            Integer pagina,
            Integer quantidade
    ) {

        Specification<Empresa> specs = Specification.unrestricted();

        if (razaoSocial != null && !razaoSocial.isBlank()) {
            specs = specs.and(razaoSociallLike(razaoSocial));
        }

        if (cnpj != null && !cnpj.isBlank()) {
            specs = specs.and(cnpjEqual(cnpj));
        }

        if (endereco != null && !endereco.isBlank()) {
            specs = specs.and(enderecolLike(endereco));
        }


        Pageable pageableRequest = PageRequest.of(pagina, quantidade);

        var empresas = repository.empresaRepository.findAll(specs, pageableRequest);

        Page<EmpresaDTO> empresaResultado = empresas.map(mapper::toDto);

        return ResponseEntity.ok(empresaResultado);

    }

    @Override
    public ResponseEntity<EmpresaDTO> findById(UUID id) {

        var empresaOpt = repository.empresaRepository.findById(id);
        return empresaOpt.map(empresa ->
                        ResponseEntity.ok(mapper.toDto(empresa)))
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

    @Override
    public ResponseEntity<Object> update(UUID id, EmpresaDTO e) {

        validator.empresaValidator.validar(mapper.toEntity(e));
        Optional<Empresa> empresaOpt = repository.empresaRepository.findById(id);
        if (empresaOpt.isPresent()) {
            var empresa = empresaOpt.get();
            empresa.setRazaoSocial(e.razaoSocial());
            empresa.setCnpj(e.cnpj());
            empresa.setEndereco(e.endereco());
            empresa.getUsuario().setId(UUID.fromString(e.idUsuario()));

            repository.empresaRepository.save(empresa);

            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> delete(UUID id) {

        Optional<Empresa> empresa = repository.empresaRepository.findById(id);
        if (empresa.isPresent()) {
            repository.empresaRepository.delete(empresa.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

}