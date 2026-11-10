package com.example.catalogo.modules.catalog.service;

import com.example.catalogo.modules.catalog.dto.PerfumeCadastroDTO;
import com.example.catalogo.modules.catalog.dto.PerfumeResponseDTO;
import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class PerfumeService {
    private final PerfumeRepository repository;
    private final UploadService uploadService;

    public PerfumeService(PerfumeRepository repository, UploadService uploadService) {
        this.repository = repository;
        this.uploadService = uploadService;
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public PerfumeResponseDTO cadastrar(PerfumeCadastroDTO dto) {
        Perfume perfume = new Perfume();
        perfume.setNome(dto.getNome());
        perfume.setMarca(dto.getMarca());
        perfume.setLinha(dto.getLinha());
        perfume.setDescricao(dto.getDescricao());
        perfume.setPreco(dto.getPreco());
        perfume.setEstoque(dto.getEstoque());
        perfume.setAtivo(true); // O produto já nasce visível no catálogo

        return new PerfumeResponseDTO(repository.save(perfume));
    }

    public Page<PerfumeResponseDTO> listarTodos(Pageable pageable) {
        Page<Perfume> perfumes = isAdmin() ? repository.findAll(pageable) : repository.findByAtivoTrue(pageable);
        return perfumes.map(PerfumeResponseDTO::new);
    }

    public Page<PerfumeResponseDTO> buscarPorNome(String nome, Pageable pageable) {
        Page<Perfume> perfumes = isAdmin() ?
                repository.findByNomeContainingIgnoreCase(nome, pageable) :
                repository.findByAtivoTrueAndNomeContainingIgnoreCase(nome, pageable);
        return perfumes.map(PerfumeResponseDTO::new);
    }

    public Page<PerfumeResponseDTO> buscarPorMarca(String marca, Pageable pageable) {
        Page<Perfume> perfumes = isAdmin() ?
                repository.findByMarcaContainingIgnoreCase(marca, pageable) :
                repository.findByAtivoTrueAndMarcaContainingIgnoreCase(marca, pageable);
        return perfumes.map(PerfumeResponseDTO::new);
    }

    public PerfumeResponseDTO buscarPorId(UUID id) {
        Perfume perfume = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        // Se não for admin e o perfume estiver inativo, não permite acesso.
        if (!isAdmin() && !perfume.isAtivo()) {
            throw new RuntimeException("Perfume não disponível.");
        }
        return new PerfumeResponseDTO(perfume);
    }

    public PerfumeResponseDTO atualizarImagem(UUID id, MultipartFile arquivo) {
        Perfume perfume = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        String urlDaImagem = uploadService.fazerUploadImagem(arquivo);
        perfume.setImagemUrl(urlDaImagem);

        return new PerfumeResponseDTO(repository.save(perfume));
    }

    public PerfumeResponseDTO atualizar(UUID id, PerfumeCadastroDTO dto) {
        Perfume perfume = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        perfume.setNome(dto.getNome());
        perfume.setMarca(dto.getMarca());
        perfume.setLinha(dto.getLinha());
        perfume.setDescricao(dto.getDescricao());
        perfume.setPreco(dto.getPreco());
        perfume.setEstoque(dto.getEstoque());

        return new PerfumeResponseDTO(repository.save(perfume));
    }

    @Transactional
    public void deletar(UUID id) {
        Perfume perfume = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        // Soft Delete: Apenas inativa o perfume.
        // Assim, o histórico de favoritos e referências antigas não quebram.
        perfume.setAtivo(false);
        repository.save(perfume);
    }
}
