# Revisão de segurança

Escopo: JWT, CORS, autorização administrativa e regras de negócio do back-end.

## Achado

| # | Severidade | Arquivo | Linhas | Vulnerabilidade | Confiança |
|---|---|---|---|---|---|
| 1 | HIGH | `back-end/src/main/resources/application.properties` | 44 | O segredo JWT tem um fallback fixo e conhecido. Se `API_SECURITY_TOKEN_SECRET` não estiver definida no ambiente publicado, um terceiro que conheça esse valor pode assinar tokens válidos para contas existentes e se autenticar com as permissões dessas contas, inclusive de administrador. | 9/10 |

### Recomendação

Remover o segredo padrão e exigir `API_SECURITY_TOKEN_SECRET` na inicialização, usando um valor aleatório forte e exclusivo por ambiente. Se houver possibilidade de o fallback ter sido usado em produção, substituir o segredo e invalidar os tokens emitidos com ele.

### Limitação da verificação

Não foi possível consultar os valores efetivos das variáveis de ambiente nem as origens CORS configuradas no deployment. Portanto, o achado é confirmado no código, mas não foi possível determinar se a condição de exploração está presente no ambiente publicado.
