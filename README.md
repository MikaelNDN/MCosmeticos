```markdown
# 💄 M. Cosméticos | Plataforma Full-Stack

Plataforma web moderna e completa para catálogo, vitrine e gerenciamento de fragrâncias e cosméticos. O projeto foi desenvolvido com uma arquitetura robusta separada em Back-end (API REST) e Front-end (Interface Web).

---

## 🚀 Tecnologias Utilizadas

### Back-end
* **Java 21**
* **Spring Boot 3**
* **Spring Security & JWT** (Autenticação e controle de acesso)
* **Spring Data JPA / Hibernate** (Persistência de dados)
* **PostgreSQL** (Banco de dados relacional)
* **Docker & Docker Compose** (Containerização)

### Front-end
* **Next.js 14/16 (App Router)**
* **TypeScript**
* **Tailwind CSS** (Estilização moderna e responsiva)
* **Axios** (Comunicação com a API)

---

## ✨ Funcionalidades

* **Vitrine Interativa:** Listagem de fragrâncias com filtros por nome, marca e exclusão de duplicatas por linha.
* **Sistema de Favoritos:** Área dedicada para o usuário salvar e gerenciar suas fragrâncias favoritas com segurança.
* **Autenticação e Permissões:** Sistema de login seguro com rotas protegidas para usuários comuns e administradores (`ADMIN`).
* **Painel Administrativo:** Gestão completa do catálogo (Criar, Editar, Listar e Excluir perfumes com validação de estoque).
* **Interface Dark Mode:** Design elegante com foco na experiência do usuário (UX/UI).

---

## 📂 Estrutura do Projeto

```text
Projeto-Mperfumes/
├── back-end/       # API REST desenvolvida em Spring Boot
├── front-end/      # Interface web desenvolvida em Next.js
└── README.md

```

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos

* **Java 21** instalado
* **Node.js** (versão 18+) instalado
* **Docker** e **Docker Compose** (opcional, para subir o banco PostgreSQL)

---

### 1. Configurando e Executando o Back-end

1. Navegue até a pasta do back-end:
```bash
cd back-end

```


2. Configure as variáveis de conexão com o banco de dados no arquivo `src/main/resources/application.properties` (ou `.yml`).
3. Execute a aplicação Spring Boot (via sua IDE favorita, como IntelliJ IDEA/Eclipse, ou pelo terminal usando o Maven):
```bash
./mvnw spring-boot:run

```


*O servidor rodará por padrão na porta `8080`.*

---

### 2. Configurando e Executando o Front-end

1. Abra um novo terminal e navegue até a pasta do front-end:
```bash
cd front-end

```


2. Instale as dependências do projeto:
```bash
npm install

```


3. Inicie o servidor de desenvolvimento do Next.js:
```bash
npm run dev

```


*A aplicação estará acessível em `http://localhost:3000`.*

---

## 👨‍💻 Autor

Desenvolvido por **Maikel Noberto**.

```
