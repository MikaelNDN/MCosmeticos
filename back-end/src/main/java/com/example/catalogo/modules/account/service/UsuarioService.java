package com.example.catalogo.modules.account.service;

import com.example.catalogo.modules.account.dto.UsuarioCadastroDTO;
import com.example.catalogo.modules.account.model.Role;
import com.example.catalogo.modules.account.model.Usuario;
import com.example.catalogo.modules.account.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate; // Import necessário

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario cadastrar(UsuarioCadastroDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(dto.nome());
        novoUsuario.setSobrenome(dto.sobrenome());

        // Conversão de String para LocalDate enviada pelo input type="date" do front-end
        novoUsuario.setDataNascimento(LocalDate.parse(dto.dataNascimento()));

        novoUsuario.setEmail(dto.email());
        novoUsuario.setSenha(passwordEncoder.encode(dto.senha()));
        novoUsuario.setRole(Role.USER); // Todo mundo que se cadastra pelo app é USER padrão

        return repository.save(novoUsuario);
    }
}