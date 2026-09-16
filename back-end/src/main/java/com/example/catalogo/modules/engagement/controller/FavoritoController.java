package com.example.catalogo.modules.engagement.controller;

import com.example.catalogo.modules.account.model.Usuario;
import com.example.catalogo.modules.account.repository.UsuarioRepository;
import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import com.example.catalogo.modules.engagement.model.Favorito;
import com.example.catalogo.modules.engagement.repository.FavoritoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final UsuarioRepository usuarioRepository;
    private final PerfumeRepository perfumeRepository;
    private final FavoritoRepository favoritoRepository;

    public FavoritoController(UsuarioRepository usuarioRepository,
                              PerfumeRepository perfumeRepository,
                              FavoritoRepository favoritoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.perfumeRepository = perfumeRepository;
        this.favoritoRepository = favoritoRepository;
    }

    private Usuario getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @GetMapping
    public ResponseEntity<List<Perfume>> listarFavoritos() {
        Usuario usuario = getUsuarioLogado();
        List<Favorito> favoritos = favoritoRepository.findByUsuarioId(usuario.getId());

        // Extrai apenas os perfumes a partir da lista de favoritos do usuário
        List<Perfume> perfumesFavoritos = favoritos.stream()
                .map(Favorito::getPerfume)
                .collect(Collectors.toList());

        return ResponseEntity.ok(perfumesFavoritos);
    }

    @PostMapping("/{perfumeId}")
    public ResponseEntity<Void> toggleFavorito(@PathVariable("perfumeId") UUID perfumeId) {
        Usuario usuario = getUsuarioLogado();
        Perfume perfume = perfumeRepository.findById(perfumeId)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        boolean existe = favoritoRepository.existsByUsuarioIdAndPerfumeId(usuario.getId(), perfumeId);

        if (existe) {
            // Se já existe, remove o favorito correspondente
            List<Favorito> favoritos = favoritoRepository.findByUsuarioId(usuario.getId());
            favoritos.stream()
                    .filter(f -> f.getPerfume().getId().equals(perfumeId))
                    .forEach(favoritoRepository::delete);
        } else {
            // Se não existe, cria um novo registro na tabela tb_favoritos
            Favorito novoFavorito = new Favorito();
            novoFavorito.setUsuario(usuario);
            novoFavorito.setPerfume(perfume);
            favoritoRepository.save(novoFavorito);
        }

        return ResponseEntity.ok().build();
    }
}