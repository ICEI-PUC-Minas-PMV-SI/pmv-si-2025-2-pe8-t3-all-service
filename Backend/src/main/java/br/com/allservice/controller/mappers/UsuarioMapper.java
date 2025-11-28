package br.com.allservice.controller.mappers;

import br.com.allservice.controller.dto.UsuarioDTO;
import br.com.allservice.domain.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    Usuario toEntity(UsuarioDTO dto);
    UsuarioDTO toDto(Usuario usuario);
}
