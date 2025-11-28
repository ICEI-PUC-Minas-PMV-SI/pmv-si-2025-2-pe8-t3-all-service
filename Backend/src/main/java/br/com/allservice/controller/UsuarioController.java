package br.com.allservice.controller;

import br.com.allservice.controller.dto.UsuarioDTO;
import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
import br.com.allservice.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService service;

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> save(@RequestBody @Valid UsuarioDTO usuario) {
        return service.save(usuario);
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioDTO>> filter(
            @RequestParam(value = "nome", required = false) String nome,
            @RequestParam(value = "funcao", required = false) String funcao,
            @RequestParam(value = "statusUsuario", required = false) StatusUsuario statusUsuario,
            @RequestParam(value = "perfil", required = false) TipoPerfil perfil,
            @RequestParam(value = "pagina", defaultValue = "0") Integer pagina,
            @RequestParam(value = "quantidade", defaultValue = "50") Integer quantidade
    ) {
        return service.filter(nome, funcao, statusUsuario, perfil, pagina, quantidade);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('MASTE')")
    public ResponseEntity<Object> update(@PathVariable UUID id, @RequestBody @Valid UsuarioDTO usuario) {
        return service.update(id, usuario);
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id);
    }
}
