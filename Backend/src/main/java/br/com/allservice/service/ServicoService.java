package br.com.allservice.service;

import br.com.allservice.controller.dto.ServicoDTO;
import br.com.allservice.enums.StatusServico;
import br.com.allservice.enums.TipoImposto;
import br.com.allservice.enums.TipoPagamento;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;


public interface ServicoService extends GenericService {
    ResponseEntity<Object> save(ServicoDTO servico);

    ResponseEntity<Page<ServicoDTO>> filter(
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
    );

    ResponseEntity<ServicoDTO> findById(UUID id);

    ResponseEntity<Object> update(UUID id, ServicoDTO servico);

    ResponseEntity<Void> delete(UUID id);
}
