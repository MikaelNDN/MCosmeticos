package com.example.catalogo.infra.exception;

import java.time.LocalDateTime;

public record ErroResposta(
        String erro,
        Integer status,
        LocalDateTime momento
) {
}