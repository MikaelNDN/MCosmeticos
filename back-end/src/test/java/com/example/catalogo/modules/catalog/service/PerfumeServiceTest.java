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
import com.example.catalogo.modules.catalog.dto.PerfumeCadastroDTO;
import com.example.catalogo.modules.engagement.repository.FavoritoRepository;

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

    @Mock
    private FavoritoRepository favoritoRepository;


    @InjectMocks
    private PerfumeService service;


    @Test
    @DisplayName("Deve retornar uma pagina de perfumes quando buscar por nome")
    void deveBuscarPerfumePorNome() {
        String nomeBusca = "Malbec";
        Perfume perfumeFalso = new Perfume();
        perfumeFalso.setNome("Malbec Icon");
        perfumeFalso.setMarca("O Boticário");
        perfumeFalso.setPreco(new BigDecimal("299.90"));

        Page<Perfume> paginaFalsa = new PageImpl<>(List.of(perfumeFalso));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class)))
                .thenReturn(paginaFalsa);

        Page<Perfume> resultado = service.buscarPorNome(nomeBusca, pageable);

        assertFalse(resultado.isEmpty());
        assertEquals("Malbec Icon", resultado.getContent().get(0).getNome());

        Mockito.verify(repository).findByNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class));
    }
    @Test
    @DisplayName("Deve salvar um perfume com sucesso")
    void deveSalvarPerfume() {
        PerfumeCadastroDTO dtoParaSalvar = new PerfumeCadastroDTO(
                "Acqua Di Gio",
                "Giorgio Armani",
                "Acqua",
                "Perfume aquático e marcante",
                new BigDecimal("650.00"),
                10
        );

        Perfume perfumeSalvo = new Perfume();
        perfumeSalvo.setId(java.util.UUID.randomUUID());
        perfumeSalvo.setNome(dtoParaSalvar.getNome());
        perfumeSalvo.setMarca(dtoParaSalvar.getMarca());
        perfumeSalvo.setLinha(dtoParaSalvar.getLinha());
        perfumeSalvo.setDescricao(dtoParaSalvar.getDescricao());
        perfumeSalvo.setPreco(dtoParaSalvar.getPreco());
        perfumeSalvo.setEstoque(dtoParaSalvar.getEstoque());

        when(repository.save(any(Perfume.class))).thenReturn(perfumeSalvo);


        Perfume resultado = service.cadastrar(dtoParaSalvar); // Ajuste o nome do método caso no service seja 'cadastrar' ou 'salvar'


        org.junit.jupiter.api.Assertions.assertNotNull(resultado.getId(), "O ID do perfume gerado não deveria ser nulo");
        assertEquals("Acqua Di Gio", resultado.getNome());
        assertEquals(10, resultado.getEstoque());

        Mockito.verify(repository, Mockito.times(1)).save(any(Perfume.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar um perfume por ID que não existe")
    void deveLancarExcecaoBuscaIdInexistente() {

        java.util.UUID idInexistente = java.util.UUID.randomUUID();

        when(repository.findById(idInexistente)).thenReturn(java.util.Optional.empty());


        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            service.buscarPorId(idInexistente); // Substitua pelo nome do seu método de busca por ID
        }, "Deveria lançar uma exceção ao não encontrar o perfume");

        Mockito.verify(repository).findById(idInexistente);
    }
    @Test
    @DisplayName("Deve deletar um perfume e seus favoritos com sucesso")
    void deveDeletarPerfumeComSucesso() {

        java.util.UUID idExistente = java.util.UUID.randomUUID();


        when(repository.existsById(idExistente)).thenReturn(true);


        service.deletar(idExistente);



        Mockito.verify(favoritoRepository, Mockito.times(1)).deleteByPerfumeId(idExistente);

        Mockito.verify(repository, Mockito.times(1)).deleteById(idExistente);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar um perfume que não existe")
    void deveLancarExcecaoAoDeletarIdInexistente() {
        java.util.UUID idInexistente = java.util.UUID.randomUUID();


        when(repository.existsById(idInexistente)).thenReturn(false);

        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            service.deletar(idInexistente);
        }, "Deveria abortar e lançar exceção antes de tentar deletar");

        Mockito.verify(favoritoRepository, Mockito.never()).deleteByPerfumeId(any());
        Mockito.verify(repository, Mockito.never()).deleteById(any());
    }
}
