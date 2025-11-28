package br.com.allservice.service.impl;

import br.com.allservice.controller.dto.ServicoDTO;
import br.com.allservice.controller.mappers.ServicoMapper;
import br.com.allservice.domain.Servico;
import br.com.allservice.enums.StatusServico;
import br.com.allservice.enums.TipoImposto;
import br.com.allservice.enums.TipoPagamento;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.ServicoService;
import br.com.allservice.validator.ValidatorFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static br.com.allservice.repository.specs.ServicoSpecs.*;


@RequiredArgsConstructor
@Service
public class ServicoServiceImpl implements ServicoService {

    private final RepositoryFacade repository;
    private final ValidatorFacade validator;
    private final ServicoMapper mapper;

    public ResponseEntity<Object> save(ServicoDTO s) {

        validator.servicoValidator.validar(mapper.toEntity(s));
        var saved = repository.servicoRepository.save(mapper.toEntity(s));

        return ResponseEntity.created(gerarHeaderLocation(saved.getId())).build();

    }

    @Override
    public ResponseEntity<Page<ServicoDTO>> filter(
            String notaFiscal,
            String mesAno,
            String ano,
            String nomeEmpresa,
            StatusServico status,
            TipoImposto imposto,
            TipoPagamento tipoPagamento,
            BigDecimal valorTotal,
            LocalDate dataVencimento,
            LocalDate data,
            Integer pagina,
            Integer quantidade
    ) {

        Specification<Servico> specs = Specification.unrestricted();

        if (notaFiscal != null && !notaFiscal.isBlank()) {
            specs = specs.and(notaFiscalEqual(notaFiscal));
        }

        if (mesAno != null && !mesAno.isBlank()) {
            specs = specs.and(mesAnoEqual(mesAno));
        }

        if (ano != null && !ano.isBlank()) {
            specs = specs.and(anoEqual(ano));
        }

        if (nomeEmpresa != null && !nomeEmpresa.isBlank()) {
            specs = specs.and(nomeEmpresaLike(nomeEmpresa));
        }

        if (status != null) {
            specs = specs.and(statusServicoEqual(status));
        }

        if (imposto != null) {
            specs = specs.and(tipoImpostoEqual(imposto));
        }

        if (tipoPagamento != null) {
            specs = specs.and(tipoPagamentoEqual(tipoPagamento));
        }

        if (valorTotal != null) {
            specs = specs.and(valorTotalEqual(valorTotal));
        }

        if (dataVencimento != null) {
            specs = specs.and(dataVencimentoEqual(dataVencimento));
        }

        if (data != null) {
            specs = specs.and(dataEqual(data));
        }

        Pageable pageableRequest = PageRequest.of(pagina, quantidade);

        var servicos = repository.servicoRepository.findAll(specs, pageableRequest);

        Page<ServicoDTO> servicoResultado = servicos.map(mapper::toDto);

        return ResponseEntity.ok(servicoResultado);

    }

    @Override
    public ResponseEntity<ServicoDTO> findById(UUID id) {

        var servicoOpt = repository.servicoRepository.findById(id);
        return servicoOpt.map(servico ->
                        ResponseEntity.ok(mapper.toDto(servico)))
                .orElseGet(() -> ResponseEntity.notFound().build());

    }

    @Override
    public ResponseEntity<Object> update(UUID id, ServicoDTO s) {

        validator.servicoValidator.validar(mapper.toEntity(s));
        Optional<Servico> servicoOpt = repository.servicoRepository.findById(id);
        if (servicoOpt.isPresent()) {
            var servico = servicoOpt.get();

            var updated = mapper.toEntity(s); //todo - mudar o de/para
            updated.setId(servico.getId());

            repository.servicoRepository.save(updated);

            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> delete(UUID id) {

        Optional<Servico> servicoOpt = repository.servicoRepository.findById(id);
        if (servicoOpt.isPresent()) {
            repository.servicoRepository.delete(servicoOpt.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

}
