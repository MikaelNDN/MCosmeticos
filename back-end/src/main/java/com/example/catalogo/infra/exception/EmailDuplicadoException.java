package com.example.catalogo.infra.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailDuplicadoException extends RuntimeException {
    public EmailDuplicadoException(String mensagem) {
        super(mensagem);
    }
}