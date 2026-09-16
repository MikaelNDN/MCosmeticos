package com.example.catalogo.modules.catalog.service;

import com.example.catalogo.modules.catalog.dto.PerfumeCadastroDTO;
import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import com.example.catalogo.modules.engagement.repository.FavoritoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class PerfumeService {
    private final FavoritoRepository favoritoRepository;
    private final PerfumeRepository repository;
    private final UploadService uploadService;

    public PerfumeService(PerfumeRepository repository, UploadService uploadService, FavoritoRepository favoritoRepository) {
        this.repository = repository;
        this.uploadService = uploadService;
        this.favoritoRepository = favoritoRepository;
    }

    public Perfume cadastrar(PerfumeCadastroDTO dto) {
        Perfume perfume = new Perfume();
        perfume.setNome(dto.getNome());
        perfume.setMarca(dto.getMarca());
        perfume.setLinha(dto.getLinha());
        perfume.setDescricao(dto.getDescricao());
        perfume.setPreco(dto.getPreco());
        perfume.setEstoque(dto.getEstoque());
        perfume.setAtivo(true); // O produto já nasce visível no catálogo

        return repository.save(perfume);
    }

    public Page<Perfume> listarTodos(Pageable pageable){
        return  repository.findAll(pageable);
    }

    public Perfume atualizarImagem(UUID id, MultipartFile arquivo) {
        Perfume perfume = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        String urlDaImagem = uploadService.fazerUploadImagem(arquivo);

        perfume.setImagemUrl(urlDaImagem);

        return repository.save(perfume);
    }

    public Page<Perfume> buscarPorNome(String nome,Pageable pageable) {
        return repository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public Page<Perfume> buscarPorMarca(String marca, Pageable pageable) {
        return repository.findByMarcaContainingIgnoreCase(marca, pageable);
    }

    public Perfume atualizar(UUID id, PerfumeCadastroDTO dto) {
        Perfume perfume = repository.findById(id) // <--- Alterado de perfumeRepository para repository
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        perfume.setNome(dto.getNome());
        perfume.setMarca(dto.getMarca());
        perfume.setLinha(dto.getLinha());
        perfume.setDescricao(dto.getDescricao());
        perfume.setPreco(dto.getPreco());
        perfume.setEstoque(dto.getEstoque());

        return repository.save(perfume); // <--- Alterado aqui também
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Perfume não encontrado");
        }

        favoritoRepository.deleteByPerfumeId(id);

        repository.deleteById(id);
    }

    public Perfume buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));
    }

}