package com.example.catalogo.modules.account.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.example.catalogo.modules.account.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private String getSecretKey() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("O segredo JWT (API_SECURITY_TOKEN_SECRET) não está configurado nas variáveis de ambiente!");
        }
        return secret;
    }

    public String gerarToken(Usuario usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(getSecretKey());
            Instant expiracao = gerarDataExpiracao();
            System.out.println(">>> TOKEN NOVO GERADO PARA: " + usuario.getEmail() + " | Expira em: " + expiracao);
            return JWT.create()
                    .withIssuer("MCosmeticos-API")
                    .withSubject(usuario.getEmail())
                    .withClaim("role", usuario.getRole().name())
                    .withExpiresAt(expiracao)
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    private Instant gerarDataExpiracao() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }

    public String validarToken(String tokenJWT) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(getSecretKey());
            return JWT.require(algoritmo)
                    .withIssuer("MCosmeticos-API")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (com.auth0.jwt.exceptions.JWTVerificationException exception) {
            System.err.println("Erro ao validar token JWT: " + exception.getMessage());
            return null;
        }
    }
}