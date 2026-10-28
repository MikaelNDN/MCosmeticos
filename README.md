# M. Cosméticos

Aplicação de catálogo de perfumes e cosméticos com API REST em Java/Spring Boot e interface web em Next.js/TypeScript. Inclui cadastro/login, consulta de catálogo, favoritos, gestão administrativa de produtos e encaminhamento de solicitações de compra para o WhatsApp.

## Documentação técnica

Consulte [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) para a visão completa da arquitetura, funcionalidades, páginas, endpoints, modelos, dependências, configuração, execução local e pontos de atenção.

## Início rápido

Pré-requisitos: Java 21, Node.js compatível com a versão do Next.js declarada, npm, PostgreSQL e Maven Wrapper (incluído no repositório).

1. Configure as variáveis do banco, JWT e Cloudinary conforme `back-end/src/main/resources/application.properties`.
2. Inicie a API:

   ```powershell
   cd back-end
   .\mvnw.cmd spring-boot:run
   ```

3. Configure `NEXT_PUBLIC_API_URL` no front-end para apontar à API que está executando.
4. Instale dependências e inicie a interface:

   ```powershell
   cd front-end
   npm install
   npm run dev
   ```

Por padrão, a API inicia na porta 8080 e o Next.js na porta 3000. Revise as configurações e credenciais do `back-end/docker-compose.yml` antes de utilizá-lo.
