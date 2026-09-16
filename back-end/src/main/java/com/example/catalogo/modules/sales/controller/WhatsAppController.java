package com.example.catalogo.modules.sales.controller;

import com.example.catalogo.modules.sales.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendas")
public class WhatsAppController {

    private final WhatsAppService service;

    public WhatsAppController(WhatsAppService service) {
        this.service = service;
    }

    @GetMapping("/whatsapp/{perfumeId}")
    public ResponseEntity<Map<String, String>> iniciarCompraPeloWhatsapp(@PathVariable UUID perfumeId) {
        String linkGerado = service.gerarLinkDeCompra(perfumeId);

        return ResponseEntity.ok(Map.of("whatsappUrl", linkGerado));
    }
}