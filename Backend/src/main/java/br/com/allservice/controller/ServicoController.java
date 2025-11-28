package br.com.allservice.controller;

import br.com.allservice.controller.dto.ServicoDTO;
import br.com.allservice.enums.StatusServico;
import br.com.allservice.enums.TipoImposto;
import br.com.allservice.enums.TipoPagamento;
import br.com.allservice.service.ServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/servico")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService service;

    @PostMapping
    public ResponseEntity<Object> save(@RequestBody @Valid ServicoDTO servico) {
        return service.save(servico);
    }

    @GetMapping
    public ResponseEntity<Page<ServicoDTO>> filter(
            @RequestParam(value = "nota-fiscal", required = false) String notaFiscal,
            @RequestParam(value = "mes-ano", required = false) String mesAno,
            @RequestParam(value = "ano", required = false) String ano,
            @RequestParam(value = "nome-empresa", required = false) String nomeEmpresa,
            @RequestParam(value = "status", required = false) StatusServico status,
            @RequestParam(value = "imposto", required = false) TipoImposto imposto,
            @RequestParam(value = "tipo-pagamento", required = false) TipoPagamento tipoPagamento,
            @RequestParam(value = "valor-total", required = false) BigDecimal valorTotal,
            @RequestParam(value = "vencimento", required = false) LocalDate dataVencimento,
            @RequestParam(value = "data", required = false) LocalDate data,
            @RequestParam(value = "pagina", defaultValue = "0") Integer pagina,
            @RequestParam(value = "quantidade", defaultValue = "50") Integer quantidade
    ) {
        return service.filter(
                notaFiscal,
                mesAno,
                ano,
                nomeEmpresa,
                status,
                imposto,
                tipoPagamento,
                valorTotal,
                dataVencimento,
                data,
                pagina,
                quantidade
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoDTO> findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable UUID id, @RequestBody @Valid ServicoDTO servico) {
        return service.update(id, servico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id);
    }

}
