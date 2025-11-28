package br.com.allservice.repository;

import br.com.allservice.domain.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID>, JpaSpecificationExecutor<Servico> {
    List<Servico> findByDataBetween(Date dataInicio, Date dataFim);
    Optional<Servico> findByNotaFiscal(String notaFiscal);
}
