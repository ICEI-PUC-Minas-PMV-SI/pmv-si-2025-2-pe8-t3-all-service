package br.com.allservice.controller;

import br.com.allservice.domain.AppCliente;
import br.com.allservice.service.AppClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/app/cliente")
@RequiredArgsConstructor
public class AppClienteController {
    private final AppClienteService service;
    private final PasswordEncoder encoder;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void save(@RequestBody  AppCliente appCliente) {
        appCliente.setClientSecret(encoder.encode(appCliente.getClientSecret()));
        service.save(appCliente);
    }

    @GetMapping("/{id}")
    public AppCliente findByClientId(@PathVariable String clientId) {
        return service.findByClientId(clientId);
    }
}
