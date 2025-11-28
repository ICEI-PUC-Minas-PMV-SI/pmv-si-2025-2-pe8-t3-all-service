package br.com.allservice.service;

import br.com.allservice.controller.dto.ContatoDTO;
import br.com.allservice.enums.TipoSetor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

public interface ContatoService extends GenericService {
   ResponseEntity<Object> save(ContatoDTO c);

    ResponseEntity<Page<ContatoDTO>> filter(
            String nomeEmpresa,
            String responsavel,
            TipoSetor setor,
            String telefone,
            String email,
            Integer pagina,
            Integer quantidade
    );

    ResponseEntity<ContatoDTO> findById(UUID id);

    ResponseEntity<Object> update(UUID id, ContatoDTO c);

    ResponseEntity<Void> delete(UUID id);

}