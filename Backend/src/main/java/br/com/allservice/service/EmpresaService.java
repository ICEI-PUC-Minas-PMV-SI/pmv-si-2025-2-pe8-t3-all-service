package br.com.allservice.service;

import br.com.allservice.controller.dto.EmpresaDTO;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

public interface EmpresaService extends GenericService {
    ResponseEntity<Object> save(EmpresaDTO e);

    ResponseEntity<Page<EmpresaDTO>> filter(
            String razaoSocial,
            String cnpj,
            String endereco,
            Integer pagina,
            Integer quantidade
    );

    ResponseEntity<EmpresaDTO> findById(UUID id);

    ResponseEntity<Object> update(UUID id, EmpresaDTO e);

    ResponseEntity<Void> delete(UUID id);
}
