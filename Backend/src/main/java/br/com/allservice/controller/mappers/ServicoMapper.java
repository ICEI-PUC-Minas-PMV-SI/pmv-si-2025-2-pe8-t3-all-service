package br.com.allservice.controller.mappers;

import br.com.allservice.controller.dto.ServicoDTO;
import br.com.allservice.domain.Servico;
import br.com.allservice.repository.RepositoryFacade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = { UsuarioMapper.class, EmpresaMapper.class })
public abstract class  ServicoMapper {

    @Autowired
    public RepositoryFacade repository;

    @Mapping(target = "usuario", expression = "java(repository.usuarioRepository.findById(UUID.fromString(dto.idUsuario())).orElse(null) )")
    @Mapping(target = "empresa", expression = "java(repository.empresaRepository.findById(UUID.fromString(dto.idEmpresa())).orElse(null) )")
    public abstract Servico toEntity(ServicoDTO dto);

    @Mapping(source = "empresa", target = "empresaDTO")
    @Mapping(source = "usuario", target = "usuarioDTO")
    public abstract ServicoDTO toDto(Servico servico);
}
