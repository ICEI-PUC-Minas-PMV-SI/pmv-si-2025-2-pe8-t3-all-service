package br.com.allservice.controller.mappers;

import br.com.allservice.controller.dto.ContatoDTO;
import br.com.allservice.domain.Contato;
import br.com.allservice.repository.RepositoryFacade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
//@Mapper(componentModel = "spring", uses = UsuarioMapper.class)
public abstract class ContatoMapper {

    @Autowired
    public RepositoryFacade repository;

    @Mapping(target = "usuario", expression = "java(repository.usuarioRepository.findById(UUID.fromString(dto.idUsuario())).orElse(null) )")
    @Mapping(target = "empresa", expression = "java(repository.empresaRepository.findById(UUID.fromString(dto.idEmpresa())).orElse(null) )")
    public abstract Contato toEntity(ContatoDTO dto);
    public abstract ContatoDTO toDto(Contato contato);
}
