package br.com.allservice.controller.mappers;

import br.com.allservice.controller.dto.EmpresaDTO;
import br.com.allservice.domain.Empresa;
import br.com.allservice.repository.RepositoryFacade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class EmpresaMapper {

    @Autowired
    RepositoryFacade repository;

    @Mapping(target = "usuario", expression = "java(repository.usuarioRepository.findById(UUID.fromString(dto.idUsuario())).orElse(null) )")
    public abstract Empresa toEntity(EmpresaDTO dto);
    public abstract EmpresaDTO toDto(Empresa empresa);
}
