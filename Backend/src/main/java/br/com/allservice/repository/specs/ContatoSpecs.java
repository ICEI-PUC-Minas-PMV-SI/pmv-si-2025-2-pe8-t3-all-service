package br.com.allservice.repository.specs;

import br.com.allservice.domain.Contato;
import br.com.allservice.enums.TipoSetor;
import org.springframework.data.jpa.domain.Specification;

public class ContatoSpecs {

    /**
     *             String idEmpresa,
     *             String responsavel,
     *             TipoSetor setor,
     *             String telefone,
     *             String email
     */

    public static Specification<Contato> nomeEmpresaLike(String nomeEmpresa) {
        return (root, query, criteriaBuilder) -> {
//            Join<Object, Object> joinEmpresa = root.join("empresa", JoinType.LEFT);
//            return criteriaBuilder.like(
//                    criteriaBuilder.upper(
//                            joinEmpresa.get("razaoSocial")
//                    ), "%" + nomeEmpresa.toUpperCase() + "%"
//            );
            return criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("empresa").get("razaoSocial")), "%" + nomeEmpresa.toUpperCase() + "%"
            );
        } ;
    }

    public static Specification<Contato> responsavelLike(String responsavel) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like( criteriaBuilder.upper(root.get("responsavel")), "%" + responsavel.toUpperCase() + "%") ;
    }

    public static Specification<Contato> setorEqual(TipoSetor setor) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("setor")),  setor.toString().toUpperCase()) ;
    }

    public static Specification<Contato> telefoneEqual(String telefone) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("telefone")),  telefone.toUpperCase()) ;
    }

    public static Specification<Contato> emailEqual(String email) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("email")),  email.toUpperCase() ) ;
    }


}
