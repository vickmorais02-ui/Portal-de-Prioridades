# Portal de Prioridades CSC

App React (Vite) + Supabase, com login próprio (e-mail/senha), perfis
Administrador / Gestor / Priorizador / Solicitante, fila de prioridades com
reordenação e notificações em tempo real, e dashboard.

## 1. Rodando localmente (opcional, antes de publicar)

```bash
npm install
cp .env.example .env
# edite o .env com a URL e a anon key do seu projeto Supabase (passo 2)
npm run dev
```

## 2. Supabase — criar o banco

1. Acesse [supabase.com](https://supabase.com), crie uma conta (ou entre) e clique em **New project**.
2. Escolha um nome (ex: `portal-prioridades-csc`), uma senha de banco (guarde-a) e a região mais próxima.
3. Aguarde o projeto ficar pronto (leva 1-2 minutos).
4. No menu lateral, abra **SQL Editor** → **New query**.
5. Abra o arquivo `supabase-schema.sql` (nesta pasta), copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria as tabelas `accounts`, `priorities` (já com número de ticket automático e
     campo de ordem da fila) e `notifications`, o perfil `priorizador`, as políticas de
     acesso, já cadastra os 5 usuários iniciais (todos com a senha padrão `CSCHAP123`) e
     liga o **Realtime** na tabela `notifications` — é isso que faz o sininho tocar na
     hora para quem estiver com o portal aberto, sem precisar recarregar a página.
6. Vá em **Project Settings** (ícone de engrenagem) → **API**.
7. Copie os dois valores que você vai usar no app:
   - **Project URL** → vai em `VITE_SUPABASE_URL`
   - **anon public key** → vai em `VITE_SUPABASE_ANON_KEY`

⚠️ Leia o comentário no topo do `supabase-schema.sql` sobre segurança: como o login é
próprio (não usa o Supabase Auth), a proteção de verdade está em não divulgar a URL
do site publicado e em manter poucas pessoas como Administrador — não é um esquema
de permissões banco-a-banco como o Supabase Auth oferece.

### Se a senha "não fica salva" (pede para redefinir de novo)

Isso acontece quando a role `anon` tem a política de RLS liberada mas não tem a
permissão de tabela (`GRANT`) para gravar — o Supabase, nesse caso, não retorna
erro nenhum, simplesmente não grava nada. O `supabase-schema.sql` já foi
atualizado com os `GRANT` explícitos que resolvem isso. Basta copiar o arquivo
inteiro de novo e rodar no SQL Editor — é seguro rodar de novo, ele não duplica
nada nem apaga dados existentes.

### Se o sininho não tocar sozinho (só ao recarregar a página)

O script já liga o Realtime na tabela `notifications` sozinho. Se mesmo assim o sino
não atualizar na hora, confira manualmente: no painel do Supabase, vá em **Database**
→ **Replication**, encontre a tabela `notifications` e marque a caixinha para
habilitá-la na publicação `supabase_realtime`.

## 3. GitHub — subir o código

```bash
cd portal-prioridades-csc
git init
git add .
git commit -m "Portal de Prioridades CSC"
```

1. Crie um repositório novo (vazio, sem README) em [github.com/new](https://github.com/new), ex: `portal-prioridades-csc`.
2. Copie a URL do repositório (algo como `https://github.com/SEU-USUARIO/portal-prioridades-csc.git`) e rode:

```bash
git remote add origin https://github.com/SEU-USUARIO/portal-prioridades-csc.git
git branch -M main
git push -u origin main
```

O `.gitignore` já impede que `node_modules`, `dist` e o seu `.env` (com as chaves) subam para o GitHub.

## 4. Netlify — publicar o site

1. Acesse [app.netlify.com](https://app.netlify.com) e entre com sua conta (pode usar o login do GitHub).
2. Clique em **Add new site** → **Import an existing project** → **GitHub**, e autorize o acesso ao repositório.
3. Selecione o repositório `portal-prioridades-csc`.
4. Configuração de build (o `netlify.toml` já define isso, mas confirme):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Antes de clicar em **Deploy**, abra **Add environment variables** e adicione:
   - `VITE_SUPABASE_URL` = a Project URL do passo 2
   - `VITE_SUPABASE_ANON_KEY` = a anon public key do passo 2
6. Clique em **Deploy site**. Em 1-2 minutos o site estará no ar em um link tipo `https://nome-aleatorio.netlify.app`.
7. (Opcional) Em **Site settings** → **Domain management**, você pode trocar por um subdomínio próprio (ex: `portal-prioridades-csc.netlify.app`) ou apontar um domínio da Hapvida.

## 5. Testando

Acesse o link publicado e entre com:

- `vitoria.regia@hapvida.com.br` (Administrador)
- senha padrão: `CSCHAP123`

O app vai pedir para trocar a senha no primeiro acesso. Depois disso, use a tela
**Acessos** (menu do Administrador) para cadastrar mais pessoas.

## 6. Atualizações futuras

Sempre que quiser publicar uma alteração:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

A Netlify já está conectada ao GitHub e faz o novo deploy automaticamente a cada push
na branch `main`.

## Estrutura dos arquivos

```
portal-prioridades-csc/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example        (copie para .env com suas chaves — nunca commite o .env)
├── supabase-schema.sql (rode uma vez no SQL Editor do Supabase)
└── src/
    ├── main.jsx
    ├── App.jsx          (a ferramenta inteira)
    └── supabaseClient.js
```
