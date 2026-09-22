-- Portal de Prioridades CSC — schema do Supabase
-- Cole este script inteiro no SQL Editor do seu projeto Supabase e rode.

create extension if not exists pgcrypto;

-- ---------- tabela de contas (login, perfis) ----------
create table if not exists accounts (
  email text primary key,
  name text not null,
  role text not null check (role in ('administrador','gestor','priorizador','solicitante')),
  password_hash text not null,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

-- garante o perfil 'priorizador' mesmo se a tabela accounts já existir de uma
-- versão anterior deste script (seguro rodar de novo)
alter table accounts drop constraint if exists accounts_role_check;
alter table accounts add constraint accounts_role_check check (role in ('administrador','gestor','priorizador','solicitante'));

-- ---------- tabela de prioridades ----------
create table if not exists priorities (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity,
  ordem bigint,
  area text not null,
  fila text not null,
  numero_demanda text not null,
  operadora text not null,
  justificativa text not null,
  status text not null check (status in ('rascunho','solicitado','atendida','rejeitado')),
  solicitante_id text not null references accounts(email),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  enviado_at timestamptz,
  atendido_at timestamptz,
  atendido_por_id text,
  rejeitado_at timestamptz,
  rejeitado_por_id text,
  motivo_rejeicao text
);

-- garante as colunas de ticket/ordem mesmo se a tabela já existir de uma
-- versão anterior deste script
alter table priorities add column if not exists ticket_number bigint generated always as identity;
alter table priorities add column if not exists ordem bigint;
update priorities set ordem = ticket_number where ordem is null;

create index if not exists priorities_solicitante_idx on priorities (solicitante_id);
create index if not exists priorities_status_idx on priorities (status);

-- ---------- tabela de notificações (sino de Gestor/Administrador) ----------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

-- liga o Realtime nesta tabela, para o sino tocar/atualizar na hora em quem
-- estiver com o portal aberto (sem precisar recarregar a página)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
end $$;

-- ---------- Row Level Security ----------
-- Este app faz login próprio (e-mail/senha guardados nesta tabela), não usa
-- o Supabase Auth. Por isso a política abaixo libera o acesso pela chave anon
-- (a mesma chave pública usada no front). Isso é equivalente, em termos de
-- proteção, ao que já rodava no artefato do claude.ai: quem tiver a URL do
-- site e a anon key consegue, tecnicamente, consultar essas tabelas direto —
-- a segurança real está em não divulgar o link e em manter os favores de
-- "Administrador" com poucas pessoas de confiança. Se quiser travar de
-- verdade, o próximo passo é migrar o login para o Supabase Auth (com RLS
-- baseada em auth.uid()) — me chama quando quiser evoluir para isso.

alter table accounts enable row level security;
alter table priorities enable row level security;
alter table notifications enable row level security;

drop policy if exists "accounts_all_anon" on accounts;
create policy "accounts_all_anon" on accounts
  for all using (true) with check (true);

drop policy if exists "priorities_all_anon" on priorities;
create policy "priorities_all_anon" on priorities
  for all using (true) with check (true);

drop policy if exists "notifications_all_anon" on notifications;
create policy "notifications_all_anon" on notifications
  for all using (true) with check (true);

-- IMPORTANTE: RLS só decide QUAIS linhas uma role pode ver/alterar — a role
-- também precisa ter permissão de tabela (GRANT) para o comando em si. Sem
-- isso, um update() ou insert() pode "dar certo" sem erro no app e mesmo
-- assim não gravar nada (foi esse o sintoma de senha redefinida "não
-- memorizada"). As linhas abaixo garantem essa permissão explicitamente —
-- rode-as mesmo se achar que já rodou antes, elas não têm efeito colateral:

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on accounts to anon, authenticated;
grant select, insert, update, delete on priorities to anon, authenticated;
grant select, insert, update, delete on notifications to anon, authenticated;

-- ---------- usuários iniciais ----------
-- Senha padrão de todos: CSCHAP123 (o app já obriga a troca no 1º acesso)
-- Hash abaixo = sha256("CSCHAP123")
insert into accounts (email, name, role, password_hash, must_change_password) values
  ('vitoria.regia@hapvida.com.br', 'Vitória Régia', 'administrador', 'fceb1ddd7fbbe96bc15c8a272b1dd99d3fc5880520dba3e1f5fa47996b3b84d9', true),
  ('rogerio.ribeiro@hapvida.com.br', 'Rogério Ribeiro', 'gestor', 'fceb1ddd7fbbe96bc15c8a272b1dd99d3fc5880520dba3e1f5fa47996b3b84d9', true),
  ('ritacm@hapvida.com.br', 'Rita Morais', 'solicitante', 'fceb1ddd7fbbe96bc15c8a272b1dd99d3fc5880520dba3e1f5fa47996b3b84d9', true),
  ('gabriellag@hapvida.com.br', 'Gabriella Tavares', 'solicitante', 'fceb1ddd7fbbe96bc15c8a272b1dd99d3fc5880520dba3e1f5fa47996b3b84d9', true),
  ('alexandre.ffernantes@hapvida.com.br', 'Alexandre Fernandes', 'solicitante', 'fceb1ddd7fbbe96bc15c8a272b1dd99d3fc5880520dba3e1f5fa47996b3b84d9', true)
on conflict (email) do nothing;
