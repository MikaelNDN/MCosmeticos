package com.example.catalogo.modules.engagement.service;

import com.example.catalogo.modules.account.repository.UsuarioRepository;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import com.example.catalogo.modules.engagement.dto.FavoritoRequestDTO;
import com.example.catalogo.modules.engagement.model.Favorito;
import com.example.catalogo.modules.engagement.repository.FavoritoRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public Favorito favoritar(FavoritoRequestDTO dto) {

        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        var usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));


        var perfume = perfumeRepository.findById(dto.perfumeId())
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));


        if (favoritoRepository.existsByUsuarioIdAndPerfumeId(usuario.getId(), perfume.getId())) {
            throw new RuntimeException("Este perfume já está nos seus favoritos!");
        }


        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setPerfume(perfume);
        favorito.setDataCriacao(LocalDateTime.now());

        return favoritoRepository.save(favorito);
    }

    public List<Favorito> listarMeusFavoritos(){
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        var usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return favoritoRepository.findByUsuarioId(usuario.getId());
    }
}