package br.com.allservice.service.impl;

import br.com.allservice.controller.dto.UsuarioDTO;
import br.com.allservice.controller.mappers.UsuarioMapper;
import br.com.allservice.domain.Usuario;
import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
import br.com.allservice.repository.RepositoryFacade;
import br.com.allservice.service.UsuarioService;
import br.com.allservice.validator.ValidatorFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import static br.com.allservice.repository.specs.UsuarioSpecs.*;

@RequiredArgsConstructor
@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final RepositoryFacade repository;
    private final ValidatorFacade validator;
    private final UsuarioMapper mapper;
    private final PasswordEncoder encoder;

    @Override
    public ResponseEntity<Object> save(UsuarioDTO u) {
        var usuario = mapper.toEntity(u);
        validator.usuarioValidator.validar(usuario);
        usuario.setSenha(encoder.encode(usuario.getSenha()));
        var saved = repository.usuarioRepository.save(usuario);
        return ResponseEntity.created(gerarHeaderLocation(saved.getId())).build();
    }

    @Override
    public ResponseEntity<Page<UsuarioDTO>> filter(
            String nome,
            String funcao,
            StatusUsuario statusUsuario,
            TipoPerfil perfil,
            Integer pagina,
            Integer quantidade
    ) {

        Specification<Usuario> specs = Specification.unrestricted();

        if (nome != null && !nome.isBlank()) {
            specs = specs.and(nomeLike(nome));
        }

        if (funcao != null && !funcao.isBlank()) {
            specs = specs.and(funcaoEquals(funcao));
        }

        if (statusUsuario != null) {
            specs = specs.and(statusUsuarioEquals(statusUsuario));
        }

        if (perfil != null) {
            specs = specs.and(perfilEquals(perfil));
        }


        Pageable pageableRequest = PageRequest.of(pagina, quantidade);

        var usuarios = repository.usuarioRepository.findAll(specs,pageableRequest);

        Page<UsuarioDTO> usuarioResultado = usuarios.map(mapper::toDto);

        return ResponseEntity.ok(usuarioResultado);

    }

    @Override
    public ResponseEntity<UsuarioDTO> findById(UUID id) {

        var usuarioOpt = repository.usuarioRepository.findById(id);
        return usuarioOpt.map(usuario -> ResponseEntity.ok(mapper.toDto(usuario))).orElseGet(() -> ResponseEntity.notFound().build());

    }

    @Override
    public Usuario findByLogin(String login) {
        return repository.usuarioRepository.findByLogin(login).orElse(null);
    }

    @Override
    public Usuario findByEmail(String email) {
        return repository.usuarioRepository.findByEmail(email);
    }

    @Override
    public ResponseEntity<Object> update(UUID id, UsuarioDTO u) {

        validator.usuarioValidator.validar(mapper.toEntity(u));
        Optional<Usuario> usuarioOpt = repository.usuarioRepository.findById(id);
        if (usuarioOpt.isPresent()) {
            var usuario = usuarioOpt.get();
            usuario.setNome(u.nome());
            usuario.setFuncao(u.funcao());
            usuario.setStatusUsuario(StatusUsuario.valueOf(u.statusUsuario()));
            usuario.setPerfil(TipoPerfil.valueOf(u.perfil()));

            repository.usuarioRepository.save(usuario);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> delete(UUID id) {

        Optional<Usuario> usuario = repository.usuarioRepository.findById(id);
        if (usuario.isPresent()) {
            repository.usuarioRepository.delete(usuario.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

}
