package br.com.allservice.repository.specs;

import br.com.allservice.domain.Empresa;
import org.springframework.data.jpa.domain.Specification;

public class EmpresaSpecs {

    /**
     *             String razaoSocial,
     *             String cnpj,
     *             String endereco
     */

    public static Specification<Empresa> razaoSociallLike(String razaoSocial) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like( criteriaBuilder.upper(root.get("razaoSocial")), "%" + razaoSocial.toUpperCase() + "%") ;
    }

    public static Specification<Empresa> cnpjEqual(String cnpj) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("cnpj")),  cnpj.toUpperCase()) ;
    }

    public static Specification<Empresa> enderecolLike(String endereco) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like( criteriaBuilder.upper(root.get("endereco")), "%" + endereco.toUpperCase() + "%") ;
    }
}
