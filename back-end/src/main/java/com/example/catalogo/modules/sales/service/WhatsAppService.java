package com.example.catalogo.modules.sales.service;

import com.example.catalogo.modules.account.repository.UsuarioRepository;
import com.example.catalogo.modules.catalog.repository.PerfumeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class WhatsAppService {

    @Value("${whatsapp.loja.numero}")
    private String numeroLoja;

    private final UsuarioRepository usuarioRepository;
    private final PerfumeRepository perfumeRepository;

    public WhatsAppService(UsuarioRepository usuarioRepository, PerfumeRepository perfumeRepository) {
        this.usuarioRepository = usuarioRepository;
        this.perfumeRepository = perfumeRepository;
    }

    public String gerarLinkDeCompra(UUID perfumeId) {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        var usuario = usuarioRepository.findByEmail(emailLogado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        var perfume = perfumeRepository.findById(perfumeId)
                .orElseThrow(() -> new RuntimeException("Perfume não encontrado"));

        // Ajustado para receber: 1: Nome, 2: Nome do Perfume, 3: Marca, 4: Preço
        String mensagem = String.format(
                "Olá! Me chamo %s. Tenho interesse em comprar o perfume %s (%s). O valor de R$ %.2f ainda está disponível?",
                usuario.getNome(),
                perfume.getNome(),
                perfume.getMarca(),
                perfume.getPreco()
        );

        String textoCodificado = URLEncoder.encode(mensagem, StandardCharsets.UTF_8);

        return "https://wa.me/" + numeroLoja + "?text=" + textoCodificado;
    }
}