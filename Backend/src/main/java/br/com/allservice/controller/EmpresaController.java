package br.com.allservice.controller;

import br.com.allservice.controller.dto.EmpresaDTO;
import br.com.allservice.service.EmpresaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/empresa")
@RequiredArgsConstructor
public class EmpresaController {
    private final EmpresaService service;

    @PostMapping
    public ResponseEntity<Object> save(@RequestBody @Valid EmpresaDTO empresa) {
        return service.save(empresa);
    }

    @GetMapping
    public ResponseEntity<Page<EmpresaDTO>> filter(
            @RequestParam(value = "razao-social", required = false) String razaoSocial,
            @RequestParam(value = "cnpj", required = false) String cnpj,
            @RequestParam(value = "endereco", required = false) String endereco,
            @RequestParam(value = "pagina", defaultValue = "0") Integer pagina,
            @RequestParam(value = "quantidade", defaultValue = "50") Integer quantidade
    ) {
        return service.filter(razaoSocial, cnpj, endereco, pagina, quantidade);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable UUID id, @RequestBody @Valid  EmpresaDTO e) {
        return service.update(id, e);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id);
    }
}
