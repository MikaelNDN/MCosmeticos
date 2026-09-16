package com.example.catalogo.modules.catalog.controller;

import com.example.catalogo.modules.catalog.dto.PerfumeCadastroDTO;
import com.example.catalogo.modules.catalog.model.Perfume;
import com.example.catalogo.modules.catalog.service.PerfumeService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/perfumes")
@CrossOrigin(origins = "http://localhost:3000")
public class PerfumeController {

    private final PerfumeService service;

    public PerfumeController(PerfumeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Perfume> cadastrar(
            @ModelAttribute PerfumeCadastroDTO dto,
            // Alterado de "file" para "imagem" para casar exatamente com o FormData do Next.js
            @RequestParam(value = "imagem", required = false) MultipartFile file) {

        Perfume perfumeCriado = service.cadastrar(dto);
        if (file != null && !file.isEmpty()){
            perfumeCriado = service.atualizarImagem(perfumeCriado.getId(), file);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(perfumeCriado);
    }

    @PostMapping("/{id}/imagem")
    public ResponseEntity<Perfume> fazerUploadImagem(
            @PathVariable UUID id,
            // Alterado aqui também por precaução para manter o padrão
            @RequestParam("imagem") MultipartFile file) {

        Perfume perfumeAtualizado = service.atualizarImagem(id, file);
        return ResponseEntity.ok(perfumeAtualizado);
    }

    @GetMapping
    public ResponseEntity<Page<Perfume>> listarCatalogo(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String marca,
            @org.springframework.data.web.PageableDefault(page = 0, size = 10, sort = "nome") org.springframework.data.domain.Pageable pageable) {

        if (marca != null && !marca.isEmpty()) {
            return ResponseEntity.ok(service.buscarPorMarca(marca, pageable));
        }
        else if (nome != null && !nome.isEmpty()) {
            return ResponseEntity.ok(service.buscarPorNome(nome, pageable));
        }

        return ResponseEntity.ok(service.listarTodos(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Perfume> atualizar(
            @PathVariable UUID id,
            @ModelAttribute PerfumeCadastroDTO dto,
            // Alterado de "file" para "imagem" para casar com o FormData da edição
            @RequestParam(value = "imagem", required = false) MultipartFile file) {

        Perfume perfumeAtualizado = service.atualizar(id, dto);
        if (file != null && !file.isEmpty()) {
            perfumeAtualizado = service.atualizarImagem(id, file);
        }
        return ResponseEntity.ok(perfumeAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Perfume> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}