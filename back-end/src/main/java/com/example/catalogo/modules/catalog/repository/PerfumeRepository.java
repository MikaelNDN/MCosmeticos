package com.example.catalogo.modules.catalog.repository;

import com.example.catalogo.modules.catalog.model.Perfume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PerfumeRepository extends JpaRepository<Perfume, UUID> {

    // Consultas para Usuários Comuns (apenas ativos)
    Page<Perfume> findByAtivoTrue(Pageable pageable);
    Page<Perfume> findByAtivoTrueAndNomeContainingIgnoreCase(String nome, Pageable pageable);
    Page<Perfume> findByAtivoTrueAndMarcaContainingIgnoreCase(String marca, Pageable pageable);

    // Consultas para Administradores (ativos e inativos)
    Page<Perfume> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
    Page<Perfume> findByMarcaContainingIgnoreCase(String marca, Pageable pageable);

    // NOTA: O método removerDosFavoritos() com SQL nativo obsoleto foi removido.
}