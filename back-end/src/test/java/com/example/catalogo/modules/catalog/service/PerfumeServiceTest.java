package com.example.catalogo.modules.catalog.service;

import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PerfumeServiceTest {

    @Mock
    private PerfumeRepository repository;

    @Mock
    private UploadService uploadService;

    @InjectMocks
    private PerfumeService service;

    @Test
    @DisplayName("Deve retornar uma pagina de perfumes quando buscar por nome")
    void deveBuscarPerfumePorNome() {
        // 1. ARRANGE (Preparar)
        String nomeBusca = "Malbec";
        Perfume perfumeFalso = new Perfume();
        perfumeFalso.setNome("Malbec Icon");
        perfumeFalso.setMarca("O Boticário");
        perfumeFalso.setPreco(new BigDecimal("299.90"));

        // Cria uma página falsa e um objeto Pageable para simular o que o Front-end mandaria
        Page<Perfume> paginaFalsa = new PageImpl<>(List.of(perfumeFalso));
        Pageable pageable = PageRequest.of(0, 10);

        // O Mockito exige: se você usar o any() para um parâmetro, tem que usar eq() para o outro
        when(repository.findByNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class)))
                .thenReturn(paginaFalsa);

        // 2. ACT (Agir)
        Page<Perfume> resultado = service.buscarPorNome(nomeBusca, pageable);

        // 3. ASSERT (Verificar)
        assertFalse(resultado.isEmpty());
        // Para acessar os itens de um Page, usamos o .getContent()
        assertEquals("Malbec Icon", resultado.getContent().get(0).getNome());

        Mockito.verify(repository).findByNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class));
    }
}