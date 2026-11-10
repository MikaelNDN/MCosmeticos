package com.example.catalogo.modules.catalog.dto;

import com.example.catalogo.modules.catalog.model.Perfume;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class PerfumeResponseDTO {
    private UUID id;
    private String nome;
    private String marca;
    private String linha;
    private String descricao;
    private BigDecimal preco;
    private BigDecimal precoComDesconto;
    private int estoque;
    private String imagemUrl; // <-- ADICIONADO PARA AS IMAGENS FUNCIONAREM

    public PerfumeResponseDTO(Perfume perfume) {
        this.id = perfume.getId();
        this.nome = perfume.getNome();
        this.marca = perfume.getMarca();
        this.linha = perfume.getLinha();
        this.descricao = perfume.getDescricao();
        this.preco = perfume.getPreco();
        this.precoComDesconto = perfume.getPrecoComDesconto();
        this.estoque = perfume.getEstoque();
        this.imagemUrl = perfume.getImagemUrl(); // <-- ADICIONADO AQUI TAMBÉM
    }
}