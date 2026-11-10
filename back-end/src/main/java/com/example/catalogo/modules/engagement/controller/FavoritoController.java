package com.example.catalogo.modules.engagement.controller;

import com.example.catalogo.modules.catalog.dto.PerfumeResponseDTO;
import com.example.catalogo.modules.engagement.model.Favorito;
import com.example.catalogo.modules.engagement.service.FavoritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping
    public ResponseEntity<List<PerfumeResponseDTO>> listarFavoritos() {
        // Busca os favoritos no serviço
        List<Favorito> favoritos = favoritoService.listarMeusFavoritos();

        // Converte a entidade Perfume para o novo PerfumeResponseDTO
        List<PerfumeResponseDTO> perfumesFavoritos = favoritos.stream()
                .map(f -> new PerfumeResponseDTO(f.getPerfume()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(perfumesFavoritos);
    }

    @PostMapping("/{perfumeId}")
    public ResponseEntity<Void> toggleFavorito(@PathVariable("perfumeId") UUID perfumeId) {
        favoritoService.alternarFavorito(perfumeId);
        return ResponseEntity.ok().build();
    }
}