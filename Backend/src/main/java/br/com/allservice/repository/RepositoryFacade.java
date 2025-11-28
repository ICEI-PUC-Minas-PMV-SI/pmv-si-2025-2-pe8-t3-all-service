package br.com.allservice.repository;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class RepositoryFacade {
	public final ServicoRepository servicoRepository;
    public final UsuarioRepository usuarioRepository;
    public final EmpresaRepository empresaRepository;
    public final ContatoRepository contatoRepository;
    public final AppClienteRepository appClienteRepository;
}
