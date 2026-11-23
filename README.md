# ☁️ Ideacloud

App pessoal (PWA) para guardar ideias e transformar algumas delas em projetos, de
criativos a acadêmicos (como a IC), cada um na sua área.
Next.js (App Router) + TypeScript + Tailwind + Supabase, com deploy na Vercel.

## Como o acesso funciona

Não há contas de usuário. O app tem **uma senha única** (`APP_PASSWORD`): você
digita uma vez em cada aparelho e ele lembra por 1 ano. O banco fica **fechado
ao público** e só o servidor do app consegue acessá-lo, com a chave secreta.

## Configurando o Supabase (passo a passo)

### 1. Criar o projeto
1. Entre em <https://supabase.com> e crie uma conta (pode ser com o GitHub).
2. **New project** → nome `ideacloud`.
3. **Database password**: gere uma senha e guarde no seu gerenciador de senhas
   (o app não usa essa senha, mas você vai precisar dela se um dia quiser
   acessar o banco por fora).
4. **Region**: escolha *South America (São Paulo)* para ficar mais rápido.
5. Aguarde 1–2 minutos até o projeto terminar de ser criado.

### 2. Criar as tabelas
1. No menu lateral, abra **SQL Editor** → **New query**.
2. Abra o arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   copie **todo** o conteúdo e cole no editor.
3. Clique em **Run**. O resultado esperado é `Success. No rows returned`.
4. Repita com [`supabase/migrations/0002_areas_and_deadlines.sql`](supabase/migrations/0002_areas_and_deadlines.sql)
   (nova query, cole, **Run**). Sempre na ordem: 0001 e depois 0002.
5. Confira em **Table Editor**: devem existir `ideas`, `idea_images`,
   `projects`, `steps` e `areas` (com o aviso de RLS ativada, é isso mesmo que queremos).
6. Confira em **Storage**: deve existir o bucket privado `idea-images`.

> Rode cada migration só uma vez. Se rodar de novo dará erro de "já existe", sem
> estragar nada.

### 3. Copiar as chaves
Em **Project Settings → API** (ou **API Keys**, conforme a versão do painel):

| O que copiar | Vai para a variável |
|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `SUPABASE_URL` |
| **Secret key** (`sb_secret_…`). Nas chaves legadas é a `service_role` | `SUPABASE_SECRET_KEY` |

⚠️ A chave secreta dá acesso total ao banco. Nunca a coloque em código, em
variável com prefixo `NEXT_PUBLIC_` ou em um commit. Você **não** precisa da
chave `anon`/`publishable`: o navegador nunca fala direto com o banco.

### 4. Rodar no seu computador
```bash
cp .env.example .env.local
# edite o .env.local: APP_PASSWORD, SUPABASE_URL e SUPABASE_SECRET_KEY
npm install
npm run dev
```
Abra <http://localhost:3000>, digite a senha e confira a mensagem
**“Banco conectado ✓”**. Se aparecer um erro em vez disso, confira se a URL e a
chave foram copiadas inteiras, sem espaços.

## Estrutura

```
app/            rotas (App Router), manifest do PWA
components/     componentes de interface
lib/            sessão por senha, cliente do Supabase (somente servidor)
proxy.ts        portão de senha (no Next 16 substitui o middleware.ts)
public/         ícones e service worker
supabase/       migrations SQL
```

## Áreas e prazos
- **Áreas** organizam ideias e projetos (começam como 🎨 Criativo, 🎓 Faculdade e
  🌱 Pessoal; você pode criar, renomear e apagar). Apagar uma área não apaga
  nada, só deixa os itens sem área.
- **Prazos** são opcionais, em projetos e em etapas.

## Regras do banco (garantidas pelo próprio Postgres)
- No máximo **3 projetos ativos** (trigger com lock contra concorrência).
- No máximo **uma próxima ação** por projeto; etapa concluída não pode ser a próxima.
- `completed_at` é preenchido ao concluir e limpo ao reabrir.
- Busca em português nos títulos e descrições; filtro rápido por tags.

## Scripts
`npm run dev` · `npm run build` · `npm run start` · `npm run lint`
