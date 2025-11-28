package br.com.allservice.controller;

import br.com.allservice.controller.dto.ContatoDTO;
import br.com.allservice.enums.TipoSetor;
import br.com.allservice.service.ContatoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contato")
@RequiredArgsConstructor
public class ContatoController {

    private final ContatoService service;

    @PostMapping
    public ResponseEntity<Object> save(@RequestBody @Valid ContatoDTO c) {
        return service.save(c);
    }

    @GetMapping
    public ResponseEntity<Page<ContatoDTO>> filter(
            @RequestParam(value = "nome-empresa", required = false) String nomeEmpresa,
            @RequestParam(value = "responsavel", required = false) String responsavel,
            @RequestParam(value = "setor", required = false) TipoSetor setor,
            @RequestParam(value = "telefone", required = false) String telefone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "pagina", defaultValue = "0") Integer pagina,
            @RequestParam(value = "quantidade", defaultValue = "50") Integer quantidade
    ) {
        return service.filter(
                nomeEmpresa,
                responsavel,
                setor,
                telefone,
                email,
                pagina,
                quantidade
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContatoDTO> findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable UUID id, @RequestBody @Valid ContatoDTO c) {
        return service.update(id, c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id);
    }
}