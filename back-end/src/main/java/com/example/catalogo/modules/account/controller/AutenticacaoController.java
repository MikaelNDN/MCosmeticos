package com.example.catalogo.modules.account.controller;

import com.example.catalogo.modules.account.dto.LoginDTO;
import com.example.catalogo.modules.account.model.Usuario;
import com.example.catalogo.modules.account.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")

public class AutenticacaoController {

    private final AuthenticationManager manager;
    private final TokenService tokenService;

    public AutenticacaoController(AuthenticationManager manager, TokenService tokenService) {
        this.manager = manager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> efetuarLogin(@RequestBody LoginDTO dto) {
        // Encapsula o e-mail e a senha em um token padrão do Spring Security
        var authenticationToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());

        // O manager vai no banco (via AutenticacaoService), compara o Hash da senha e valida
        var authentication = manager.authenticate(authenticationToken);

        // Se a senha estiver correta, geramos o nosso JWT
        var tokenJWT = tokenService.gerarToken((Usuario) authentication.getPrincipal());

        return ResponseEntity.ok(tokenJWT);
    }
}
