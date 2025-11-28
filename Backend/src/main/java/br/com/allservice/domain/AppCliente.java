package br.com.allservice.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "CLIENT_ID", length = 150, nullable = false)
    private String clientId;

    @Column(name = "CLIENT_SECRET", length = 400, nullable = false)
    private String clientSecret;

    @Column(name = "REDIRECT_URI", length = 200, nullable = false)
    private String redirectUri;

    @Column(name = "SCOPE", length = 50, nullable = false)
    private String scope;
}
