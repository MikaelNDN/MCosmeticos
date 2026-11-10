package com.example.catalogo.modules.catalog.service;

import com.example.catalogo.modules.catalog.dto.PerfumeCadastroDTO;
import com.example.catalogo.modules.catalog.dto.PerfumeResponseDTO;
import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
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

    @BeforeEach
    void setUpSecurityContext() {
        // Como o serviço agora verifica se o utilizador é ADMIN, precisamos de criar
        // um contexto de segurança falso (Mock) para os testes passarem sem erros de NullPointer.
        Authentication authentication = Mockito.mock(Authentication.class);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);

        // Simula um utilizador comum (sem roles de admin)
        Mockito.lenient().when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        Mockito.lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Deve retornar uma pagina de perfumes quando buscar por nome")
    void deveBuscarPerfumePorNome() {
        String nomeBusca = "Malbec";
        Perfume perfumeFalso = new Perfume();
        perfumeFalso.setId(UUID.randomUUID());
        perfumeFalso.setNome("Malbec Icon");
        perfumeFalso.setMarca("O Boticário");
        perfumeFalso.setPreco(new BigDecimal("299.90"));

        Page<Perfume> paginaFalsa = new PageImpl<>(List.of(perfumeFalso));
        Pageable pageable = PageRequest.of(0, 10);

        // Como o utilizador mockado não é ADMIN, o serviço chama o método 'findByAtivoTrue...'
        when(repository.findByAtivoTrueAndNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class)))
                .thenReturn(paginaFalsa);

        // O resultado agora é esperado em DTO
        Page<PerfumeResponseDTO> resultado = service.buscarPorNome(nomeBusca, pageable);

        assertFalse(resultado.isEmpty());
        assertEquals("Malbec Icon", resultado.getContent().get(0).getNome());

        Mockito.verify(repository).findByAtivoTrueAndNomeContainingIgnoreCase(eq(nomeBusca), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve salvar um perfume com sucesso")
    void deveSalvarPerfume() {
        PerfumeCadastroDTO dtoParaSalvar = new PerfumeCadastroDTO();
        dtoParaSalvar.setNome("Acqua Di Gio");
        dtoParaSalvar.setMarca("Giorgio Armani");
        dtoParaSalvar.setLinha("Acqua");
        dtoParaSalvar.setDescricao("Perfume aquático e marcante");
        dtoParaSalvar.setPreco(new BigDecimal("650.00"));
        dtoParaSalvar.setEstoque(10);

        Perfume perfumeSalvo = new Perfume();
        perfumeSalvo.setId(UUID.randomUUID());
        perfumeSalvo.setNome(dtoParaSalvar.getNome());
        perfumeSalvo.setMarca(dtoParaSalvar.getMarca());
        perfumeSalvo.setLinha(dtoParaSalvar.getLinha());
        perfumeSalvo.setDescricao(dtoParaSalvar.getDescricao());
        perfumeSalvo.setPreco(dtoParaSalvar.getPreco());
        perfumeSalvo.setEstoque(dtoParaSalvar.getEstoque());

        when(repository.save(any(Perfume.class))).thenReturn(perfumeSalvo);

        // O serviço agora devolve um DTO
        PerfumeResponseDTO resultado = service.cadastrar(dtoParaSalvar);

        assertNotNull(resultado.getId(), "O ID do perfume gerado não deveria ser nulo");
        assertEquals("Acqua Di Gio", resultado.getNome());
        assertEquals(10, resultado.getEstoque());

        Mockito.verify(repository, Mockito.times(1)).save(any(Perfume.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar um perfume por ID que não existe")
    void deveLancarExcecaoBuscaIdInexistente() {
        UUID idInexistente = UUID.randomUUID();

        when(repository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            service.buscarPorId(idInexistente);
        }, "Deveria lançar uma exceção ao não encontrar o perfume");

        Mockito.verify(repository).findById(idInexistente);
    }

    @Test
    @DisplayName("Deve inativar (Soft Delete) um perfume com sucesso")
    void deveDeletarPerfumeComSucesso() {
        UUID idExistente = UUID.randomUUID();
        Perfume perfumeFalso = new Perfume();
        perfumeFalso.setId(idExistente);
        perfumeFalso.setAtivo(true);

        // O método 'deletar' agora usa 'findById' para recuperar e inativar a entidade
        when(repository.findById(idExistente)).thenReturn(Optional.of(perfumeFalso));

        service.deletar(idExistente);

        // Verifica se a entidade foi modificada para inativa e guardada (Soft Delete)
        assertFalse(perfumeFalso.isAtivo());
        Mockito.verify(repository, Mockito.times(1)).save(perfumeFalso);

        // Assegura que o Hard Delete nunca foi chamado
        Mockito.verify(repository, Mockito.never()).deleteById(idExistente);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar um perfume que não existe")
    void deveLancarExcecaoAoDeletarIdInexistente() {
        UUID idInexistente = UUID.randomUUID();

        when(repository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            service.deletar(idInexistente);
        }, "Deveria abortar e lançar exceção antes de tentar deletar");

        Mockito.verify(repository, Mockito.never()).save(any());
        Mockito.verify(repository, Mockito.never()).deleteById(any());
    }
}