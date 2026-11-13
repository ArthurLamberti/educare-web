# Educare Web

Frontend Next.js (App Router, TypeScript, Tailwind) do Educare. Consome a API Spring Boot em `../educare-api`.

## Como rodar

```bash
# 1. Suba a API (porta 8080)
cd ../educare-api && ./gradlew bootRun

# 2. Configure e suba o frontend (porta 3000)
cp .env.example .env.local   # ajuste API_URL se necessário
npm install
npm run dev
```

Acesse http://localhost:3000.

## Como fala com a API

As chamadas à API são feitas **somente no servidor Next.js** (Server Components para leitura e
Server Actions para escrita). O navegador nunca chama o Spring diretamente, então não é preciso
configurar CORS na API e `API_URL` não é exposta ao cliente.

```
src/
├── lib/api.ts              # fetch base, ApiError (ProblemDetail), normalização de Page<T>
├── lib/alunos.ts           # funções da API /api/alunos
├── app/alunos/actions.ts   # Server Actions: salvar / excluir
├── app/alunos/...          # páginas: listagem, novo, [id]/editar
└── components/             # formulário e botão de exclusão (client components)
```

Para adicionar um novo recurso da API: crie `src/lib/<recurso>.ts` usando `apiFetch`, as páginas em
`src/app/<recurso>/` e as Server Actions correspondentes.
