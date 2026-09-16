package com.example.catalogo.modules.catalog.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerfumeCadastroDTO {
    private String nome;
    private String marca;
    private String linha;
    private String descricao;
    private BigDecimal preco;
    private int estoque;
}