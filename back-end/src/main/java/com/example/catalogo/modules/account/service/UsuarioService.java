package com.example.catalogo.modules.account.service;

import com.example.catalogo.infra.exception.EmailDuplicadoException; // Import da nova exceção
import com.example.catalogo.modules.account.dto.UsuarioCadastroDTO;
import com.example.catalogo.modules.account.model.Role;
import com.example.catalogo.modules.account.model.Usuario;
import com.example.catalogo.modules.account.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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
            // Substituído RuntimeException por EmailDuplicadoException (HTTP 409)
            throw new EmailDuplicadoException("Erro: O e-mail informado já está cadastrado no sistema.");
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