package com.example.catalogo.modules.engagement.repository;

import com.example.catalogo.modules.engagement.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FavoritoRepository extends JpaRepository<Favorito, UUID> {
    // O Spring monta a query SQL sozinho apenas lendo o nome deste método!
    boolean existsByUsuarioIdAndPerfumeId(UUID usuarioId, UUID perfumeId);

    List<Favorito> findByUsuarioId(UUID usuarioId);

    // Adicione esta linha para apagar os favoritos vinculados antes de deletar o perfume
    void deleteByPerfumeId(UUID perfumeId);
}