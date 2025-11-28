package br.com.allservice.repository.specs;

import br.com.allservice.domain.Usuario;
import br.com.allservice.enums.StatusUsuario;
import br.com.allservice.enums.TipoPerfil;
import org.springframework.data.jpa.domain.Specification;

public class UsuarioSpecs {

    /**
     *             String statusUsuario,
     *             String funcao,
     *             StatusUsuario statusUsuario,
     *             TipoPerfil perfil
     */

    public static Specification<Usuario> nomeLike(String nome) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like( criteriaBuilder.upper(root.get("nome")), "%" + nome.toUpperCase() + "%") ;
    }

    public static Specification<Usuario> funcaoEquals(String funcao) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("funcao")), funcao.toUpperCase()) ;
    }
    public static Specification<Usuario> statusUsuarioEquals(StatusUsuario statusUsuario) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("statusUsuario")), statusUsuario.toString().toUpperCase()) ;
    }
    public static Specification<Usuario> perfilEquals(TipoPerfil perfil) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal( criteriaBuilder.upper(root.get("perfil")), perfil.toString().toUpperCase()) ;
    }
}
