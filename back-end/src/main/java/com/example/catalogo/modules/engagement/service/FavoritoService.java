package com.example.catalogo.modules.engagement.service;

import com.example.catalogo.modules.account.repository.UsuarioRepository;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import com.example.catalogo.modules.engagement.model.Favorito;
import com.example.catalogo.modules.engagement.repository.FavoritoRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfumeRepository perfumeRepository;

    public FavoritoService(FavoritoRepository favoritoRepository, UsuarioRepository usuarioRepository, PerfumeRepository perfumeRepository) {
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.perfumeRepository = perfumeRepository;
    }

    @Transactional
    public void alternarFavorito(UUID perfumeId) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        var usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        var perfume = perfumeRepository.findById(perfumeId)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        // Busca se a relação já existe
        Optional<Favorito> favoritoExistente = favoritoRepository.findByUsuarioIdAndPerfumeId(usuario.getId(), perfume.getId());

        if (favoritoExistente.isPresent()) {
            // Se já existe, a regra de negócio manda REMOVER (Toggle)
            favoritoRepository.delete(favoritoExistente.get());
        } else {
            // Se não existe, ADICIONA aos favoritos
            Favorito favorito = new Favorito();
            favorito.setUsuario(usuario);
            favorito.setPerfume(perfume);
            favorito.setDataCriacao(LocalDateTime.now());
            favoritoRepository.save(favorito);
        }
    }

    public List<Favorito> listarMeusFavoritos(){
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        var usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return favoritoRepository.findByUsuarioId(usuario.getId());
    }
}