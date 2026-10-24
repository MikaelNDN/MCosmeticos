Markdown
# 💄 M. Cosméticos | Plataforma Full-Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java 21](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Plataforma web moderna e responsiva de alta performance para exibição, catálogo e gestão e-commerce de fragrâncias e cosméticos de luxo. Desenvolvida sob uma arquitetura desacoplada utilizando uma API RESTful em **Spring Boot 3** no back-end e um front-end otimizado em **Next.js (App Router)**.

---

## 🔗 Links de Acesso

- 🌐 **Vitrine Online:** [m-cosmeticos.vercel.app/vitrine](https://m-cosmeticos.vercel.app/vitrine)
- 🚀 **Deploy:** Hospedado na [Vercel](https://vercel.com)

---

## ✨ Funcionalidades

### 🛒 Experiência do Cliente (Vitrine)
- **Vitrine Responsiva:** Layout moderno com Dark Mode nativo e grelha adaptável (2 colunas otimizadas para dispositivos móveis).
- **Precificação Inteligente:** Cálculo automático de preço original riscado e valor final com **10% de desconto à vista**.
- **Busca & Filtros:** Busca em tempo real por nome e marca de fragrância.
- **Página de Detalhes do Produto:**
  - Informações completas de marca, linha, descrição e quantidade em estoque.
  - Carrossel rolável (*scroll horizontal*) com efeito *snap* exibindo outras fragrâncias em estoque.
- **Comprar via WhatsApp:** Integração nativa com atendimento direto via WhatsApp por meio de *deep links*, compatível com browsers móbile e desktop.
- **Sistema de Favoritos:** Gerenciamento individual de itens salvos vinculado ao perfil do usuário logado.

### 🔐 Autenticação & Segurança
- **Segurança Robusta:** Autenticação via **JWT (JSON Web Token)** com controle de acesso baseado em cargos (*Role-Based Access Control* - `USER` e `ADMIN`).
- **Rotas Protegidas:** Middlewares e *guards* que restringem o acesso às páginas administrativas e área do usuário.

### ⚙️ Painel Administrativo (`ADMIN`)
- **Gestão de Catálogo (CRUD):** Cadastro, edição e remoção de fragrâncias com diálogos de confirmação acessíveis.
- **Controle de Estoque:** Monitoramento de unidades disponíveis e badges visuais automáticos de status ("Esgotado").
- **Paginação e Ordenação:** Suporte a listas extensas com ordenação pelos produtos mais recentes.

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **Framework:** Next.js (App Router / React)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Radix UI / Shadcn UI (AlertDialogs)
- **Comunicação API:** Axios
- **Deploy:** Vercel

### Back-end
- **Linguagem:** Java 21
- **Framework:** Spring Boot 3
- **Segurança:** Spring Security + JWT
- **Persistência:** Spring Data JPA / Hibernate
- **Banco de Dados:** PostgreSQL
- **Containerização:** Docker & Docker Compose

---

## 📂 Estrutura do Repositório

```text
Projeto-Mperfumes/
├── back-end/             # API REST desenvolvida em Spring Boot 3 (Java 21)
│   ├── src/              # Controladores, Serviços, Entidades e Repositórios
│   ├── Dockerfile        # Configuração de build do contêiner
│   └── pom.xml           # Dependências do Maven
│
├── front-end/            # Aplicação Web desenvolvida em Next.js (App Router)
│   ├── app/              # Páginas (/vitrine, /perfume/[id], /admin, etc.)
│   ├── components/       # Componentes reusáveis e UI
│   ├── services/         # Configuração do Axios e chamadas à API
│   └── public/           # Banners e assets estáticos
│
└── README.md
🚀 Como Executar o Projeto Localmente
Pré-requisitos
Node.js (v18+)

Java JDK 21

Docker & Docker Compose (Opcional, para banco de dados local)

1. Clonar o Repositório
Bash
git clone [https://github.com/seu-usuario/Projeto-Mperfumes.git](https://github.com/seu-usuario/Projeto-Mperfumes.git)
cd Projeto-Mperfumes
2. Executar o Back-end
Bash
cd back-end
./mvnw spring-boot:run
A API estará disponível em http://localhost:8080

3. Executar o Front-end
Bash
cd ../front-end
npm install
npm run dev
A interface web estará disponível em http://localhost:3000

📄 Licença
Este projeto foi desenvolvido para fins acadêmicos e comerciais por M. Cosméticos. Todos os direitos reservados.


<ElicitationsGroup>
</ElicitationsGroup>
