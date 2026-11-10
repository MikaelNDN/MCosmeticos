package com.example.catalogo.modules.engagement.repository;

import com.example.catalogo.modules.engagement.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoritoRepository extends JpaRepository<Favorito, UUID> {

    // Substituído o 'exists' por 'findBy' para retornar o objeto e podermos apagá-lo no Toggle
    Optional<Favorito> findByUsuarioIdAndPerfumeId(UUID usuarioId, UUID perfumeId);

    List<Favorito> findByUsuarioId(UUID usuarioId);

    void deleteByPerfumeId(UUID perfumeId);
}