package com.example.mperfumes.modules.catalogo.repository;

import com.example.mperfumes.modules.catalogo.model.Perfume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PerfumeRepository extends JpaRepository<Perfume, UUID> {

    Page<Perfume> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    Page<Perfume> findByMarcaContainingIgnoreCase(String marca, Pageable pageable);

    @Modifying
    @Query(value = "DELETE FROM tb_favoritos WHERE perfumes_id = :perfumeId", nativeQuery = true)
    void removerDosFavoritos(@Param("perfumeId") UUID perfumeId);

}