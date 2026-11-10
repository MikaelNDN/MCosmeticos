package com.example.catalogo.infra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class TratadorDeErros {

    // Tratamento específico para a duplicidade de e-mail (Retorna 409 Conflict)
    @ExceptionHandler(EmailDuplicadoException.class)
    public ResponseEntity<ErroResposta> tratarEmailDuplicado(EmailDuplicadoException ex) {
        ErroResposta erro = new ErroResposta(
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Tratamento genérico para as demais RuntimeExceptions (Retorna 400 Bad Request)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErroResposta> tratarRegraDeNegocio(RuntimeException ex) {
        ErroResposta erro = new ErroResposta(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }
}