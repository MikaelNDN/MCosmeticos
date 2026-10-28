package com.example.mperfumes.modules.account.controller;

import com.example.mperfumes.modules.account.dto.UsuarioCadastroDTO;
import com.example.mperfumes.modules.account.model.Usuario;
import com.example.mperfumes.modules.account.repository.UsuarioRepository;
import com.example.mperfumes.modules.account.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioService service, UsuarioRepository usuarioRepository) {
        this.service = service;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Usuario> cadastrar(@RequestBody @Valid UsuarioCadastroDTO dto) {
        Usuario usuarioCriado = service.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> getPerfilLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(usuario);
    }
}