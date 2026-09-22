import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { supabase } from "./supabaseClient";

/**
 * Portal de Prioridades CSC — versão React/JSX + Supabase
 * ------------------------------------------------------------------
 * Login e dados (contas e prioridades) agora vivem no Supabase, na
 * mesma linha do que você já faz no Indicadores CSC. Veja o README.md
 * para o passo a passo de Supabase + GitHub + Netlify.
 * ------------------------------------------------------------------
 */

// ---------------- constantes ----------------

const AREAS = ["Produção", "Grandes Contratos", "Movimentação", "Faturamento", "Comissão"];
const FILAS = ["Saccad", "Sales Force", "Lecom"];
const AREA_FILAS = {
  "Produção": ["Lecom", "Sales Force", "Saccad"],
  "Grandes Contratos": ["Sales Force", "Lecom"],
  "Movimentação": ["Saccad", "Lecom"],
  "Faturamento": ["Saccad", "Lecom"],
  "Comissão": ["Lecom", "Sales Force"],
};
const OPERADORAS = ["Hapvida", "NDI SP", "NDI MG", "Clinipam", "Centro Clínico Gaúcho"];

const STATUS_LABEL = {
  rascunho: "Rascunho",
  solicitado: "Solicitado",
  atendida: "Atendida",
  rejeitado: "Rejeitado",
};
const STATUS_COLOR = {
  rascunho: { fg: "#6E6F72", bg: "#EDEDEA" },
  solicitado: { fg: "#CC6D00", bg: "#FFEAD1" },
  atendida: { fg: "#4C8A76", bg: "#D3E8D3" },
  rejeitado: { fg: "#D42832", bg: "#FFCCCC" },
};
const ROLE_LABEL = { administrador: "Administrador", gestor: "Gestor", priorizador: "Priorizador", solicitante: "Solicitante" };

const TOKENS = {
  hv900: "#0B1F5C",
  hv700: "#1539AA",
  hv500: "#3557C4",
  hv300: "#9DB0E6",
  hv100: "#EAEFFB",
  flowerRed: "#FF222B",
  flowerOrange: "#FF4E05",
  flowerOrange2: "#FF8800",
  flowerYellow: "#FFCC23",
  ink: "#1C1D1F",
  inkSoft: "#5A5A5A",
  paper: "#F5F2EA",
  card: "#FFFFFF",
  line: "#E6E4DF",
  gradGate: "linear-gradient(160deg, #0A1153 0%, #1F3FD6 100%)",
};

const LOGO_SRC = "data:image/png;base64,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";
const DEFAULT_PASSWORD = "CSCHAP123";
const SESSION_KEY = "prioridades_csc_email";
const LAST_SEEN_NOTIF_KEY = "prioridades_csc_last_seen_notif";

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
function initials(name) {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
function fmtDateShort(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function monthKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}
function monthLabel(key) {
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [, m] = key.split("-");
  return names[parseInt(m, 10) - 1];
}
function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function formatTicket(n) {
  if (n == null) return "—";
  return "#" + String(n).padStart(4, "0");
}
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = now + i * 0.11;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    });
    setTimeout(() => ctx.close(), 700);
  } catch (e) {}
}
function fmtRelative(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return min + " min atrás";
  const h = Math.floor(min / 60);
  if (h < 24) return h + "h atrás";
  return fmtDateShort(ts);
}

// ---------------- camada de dados (Supabase) ----------------
// linhas do banco (snake_case) <-> objetos usados na tela (camelCase)

function rowToAccount(row) {
  return { email: row.email, name: row.name, role: row.role, mustChangePassword: row.must_change_password };
}
function rowToPriority(row) {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    ordem: row.ordem,
    area: row.area,
    fila: row.fila,
    numeroDemanda: row.numero_demanda,
    operadora: row.operadora,
    justificativa: row.justificativa,
    status: row.status,
    solicitanteId: row.solicitante_id,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : null,
    enviadoAt: row.enviado_at ? new Date(row.enviado_at).getTime() : null,
    atendidoAt: row.atendido_at ? new Date(row.atendido_at).getTime() : null,
    rejeitadoAt: row.rejeitado_at ? new Date(row.rejeitado_at).getTime() : null,
    motivoRejeicao: row.motivo_rejeicao,
  };
}

async function fetchDirectory() {
  const { data, error } = await supabase.from("accounts").select("email,name,role,must_change_password").order("name");
  if (error) { console.error(error); return []; }
  return data.map(rowToAccount);
}
async function fetchPriorities() {
  const { data, error } = await supabase.from("priorities").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(rowToPriority);
}

// ==================== componente principal ====================

export default function PortalPrioridadesCSC() {
  const [accounts, setAccounts] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  const [authStage, setAuthStage] = useState("booting"); // 'booting' | 'login' | 'changepw' | 'app'
  const [account, setAccount] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [changePwError, setChangePwError] = useState("");

  const [view, setView] = useState("nova");
  const [editDraftId, setEditDraftId] = useState(null);
  const [listStatusFilter, setListStatusFilter] = useState("");
  const [queueFilters, setQueueFilters] = useState({ fila: "", solicitante: "", from: "", to: "" });
  const [atendimentoFilters, setAtendimentoFilters] = useState({ fila: "", solicitante: "", from: "", to: "" });
  const [newUserError, setNewUserError] = useState("");

  const [confirmState, setConfirmState] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [motivoView, setMotivoView] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeenNotif, setLastSeenNotif] = useState(() => {
    try { return Number(localStorage.getItem(LAST_SEEN_NOTIF_KEY) || 0); } catch (e) { return 0; }
  });

  const isAdmin = !!account && account.role === "administrador";
  const isGestorOrAdmin = !!account && (account.role === "administrador" || account.role === "gestor");
  const isPriorizador = !!account && account.role === "priorizador";
  const canReorder = isAdmin || isPriorizador;
  const unreadCount = notifications.filter((n) => new Date(n.created_at).getTime() > lastSeenNotif).length;

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  }

  function openNotifications() {
    setNotifOpen((v) => !v);
    const now = Date.now();
    setLastSeenNotif(now);
    try { localStorage.setItem(LAST_SEEN_NOTIF_KEY, String(now)); } catch (e) {}
  }

  async function loadAppData() {
    setDataReady(false);
    const [dir, pri] = await Promise.all([fetchDirectory(), fetchPriorities()]);
    setAccounts(dir);
    setPriorities(pri);
    setDataReady(true);
  }

  async function loadNotifications() {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) setNotifications(data);
  }

  // assina o Realtime do Supabase: toda vez que uma notificação nova é
  // inserida por qualquer sessão, quem for Gestor/Administrador e estiver
  // com o portal aberto vê e ouve na hora, sem recarregar a página
  useEffect(() => {
    if (!isGestorOrAdmin) return;
    loadNotifications();
    const channel = supabase
      .channel("notifications-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 50));
        playChime();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGestorOrAdmin]);

  // restaura sessão salva (só o e-mail; a senha nunca fica no localStorage)
  useEffect(() => {
    (async () => {
      let saved = null;
      try { saved = localStorage.getItem(SESSION_KEY); } catch (e) {}
      if (saved) {
        const { data } = await supabase.from("accounts").select("email,name,role,must_change_password").eq("email", saved).maybeSingle();
        if (data) {
          const acc = rowToAccount(data);
          setAccount(acc);
          if (acc.mustChangePassword) {
            setAuthStage("changepw");
          } else {
            setAuthStage("app");
            setView(acc.role === "administrador" || acc.role === "gestor" ? "fila" : "nova");
            await loadAppData();
          }
          return;
        }
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
      }
      setAuthStage("login");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(emailRaw, password) {
    const email = (emailRaw || "").trim().toLowerCase();
    const pw = (password || "").trim();
    if (!email || !pw) { setLoginError("Informe e-mail e senha."); return; }
    const { data, error } = await supabase.from("accounts").select("*").eq("email", email).maybeSingle();
    if (error) { setLoginError("Não foi possível entrar agora. Tente novamente."); return; }
    if (!data) { setLoginError("Usuário não encontrado ou sem acesso liberado."); return; }
    const hash = await sha256Hex(pw);
    const isDefaultFallback = data.must_change_password && pw === DEFAULT_PASSWORD;
    if (hash !== data.password_hash && !isDefaultFallback) { setLoginError("Senha incorreta."); return; }
    const acc = rowToAccount(data);
    setAccount(acc);
    setLoginError("");
    try { localStorage.setItem(SESSION_KEY, email); } catch (e) {}
    if (acc.mustChangePassword) {
      setAuthStage("changepw");
    } else {
      setAuthStage("app");
      setView(acc.role === "administrador" || acc.role === "gestor" ? "fila" : "nova");
      await loadAppData();
    }
  }

  async function handleChangePassword(pw1, pw2) {
    if (!pw1 || pw1.length < 6) { setChangePwError("A nova senha deve ter ao menos 6 caracteres."); return; }
    if (pw1 !== pw2) { setChangePwError("As senhas não coincidem."); return; }
    const hash = await sha256Hex(pw1);
    const { data, error } = await supabase.from("accounts")
      .update({ password_hash: hash, must_change_password: false })
      .eq("email", account.email)
      .select();
    if (error) { setChangePwError("Não foi possível atualizar a senha (" + error.message + ")."); return; }
    if (!data || data.length === 0) {
      setChangePwError("A senha não foi salva no banco (nenhuma linha foi alterada). Confira o passo 2 do README — provavelmente falta rodar as permissões (GRANT) da tabela accounts no Supabase.");
      return;
    }
    setAccount((prev) => ({ ...prev, mustChangePassword: false }));
    setChangePwError("");
    setAuthStage("app");
    setView(account.role === "administrador" || account.role === "gestor" ? "fila" : "nova");
    await loadAppData();
  }

  function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    setAccount(null);
    setAuthStage("login");
    setLoginError("");
    setView("nova");
  }

  // ---------------- ações de prioridades ----------------

  async function upsertPriority(form, status) {
    const now = new Date().toISOString();
    if (editDraftId) {
      const patch = {
        area: form.area, fila: form.fila, numero_demanda: form.numeroDemanda, operadora: form.operadora,
        justificativa: form.justificativa, status, updated_at: now,
      };
      if (status === "solicitado") patch.enviado_at = now;
      const { data, error } = await supabase.from("priorities").update(patch).eq("id", editDraftId).select();
      if (error) { showToast("Não foi possível salvar. Tente novamente."); return; }
      if (!data || data.length === 0) { showToast("Nada foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    } else {
      const row = {
        area: form.area, fila: form.fila, numero_demanda: form.numeroDemanda, operadora: form.operadora,
        justificativa: form.justificativa, status, solicitante_id: account.email,
      };
      if (status === "solicitado") row.enviado_at = now;
      const { data, error } = await supabase.from("priorities").insert(row).select().single();
      if (error) { showToast("Não foi possível salvar. Tente novamente."); return; }
      // o número do ticket é gerado pelo banco (coluna identity) — usamos o
      // próprio ticket como posição inicial na fila (ordem)
      if (data) {
        await supabase.from("priorities").update({ ordem: data.ticket_number }).eq("id", data.id);
      }
    }
    showToast(status === "rascunho" ? "Rascunho salvo." : "Prioridade enviada para atendimento.");
    setEditDraftId(null);
    setView("lista");
    await loadAppData();
  }
  async function deletePriority(id) {
    const { error } = await supabase.from("priorities").delete().eq("id", id);
    if (error) { showToast("Não foi possível excluir."); return; }
    showToast("Prioridade excluída.");
    await loadAppData();
  }
  async function atender(id) {
    const { data, error } = await supabase.from("priorities").update({ status: "atendida", atendido_at: new Date().toISOString(), atendido_por_id: account.email }).eq("id", id).select();
    if (error) { showToast("Não foi possível atualizar."); return; }
    if (!data || data.length === 0) { showToast("Nada foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    showToast("Prioridade marcada como atendida.");
    await loadAppData();
  }
  async function rejeitar(id, motivo) {
    const { data, error } = await supabase.from("priorities").update({ status: "rejeitado", rejeitado_at: new Date().toISOString(), rejeitado_por_id: account.email, motivo_rejeicao: motivo }).eq("id", id).select();
    if (error) { showToast("Não foi possível rejeitar."); return; }
    if (!data || data.length === 0) { showToast("Nada foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    showToast("Prioridade rejeitada.");
    await loadAppData();
  }
  async function moveInQueue(id, direction) {
    const open = priorities.filter((p) => p.status === "solicitado").slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const idx = open.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= open.length) return;
    const a = open[idx], b = open[swapIdx];
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("priorities").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("priorities").update({ ordem: a.ordem }).eq("id", b.id),
    ]);
    if (e1 || e2) { showToast("Não foi possível reordenar."); return; }
    await supabase.from("notifications").insert({
      message: (account?.name || "Alguém") + " reordenou a prioridade " + formatTicket(a.ticketNumber) + " (" + a.fila + ").",
    });
    await loadAppData();
  }

  // ---------------- ações de contas (Acessos) ----------------

  async function createAccount(email, name, role) {
    const e = (email || "").trim().toLowerCase();
    const n = (name || "").trim();
    if (!e || !n) { setNewUserError("Informe nome e e-mail."); return; }
    const { data: existing } = await supabase.from("accounts").select("email").eq("email", e).maybeSingle();
    if (existing) { setNewUserError("Já existe uma conta com este e-mail."); return; }
    const defaultHash = await sha256Hex(DEFAULT_PASSWORD);
    const { data, error } = await supabase.from("accounts").insert({ email: e, name: n, role, password_hash: defaultHash, must_change_password: true }).select();
    if (error) { setNewUserError("Não foi possível criar o usuário (" + error.message + ")."); return; }
    if (!data || data.length === 0) { setNewUserError("O usuário não foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    setNewUserError("");
    showToast("Usuário criado com senha padrão.");
    await loadAppData();
  }
  async function resetAccountPassword(email) {
    const defaultHash = await sha256Hex(DEFAULT_PASSWORD);
    const { data, error } = await supabase.from("accounts").update({ password_hash: defaultHash, must_change_password: true }).eq("email", email).select();
    if (error) { showToast("Não foi possível redefinir a senha."); return; }
    if (!data || data.length === 0) { showToast("Nada foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    showToast("Senha redefinida para a senha padrão.");
    await loadAppData();
  }
  async function changeAccountRole(email, role) {
    const { data, error } = await supabase.from("accounts").update({ role }).eq("email", email).select();
    if (error) { showToast("Não foi possível atualizar o perfil."); return; }
    if (!data || data.length === 0) { showToast("Nada foi salvo (permissão do Supabase?). Confira o supabase-schema.sql."); return; }
    showToast("Perfil atualizado.");
    await loadAppData();
  }
  async function deleteAccount(email) {
    if (email === account.email) { showToast("Você não pode remover seu próprio usuário."); return; }
    const { error } = await supabase.from("accounts").delete().eq("email", email);
    if (error) { showToast("Não foi possível remover o usuário."); return; }
    showToast("Usuário removido.");
    await loadAppData();
  }

  // ---------------- render ----------------

  if (authStage === "booting") {
    return <GateShell><div style={S.spinner} /></GateShell>;
  }
  if (authStage === "login") {
    return <LoginScreen error={loginError} onSubmit={handleLogin} />;
  }
  if (authStage === "changepw") {
    return <ChangePasswordScreen error={changePwError} onSubmit={handleChangePassword} onBack={logout} />;
  }

  const NAV = [
    { id: "nova", label: "Solicitar Nova Prioridade" },
    { id: "lista", label: "Minhas Solicitações" },
    { id: "fila", label: "Fila de Prioridades" },
  ];
  const NAV_ADMIN = [
    ...(isGestorOrAdmin ? [{ id: "atendimento", label: "Fila de Atendimento" }] : []),
    ...(isGestorOrAdmin ? [{ id: "extracao", label: "Extração do Analítico" }] : []),
    ...(isAdmin ? [{ id: "acessos", label: "Acessos" }] : []),
    ...(isGestorOrAdmin ? [{ id: "dashboard", label: "Dashboard" }] : []),
  ];
  const TITLES = {
    nova: "Solicitar Nova Prioridade", lista: "Minhas Solicitações",
    fila: "Fila de Prioridades", atendimento: "Fila de Atendimento", extracao: "Extração do Analítico",
    acessos: "Acessos", dashboard: "Dashboard",
  };

  return (
    <div style={S.app}>
      <style>{CSS_RESET}</style>

      <div style={S.sidebar}>
        <div style={S.brandRow}>
          <div style={S.brandMark}><img src={LOGO_SRC} alt="Hapvida" style={S.brandImg} /></div>
          <div>
            <div style={S.brandTitle}>Portal de Prioridades</div>
            <div style={S.brandSub}>CSC · Hapvida</div>
          </div>
        </div>

        <div style={S.navSectionLabel}>Menu</div>
        {NAV.map((n) => (
          <NavItem key={n.id} active={view === n.id} onClick={() => { if (n.id !== "nova") setEditDraftId(null); setView(n.id); }}>
            {n.label}
          </NavItem>
        ))}

        {NAV_ADMIN.length > 0 && (
          <>
            <div style={S.navSectionLabel}>Administração</div>
            {NAV_ADMIN.map((n) => (
              <NavItem key={n.id} active={view === n.id} onClick={() => setView(n.id)}>
                {n.label}
              </NavItem>
            ))}
          </>
        )}

        <div style={S.sidebarFoot}>
          <div style={S.who}>
            <div style={S.avatarDot}>{initials(account.name)}</div>
            <div>
              <div style={S.whoName}>{account.name}</div>
              <div style={S.whoRole}>{ROLE_LABEL[account.role]}</div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={logout}>Sair</button>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.topbar}>
          <h1 style={S.topbarTitle}>{TITLES[view]}</h1>
          {isGestorOrAdmin && (
            <div style={{ position: "relative" }}>
              <button style={S.bellBtn} onClick={openNotifications} title="Notificações">
                🔔
                {unreadCount > 0 && <span style={S.bellBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div style={S.notifPanel}>
                  <div style={S.notifHeader}>Notificações</div>
                  {!notifications.length ? (
                    <div style={S.notifEmpty}>Nenhuma notificação ainda.</div>
                  ) : (
                    <div style={S.notifList}>
                      {notifications.map((n) => (
                        <div key={n.id} style={S.notifItem}>
                          <div>{n.message}</div>
                          <div style={S.notifTime}>{fmtRelative(new Date(n.created_at).getTime())}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={S.content}>
          <div style={S.contentInner}>
            {!dataReady ? (
              <div style={{ ...S.card, ...S.empty }}><div style={S.spinner} /></div>
            ) : (
              <>
                {view === "nova" && (
                  <NovaPrioridadeForm
                    draft={priorities.find((p) => p.id === editDraftId) || null}
                    onCancel={() => { setEditDraftId(null); setView("lista"); }}
                    onSaveDraft={(form) => upsertPriority(form, "rascunho")}
                    onSend={(form) => upsertPriority(form, "solicitado")}
                    showToast={showToast}
                  />
                )}
                {view === "lista" && (
                  <ListaPrioridades
                    items={priorities.filter((p) => p.solicitanteId === account.email)}
                    solicitanteName={account.name}
                    statusFilter={listStatusFilter}
                    setStatusFilter={setListStatusFilter}
                    onEdit={(id) => { setEditDraftId(id); setView("nova"); }}
                    onDelete={(id) => setConfirmState({ title: "Excluir prioridade?", msg: "Essa ação não pode ser desfeita.", onConfirm: () => deletePriority(id) })}
                    onMotivo={(p) => setMotivoView(p)}
                  />
                )}
                {view === "fila" && (
                  <FilaPrioridades
                    items={priorities}
                    accounts={accounts}
                    filters={queueFilters}
                    setFilters={setQueueFilters}
                    canFinalize={false}
                    canReorder={canReorder}
                    onAtender={(id) => setConfirmState({ title: "Finalizar atendimento?", msg: "A prioridade será marcada como atendida.", onConfirm: () => atender(id) })}
                    onRejeitar={(id) => setRejectFor(id)}
                    onMoveUp={(id) => moveInQueue(id, "up")}
                    onMoveDown={(id) => moveInQueue(id, "down")}
                  />
                )}
                {view === "atendimento" && isGestorOrAdmin && (
                  <FilaPrioridades
                    items={priorities}
                    accounts={accounts}
                    filters={atendimentoFilters}
                    setFilters={setAtendimentoFilters}
                    canFinalize={isGestorOrAdmin}
                    canReorder={canReorder}
                    onAtender={(id) => setConfirmState({ title: "Finalizar atendimento?", msg: "A prioridade será marcada como atendida.", onConfirm: () => atender(id) })}
                    onRejeitar={(id) => setRejectFor(id)}
                    onMoveUp={(id) => moveInQueue(id, "up")}
                    onMoveDown={(id) => moveInQueue(id, "down")}
                  />
                )}
                {view === "extracao" && isGestorOrAdmin && (
                  <ExtracaoAnalitico items={priorities} accounts={accounts} />
                )}
                {view === "acessos" && isAdmin && (
                  <Acessos
                    accounts={accounts}
                    currentEmail={account.email}
                    newUserError={newUserError}
                    onCreate={createAccount}
                    onResetPassword={(email) => setConfirmState({ title: "Redefinir senha?", msg: "O usuário voltará a usar a senha padrão CSCHAP123 e precisará trocá-la no próximo acesso.", onConfirm: () => resetAccountPassword(email) })}
                    onChangeRole={changeAccountRole}
                    onRemove={(email) => setConfirmState({ title: "Remover usuário?", msg: "Essa pessoa perderá o acesso à ferramenta imediatamente.", onConfirm: () => deleteAccount(email) })}
                  />
                )}
                {view === "dashboard" && isGestorOrAdmin && <Dashboard items={priorities} accounts={accounts} />}
              </>
            )}
          </div>
        </div>
        <div style={S.appFooter}>Melhoria Contínua CSC</div>
      </div>

      {confirmState && (
        <ConfirmModal title={confirmState.title} msg={confirmState.msg} onCancel={() => setConfirmState(null)} onConfirm={() => { confirmState.onConfirm(); setConfirmState(null); }} />
      )}
      {rejectFor && (
        <RejectModal onCancel={() => setRejectFor(null)} onConfirm={(motivo) => { rejeitar(rejectFor, motivo); setRejectFor(null); }} />
      )}
      {motivoView && (
        <InfoModal title="Motivo da rejeição" text={motivoView.motivoRejeicao} onClose={() => setMotivoView(null)} />
      )}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ==================== telas de acesso ====================

function GateShell({ children }) {
  return (
    <div style={S.gate}>
      <style>{CSS_RESET}</style>
      <div style={S.gateCircle1} />
      <div style={S.gateCircle2} />
      <div style={S.gateCard}>{children}</div>
      <div style={S.gateFooter}>Melhoria Contínua CSC</div>
    </div>
  );
}

function LoginScreen({ error, onSubmit }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    await onSubmit(email, pw);
    setBusy(false);
  }

  return (
    <GateShell>
      <div style={S.gateMark}><img src={LOGO_SRC} alt="Hapvida" style={S.gateImg} /></div>
      <h2 style={S.gateH2}>Portal de Prioridades CSC</h2>
      <p style={S.gateP}>Entre com seu e-mail corporativo Hapvida.</p>
      {error && <div style={S.gateError}>{error}</div>}
      <Field label="E-mail">
        <input type="email" placeholder="nome@hapvida.com.br" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} autoFocus />
      </Field>
      <Field label="Senha">
        <input type="password" value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
      </Field>
      <button style={S.gateBtn} disabled={busy} onClick={submit}>Entrar</button>
      <div style={S.gateHint}>Primeiro acesso? Use a senha padrão informada pelo administrador do CSC.</div>
    </GateShell>
  );
}

function ChangePasswordScreen({ error, onSubmit, onBack }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    await onSubmit(p1, p2);
    setBusy(false);
  }

  return (
    <GateShell>
      <div style={S.gateMark}><img src={LOGO_SRC} alt="Hapvida" style={S.gateImg} /></div>
      <h2 style={S.gateH2}>Defina sua senha</h2>
      <p style={S.gateP}>Este é seu primeiro acesso. Escolha uma senha individual para continuar.</p>
      {error && <div style={S.gateError}>{error}</div>}
      <Field label="Nova senha">
        <input type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoFocus />
      </Field>
      <Field label="Confirmar senha">
        <input type="password" value={p2} onChange={(e) => setP2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
      </Field>
      <button style={S.gateBtn} disabled={busy} onClick={submit}>Salvar e entrar</button>
      <div style={S.gateHint}>
        <a href="#" style={S.gateBackLink} onClick={(e) => { e.preventDefault(); onBack(); }}>← Voltar para a tela de login</a>
      </div>
    </GateShell>
  );
}

// ==================== pequenos componentes ====================

function NavItem({ active, onClick, children }) {
  return <button onClick={onClick} style={{ ...S.navItem, ...(active ? S.navItemActive : null) }}>{children}</button>;
}
function StatusPill({ status }) {
  const c = STATUS_COLOR[status];
  return <span style={{ ...S.pill, color: c.fg, background: c.bg }}><span style={{ ...S.pillDot, background: c.fg }} />{STATUS_LABEL[status]}</span>;
}
function EmptyState({ title, sub }) {
  return <div style={{ ...S.card, ...S.empty }}><div style={S.emptyTitle}>{title}</div><div>{sub}</div></div>;
}
function Field({ label, children }) {
  return <div style={S.field}><label style={S.label}>{label}</label>{children}</div>;
}

// ---------------- Solicitar Nova Prioridade ----------------

function NovaPrioridadeForm({ draft, onCancel, onSaveDraft, onSend, showToast }) {
  const [area, setArea] = useState(draft?.area || AREAS[0]);
  const filaOptions = AREA_FILAS[area] || FILAS;
  const [fila, setFila] = useState(draft?.fila && (AREA_FILAS[draft?.area] || FILAS).includes(draft.fila) ? draft.fila : filaOptions[0]);
  const [numero, setNumero] = useState(draft?.numeroDemanda || "");
  const [operadora, setOperadora] = useState(draft?.operadora || OPERADORAS[0]);
  const [justificativa, setJustificativa] = useState(draft?.justificativa || "");

  useEffect(() => {
    const allowed = AREA_FILAS[area] || FILAS;
    if (!allowed.includes(fila)) setFila(allowed[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  function readForm() {
    return { area, fila, numeroDemanda: numero.trim(), operadora, justificativa: justificativa.trim() };
  }

  return (
    <>
      {draft && <div style={S.draftNote}>Editando rascunho salvo em {fmtDate(draft.createdAt)}.</div>}
      <div style={{ ...S.card, ...S.accentCard, padding: 24 }}>
        <div style={S.grid4}>
          <Field label="Área">
            <select value={area} onChange={(e) => setArea(e.target.value)}>{AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
          </Field>
          <Field label="Fila">
            <select value={fila} onChange={(e) => setFila(e.target.value)}>{filaOptions.map((f) => <option key={f} value={f}>{f}</option>)}</select>
          </Field>
          <Field label="Número da demanda">
            <input type="text" placeholder="Ex: 20261234" value={numero} onChange={(e) => setNumero(e.target.value)} />
          </Field>
          <Field label="Operadora">
            <select value={operadora} onChange={(e) => setOperadora(e.target.value)}>{OPERADORAS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
          </Field>
        </div>
        <Field label="Justificativa">
          <textarea placeholder="Explique o motivo da priorização…" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          {draft && <button style={S.btnSecondary} onClick={onCancel}>Cancelar</button>}
          <button style={S.btnSecondary} onClick={() => {
            const fd = readForm();
            if (!fd.numeroDemanda && !fd.justificativa) { showToast("Preencha ao menos o número da demanda ou a justificativa."); return; }
            onSaveDraft(fd);
          }}>Salvar rascunho</button>
          <button style={S.btn} onClick={() => {
            const fd = readForm();
            if (!fd.numeroDemanda) { showToast("Informe o número da demanda."); return; }
            if (!fd.justificativa) { showToast("Informe a justificativa."); return; }
            onSend(fd);
          }}>Enviar solicitação</button>
        </div>
      </div>
    </>
  );
}

// ---------------- Lista de Prioridades ----------------

function ListaPrioridades({ items, solicitanteName, statusFilter, setStatusFilter, onEdit, onDelete, onMotivo }) {
  const filtered = statusFilter ? items.filter((p) => p.status === statusFilter) : items;
  return (
    <>
      <div style={S.filters}>
        <Field label="Status">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            {Object.keys(STATUS_LABEL).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </Field>
      </div>
      {!filtered.length ? (
        <EmptyState title="Nenhuma prioridade encontrada" sub='Use "Solicitar Nova Prioridade" para abrir uma nova demanda.' />
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Ticket", "Solicitante", "Área", "Fila", "Demanda", "Operadora", "Status", "Criado em", ""].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p) => {
                const canDelete = p.status !== "atendida";
                const canEdit = p.status === "rascunho";
                return (
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontVariantNumeric: "tabular-nums", fontWeight: 700, color: TOKENS.hv700 }}>{formatTicket(p.ticketNumber)}</td>
                    <td style={S.td}>{solicitanteName}</td>
                    <td style={S.td}>{p.area}</td>
                    <td style={S.td}>{p.fila}</td>
                    <td style={{ ...S.td, fontVariantNumeric: "tabular-nums" }}>{p.numeroDemanda}</td>
                    <td style={S.td}>{p.operadora}</td>
                    <td style={S.td}><StatusPill status={p.status} /></td>
                    <td style={{ ...S.td, color: TOKENS.inkSoft, whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</td>
                    <td style={{ ...S.td, textAlign: "right", whiteSpace: "nowrap" }}>
                      {canEdit && <button style={S.btnGhostSm} onClick={() => onEdit(p.id)}>Editar</button>}
                      {canDelete && <button style={S.btnGhostSm} onClick={() => onDelete(p.id)}>Excluir</button>}
                      {p.status === "rejeitado" && p.motivoRejeicao && <button style={S.btnGhostSm} onClick={() => onMotivo(p)}>Motivo</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------- Fila de Prioridades ----------------

function FilaPrioridades({ items, accounts, filters, setFilters, canFinalize, canReorder, onAtender, onRejeitar, onMoveUp, onMoveDown }) {
  const accMap = {};
  accounts.forEach((a) => { accMap[a.email] = a; });

  const open = items.filter((p) => p.status === "solicitado");
  let filtered = open;
  if (filters.fila) filtered = filtered.filter((p) => p.fila === filters.fila);
  if (filters.solicitante) filtered = filtered.filter((p) => p.solicitanteId === filters.solicitante);
  if (filters.from) { const t = new Date(filters.from + "T00:00:00").getTime(); filtered = filtered.filter((p) => (p.createdAt || 0) >= t); }
  if (filters.to) { const t = new Date(filters.to + "T23:59:59").getTime(); filtered = filtered.filter((p) => (p.createdAt || 0) <= t); }
  filtered = filtered.slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const solicitanteIds = [...new Set(open.map((p) => p.solicitanteId))];

  return (
    <>
      <div style={S.filters}>
        <Field label="Fila">
          <select value={filters.fila} onChange={(e) => setFilters({ ...filters, fila: e.target.value })}>
            <option value="">Todas</option>
            {FILAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Solicitante">
          <select value={filters.solicitante} onChange={(e) => setFilters({ ...filters, solicitante: e.target.value })}>
            <option value="">Todos os solicitantes</option>
            {solicitanteIds.map((id) => <option key={id} value={id}>{(accMap[id] && accMap[id].name) || id}</option>)}
          </select>
        </Field>
        <Field label="De"><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field>
        <Field label="Até"><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field>
      </div>

      {!filtered.length ? (
        <EmptyState title="Nenhuma prioridade em aberto" sub="Aqui aparecem só as demandas com status Solicitado, aguardando atendimento." />
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["", "Ticket", "Solicitante", "Área", "Fila", "Demanda", "Operadora", "Justificativa", "Status", "Data", ""].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                    {canReorder && (
                      <>
                        <button style={S.btnGhostSm} disabled={idx === 0} onClick={() => onMoveUp(p.id)} title="Subir">▲</button>
                        <button style={S.btnGhostSm} disabled={idx === filtered.length - 1} onClick={() => onMoveDown(p.id)} title="Descer">▼</button>
                      </>
                    )}
                  </td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums", fontWeight: 700, color: TOKENS.hv700 }}>{formatTicket(p.ticketNumber)}</td>
                  <td style={S.td}>{(accMap[p.solicitanteId] && accMap[p.solicitanteId].name) || p.solicitanteId || "—"}</td>
                  <td style={S.td}>{p.area}</td>
                  <td style={S.td}>{p.fila}</td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums" }}>{p.numeroDemanda}</td>
                  <td style={S.td}>{p.operadora}</td>
                  <td style={{ ...S.td, maxWidth: 220 }}>{p.justificativa}</td>
                  <td style={S.td}>
                    <StatusPill status={p.status} />
                  </td>
                  <td style={{ ...S.td, color: TOKENS.inkSoft, whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</td>
                  <td style={{ ...S.td, whiteSpace: "nowrap", textAlign: "right" }}>
                    {canFinalize && (
                      <>
                        <button style={S.btnSm} onClick={() => onAtender(p.id)}>Finalizar</button>{" "}
                        <button style={S.btnSecondarySm} onClick={() => onRejeitar(p.id)}>Rejeitar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------- Extração do Analítico ----------------

function ExtracaoAnalitico({ items, accounts }) {
  const accMap = {};
  accounts.forEach((a) => { accMap[a.email] = a; });
  const solicitanteIds = [...new Set(items.map((p) => p.solicitanteId))];

  const [filters, setFilters] = useState({ area: "", operadora: "", solicitante: "", from: "", to: "" });

  let filtered = items;
  if (filters.area) filtered = filtered.filter((p) => p.area === filters.area);
  if (filters.operadora) filtered = filtered.filter((p) => p.operadora === filters.operadora);
  if (filters.solicitante) filtered = filtered.filter((p) => p.solicitanteId === filters.solicitante);
  if (filters.from) { const t = new Date(filters.from + "T00:00:00").getTime(); filtered = filtered.filter((p) => (p.createdAt || 0) >= t); }
  if (filters.to) { const t = new Date(filters.to + "T23:59:59").getTime(); filtered = filtered.filter((p) => (p.createdAt || 0) <= t); }

  function baixarCsv() {
    const headers = ["Ticket", "Solicitante", "Área", "Fila", "Número da demanda", "Operadora", "Justificativa", "Status", "Criado em", "Enviado em", "Atendido em", "Rejeitado em", "Motivo da rejeição"];
    const rows = filtered.map((p) => [
      formatTicket(p.ticketNumber),
      (accMap[p.solicitanteId] && accMap[p.solicitanteId].name) || p.solicitanteId,
      p.area, p.fila, p.numeroDemanda, p.operadora, p.justificativa, STATUS_LABEL[p.status],
      fmtDate(p.createdAt), fmtDate(p.enviadoAt), fmtDate(p.atendidoAt), fmtDate(p.rejeitadoAt), p.motivoRejeicao || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracao-prioridades-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div style={S.filters}>
        <Field label="Área">
          <select value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })}>
            <option value="">Todas</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Operadora">
          <select value={filters.operadora} onChange={(e) => setFilters({ ...filters, operadora: e.target.value })}>
            <option value="">Todas</option>
            {OPERADORAS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Solicitante">
          <select value={filters.solicitante} onChange={(e) => setFilters({ ...filters, solicitante: e.target.value })}>
            <option value="">Todos</option>
            {solicitanteIds.map((id) => <option key={id} value={id}>{(accMap[id] && accMap[id].name) || id}</option>)}
          </select>
        </Field>
        <Field label="De"><input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field>
        <Field label="Até"><input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field>
        <button style={S.btn} onClick={baixarCsv} disabled={!filtered.length}>Baixar CSV ({filtered.length})</button>
      </div>

      {!filtered.length ? (
        <EmptyState title="Nenhum registro nesse filtro" sub="Ajuste os filtros acima para gerar a extração." />
      ) : (
        <div style={{ ...S.card, overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Ticket", "Solicitante", "Área", "Fila", "Demanda", "Operadora", "Status", "Criado em"].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums", fontWeight: 700, color: TOKENS.hv700 }}>{formatTicket(p.ticketNumber)}</td>
                  <td style={S.td}>{(accMap[p.solicitanteId] && accMap[p.solicitanteId].name) || p.solicitanteId}</td>
                  <td style={S.td}>{p.area}</td>
                  <td style={S.td}>{p.fila}</td>
                  <td style={{ ...S.td, fontVariantNumeric: "tabular-nums" }}>{p.numeroDemanda}</td>
                  <td style={S.td}>{p.operadora}</td>
                  <td style={S.td}><StatusPill status={p.status} /></td>
                  <td style={{ ...S.td, color: TOKENS.inkSoft, whiteSpace: "nowrap" }}>{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------- Acessos ----------------

function Acessos({ accounts, currentEmail, newUserError, onCreate, onResetPassword, onChangeRole, onRemove }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("solicitante");

  return (
    <>
      <div style={S.callout}>
        <b>Sobre esta lista</b>
        Aqui você libera o acesso de quem pode entrar na ferramenta. Todo novo usuário recebe a senha padrão <b>CSCHAP123</b> e é obrigado a trocá-la no primeiro acesso.
      </div>
      <div style={S.twoCol}>
        <div style={{ ...S.card, ...S.accentCard, padding: 20 }}>
          <div style={S.sectionTitle}>Novo usuário</div>
          {newUserError && <div style={S.gateError}>{newUserError}</div>}
          <Field label="Nome"><input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="E-mail"><input type="email" placeholder="nome@hapvida.com.br" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Perfil">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="solicitante">Solicitante</option>
              <option value="priorizador">Priorizador</option>
              <option value="gestor">Gestor</option>
              <option value="administrador">Administrador</option>
            </select>
          </Field>
          <button style={{ ...S.btn, width: "100%", justifyContent: "center" }}
            onClick={() => { onCreate(email, name, role); setName(""); setEmail(""); setRole("solicitante"); }}>
            Adicionar usuário
          </button>
        </div>

        {!accounts.length ? (
          <EmptyState title="Nenhum usuário cadastrado" sub="Adicione o primeiro usuário ao lado." />
        ) : (
          <div style={S.card}>
            {accounts.map((a) => (
              <div key={a.email} style={S.rosterRow}>
                <div style={S.avatarDotLight}>{initials(a.name)}</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={S.rosterName}>{a.name}</div>
                  <div style={S.rosterMeta}>{a.email}{a.mustChangePassword ? " · aguardando 1º acesso" : ""}</div>
                </div>
                <select value={a.role} style={S.rosterSelect} onChange={(e) => onChangeRole(a.email, e.target.value)}>
                  <option value="solicitante">Solicitante</option>
                  <option value="priorizador">Priorizador</option>
                  <option value="gestor">Gestor</option>
                  <option value="administrador">Administrador</option>
                </select>
                <button style={S.btnGhostSm} onClick={() => onResetPassword(a.email)}>Redefinir senha</button>
                <button style={S.btnGhostSm} onClick={() => onRemove(a.email)}>Remover</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ---------------- Dashboard ----------------

function Dashboard({ items, accounts }) {
  const counts = { rascunho: 0, solicitado: 0, atendida: 0, rejeitado: 0 };
  items.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
  const total = items.length;
  const open = counts.rascunho + counts.solicitado;

  const byMonth = {};
  items.forEach((p) => { const k = monthKey(p.createdAt || Date.now()); byMonth[k] = (byMonth[k] || 0) + 1; });
  const monthData = Object.keys(byMonth).sort().map((k) => ({ name: monthLabel(k), total: byMonth[k] }));

  const statusData = Object.keys(STATUS_LABEL).map((s) => ({ name: STATUS_LABEL[s], value: counts[s], color: STATUS_COLOR[s].fg }));

  const byFila = {};
  items.forEach((p) => { byFila[p.fila] = (byFila[p.fila] || 0) + 1; });
  const filaData = FILAS.map((f) => ({ name: f, total: byFila[f] || 0 }));

  const byArea = {};
  items.forEach((p) => { byArea[p.area] = (byArea[p.area] || 0) + 1; });
  const areaData = AREAS.map((a) => ({ name: a, value: byArea[a] || 0 }));
  const maxArea = Math.max(1, ...areaData.map((d) => d.value));

  const byOperadora = {};
  items.forEach((p) => { byOperadora[p.operadora] = (byOperadora[p.operadora] || 0) + 1; });
  const operadoraData = OPERADORAS.map((o) => ({ name: o, value: byOperadora[o] || 0 }));
  const maxOperadora = Math.max(1, ...operadoraData.map((d) => d.value));

  const accMap = {};
  (accounts || []).forEach((a) => { accMap[a.email] = a; });
  const bySolicitante = {};
  items.forEach((p) => { bySolicitante[p.solicitanteId] = (bySolicitante[p.solicitanteId] || 0) + 1; });
  const solicitanteData = Object.keys(bySolicitante)
    .map((id) => ({ name: (accMap[id] && accMap[id].name) || id, value: bySolicitante[id] }))
    .sort((a, b) => b.value - a.value);
  const maxSolicitante = Math.max(1, ...solicitanteData.map((d) => d.value));

  return (
    <>
      <div style={S.kpis}>
        <Kpi num={total} lbl="Total de demandas" />
        <Kpi num={open} lbl="Em aberto" />
        <Kpi num={counts.atendida} lbl="Atendidas" />
        <Kpi num={counts.rejeitado} lbl="Rejeitadas" />
      </div>
      <div style={S.twoCol}>
        <div style={{ ...S.card, padding: 20, borderLeft: `4px solid ${TOKENS.flowerOrange2}` }}>
          <div style={S.sectionTitle}>Volume por mês</div>
          {monthData.length ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={monthData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill={TOKENS.hv500} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ color: TOKENS.inkSoft }}>Sem dados ainda.</div>}
        </div>
        <div style={{ ...S.card, padding: 20, borderLeft: `4px solid ${TOKENS.flowerRed}` }}>
          <div style={S.sectionTitle}>Por status</div>
          <div style={S.bars}>
            {statusData.map((s) => (
              <div key={s.name} style={S.barRow}>
                <div style={S.barLabel}>{s.name}</div>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: `${total ? (s.value / total) * 100 : 0}%`, background: s.color }} /></div>
                <div style={S.barVal}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 20, marginTop: 16, borderLeft: `4px solid ${TOKENS.hv700}` }}>
        <div style={S.sectionTitle}>Por fila</div>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={filaData} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: TOKENS.inkSoft }} axisLine={false} tickLine={false} width={90} />
              <Tooltip />
              <Bar dataKey="total" fill={TOKENS.hv700} radius={[0, 4, 4, 0]}>{filaData.map((_, i) => <Cell key={i} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ ...S.twoCol, marginTop: 16 }}>
        <div style={{ ...S.card, padding: 20, borderLeft: `4px solid ${TOKENS.flowerYellow}` }}>
          <div style={S.sectionTitle}>Por área</div>
          <div style={S.bars}>
            {areaData.map((d) => (
              <div key={d.name} style={S.barRow}>
                <div style={S.barLabel}>{d.name}</div>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: `${(d.value / maxArea) * 100}%`, background: TOKENS.hv500 }} /></div>
                <div style={S.barVal}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...S.card, padding: 20, borderLeft: `4px solid ${TOKENS.flowerOrange}` }}>
          <div style={S.sectionTitle}>Por operadora</div>
          <div style={S.bars}>
            {operadoraData.map((d) => (
              <div key={d.name} style={S.barRow}>
                <div style={S.barLabel}>{d.name}</div>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: `${(d.value / maxOperadora) * 100}%`, background: TOKENS.hv700 }} /></div>
                <div style={S.barVal}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 20, marginTop: 16, borderLeft: `4px solid ${TOKENS.hv900}` }}>
        <div style={S.sectionTitle}>Por solicitante</div>
        {solicitanteData.length ? (
          <div style={S.bars}>
            {solicitanteData.map((d) => (
              <div key={d.name} style={S.barRow}>
                <div style={S.barLabel}>{d.name}</div>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: `${(d.value / maxSolicitante) * 100}%`, background: TOKENS.flowerRed }} /></div>
                <div style={S.barVal}>{d.value}</div>
              </div>
            ))}
          </div>
        ) : <div style={{ color: TOKENS.inkSoft }}>Sem dados ainda.</div>}
      </div>
    </>
  );
}
function Kpi({ num, lbl }) {
  return <div style={{ ...S.card, ...S.kpi }}><div style={S.kpiNum}>{num}</div><div style={S.kpiLbl}>{lbl}</div></div>;
}

// ---------------- modais ----------------

function ConfirmModal({ title, msg, onCancel, onConfirm }) {
  return (
    <div style={S.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>{title}</h3>
        <p style={S.modalMsg}>{msg}</p>
        <div style={S.modalActions}>
          <button style={S.btnSecondary} onClick={onCancel}>Cancelar</button>
          <button style={S.btnDanger} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
function InfoModal({ title, text, onClose }) {
  return (
    <div style={S.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={S.modalTitle}>{title}</h3>
          <button style={S.closeX} onClick={onClose}>✕</button>
        </div>
        <p style={{ color: TOKENS.ink }}>{text || "—"}</p>
      </div>
    </div>
  );
}
function RejectModal({ onCancel, onConfirm }) {
  const [motivo, setMotivo] = useState("");
  return (
    <div style={S.modalBackdrop} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={S.modal}>
        <h3 style={S.modalTitle}>Rejeitar prioridade</h3>
        <p style={S.modalMsg}>Informe o motivo da rejeição.</p>
        <textarea style={{ minHeight: 80 }} placeholder="Motivo…" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <div style={S.modalActions}>
          <button style={S.btnSecondary} onClick={onCancel}>Cancelar</button>
          <button style={S.btnDanger} onClick={() => { if (!motivo.trim()) return; onConfirm(motivo.trim()); }}>Rejeitar</button>
        </div>
      </div>
    </div>
  );
}

// ==================== estilos ====================
// Fonte única (Inter) para todo o app, incluindo títulos — mesmo padrão
// simples e neutro usado no login do Indicadores CSC.

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const CSS_RESET = `
  * { box-sizing: border-box; }
  input, select, textarea, button { font-family: ${FONT}; font-size: 14px; color: inherit; }
  input[type=text], input[type=email], input[type=password], input[type=date], select, textarea {
    width: 100%; padding: 10px 12px; border: 1px solid ${TOKENS.line}; border-radius: 8px;
    background: ${TOKENS.paper}; color: ${TOKENS.ink};
  }
  textarea { resize: vertical; min-height: 90px; }
  input:focus, select:focus, textarea:focus { outline: 2px solid ${TOKENS.hv500}; outline-offset: 1px; }
  a { text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const S = {
  app: { display: "flex", minHeight: "100vh", fontFamily: FONT, background: TOKENS.paper, color: TOKENS.ink, fontSize: 14, lineHeight: 1.5 },

  sidebar: { width: 240, flex: "none", background: TOKENS.gradGate, color: "#fff", display: "flex", flexDirection: "column", padding: "20px 14px", gap: 4, overflowY: "auto", maxHeight: "100vh", position: "sticky", top: 0 },
  brandRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 10px 22px" },
  brandMark: { width: 42, height: 42, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" },
  brandImg: { width: 30, height: "auto", display: "block", maxWidth: "100%" },
  brandTitle: { fontFamily: FONT, fontWeight: 800, fontSize: 13.5, lineHeight: 1.25 },
  brandSub: { fontFamily: FONT, fontWeight: 500, fontSize: 11, color: TOKENS.hv300, letterSpacing: .3 },
  navSectionLabel: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: .7, color: "rgba(255,255,255,.4)", padding: "16px 12px 4px", fontWeight: 600 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, color: "rgba(255,255,255,.78)", cursor: "pointer", border: "none", background: "transparent", textAlign: "left", width: "100%", fontSize: 13.5, fontWeight: 500 },
  navItemActive: { background: TOKENS.hv500, color: "#fff", fontWeight: 700 },
  sidebarFoot: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)" },
  who: { display: "flex", alignItems: "center", gap: 9, padding: "8px 10px" },
  avatarDot: { width: 30, height: 30, borderRadius: "50%", flex: "none", background: TOKENS.hv500, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12.5, fontFamily: FONT },
  whoName: { fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 118 },
  whoRole: { fontSize: 11, color: TOKENS.hv300 },
  logoutBtn: { background: "none", border: "none", color: "rgba(255,255,255,.55)", cursor: "pointer", fontSize: 11.5, padding: "6px 10px", textAlign: "left", width: "100%" },

  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" },
  topbar: { height: 60, flex: "none", borderBottom: `1px solid ${TOKENS.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px" },
  bellBtn: { position: "relative", background: "transparent", border: "none", cursor: "pointer", fontSize: 19, padding: 6, lineHeight: 1 },
  bellBadge: { position: "absolute", top: -2, right: -2, background: TOKENS.flowerRed, color: "#fff", borderRadius: 100, fontSize: 10, fontWeight: 800, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  notifPanel: { position: "absolute", top: 38, right: 0, width: 300, maxHeight: 360, overflowY: "auto", background: "#fff", border: `1px solid ${TOKENS.line}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,.18)", zIndex: 40 },
  notifHeader: { padding: "12px 14px", fontWeight: 800, fontSize: 13, borderBottom: `1px solid ${TOKENS.line}`, color: TOKENS.hv900 },
  notifEmpty: { padding: "24px 14px", textAlign: "center", color: TOKENS.inkSoft, fontSize: 12.5 },
  notifList: { display: "flex", flexDirection: "column" },
  notifItem: { padding: "10px 14px", borderBottom: `1px solid ${TOKENS.line}`, fontSize: 12.5 },
  notifTime: { color: TOKENS.inkSoft, fontSize: 11, marginTop: 2 },
  topbarTitle: { fontFamily: FONT, fontSize: 17, margin: 0, fontWeight: 800, color: TOKENS.hv900 },
  content: { flex: 1, padding: 26, overflowY: "auto" },
  contentInner: { maxWidth: 1360, margin: "0 auto" },
  appFooter: { flex: "none", textAlign: "center", fontSize: 11.5, color: TOKENS.inkSoft, padding: "10px 0 14px", opacity: .7 },

  card: { background: TOKENS.card, border: `1px solid ${TOKENS.line}`, borderRadius: 10, boxShadow: "0 1px 2px rgba(21,57,170,.08)" },
  accentCard: { borderLeft: `4px solid ${TOKENS.flowerRed}` },

  btn: { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "1px solid transparent", fontWeight: 700, fontSize: 13.5, cursor: "pointer", background: TOKENS.hv500, color: "#fff" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontWeight: 700, fontSize: 13.5, cursor: "pointer", background: "transparent", color: TOKENS.ink },
  btnDanger: { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "1px solid transparent", fontWeight: 700, fontSize: 13.5, cursor: "pointer", background: "#D42832", color: "#fff" },
  btnGhostSm: { background: "transparent", border: "none", color: TOKENS.inkSoft, padding: "6px 10px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" },
  btnSm: { padding: "6px 11px", borderRadius: 8, border: "1px solid transparent", fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: TOKENS.hv500, color: "#fff" },
  btnSecondarySm: { padding: "6px 11px", borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: "transparent", color: TOKENS.ink },

  label: { display: "block", fontSize: 12.5, fontWeight: 700, color: TOKENS.inkSoft, margin: "0 0 6px" },
  field: { marginBottom: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },

  pill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" },
  pillDot: { width: 6, height: 6, borderRadius: "50%" },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: .4, color: TOKENS.inkSoft, padding: "10px 12px", borderBottom: `1px solid ${TOKENS.line}`, fontWeight: 700 },
  td: { padding: 12, borderBottom: `1px solid ${TOKENS.line}`, verticalAlign: "top" },

  empty: { padding: "50px 20px", textAlign: "center", color: TOKENS.inkSoft },
  emptyTitle: { fontWeight: 700, color: TOKENS.ink, marginBottom: 4, fontSize: 14.5 },

  filters: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, alignItems: "flex-end" },

  kpis: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 },
  kpi: { padding: "16px 18px" },
  kpiNum: { fontFamily: FONT, fontSize: 26, fontWeight: 800, lineHeight: 1 },
  kpiLbl: { fontSize: 12, color: TOKENS.inkSoft, marginTop: 6, fontWeight: 600 },

  twoCol: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" },

  bars: { display: "flex", flexDirection: "column", gap: 10 },
  barRow: { display: "flex", alignItems: "center", gap: 10 },
  barLabel: { width: 96, flex: "none", fontSize: 12.5, fontWeight: 600, color: TOKENS.inkSoft },
  barTrack: { flex: 1, height: 10, background: "#EDEDEA", borderRadius: 6, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 6 },
  barVal: { width: 34, flex: "none", textAlign: "right", fontSize: 12.5, fontWeight: 700 },

  sectionTitle: { fontSize: 14, fontWeight: 800, margin: "0 0 14px", fontFamily: FONT, color: TOKENS.hv900 },

  draftNote: { background: "#FFEAD1", color: "#CC6D00", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, fontWeight: 600, marginBottom: 16 },

  callout: { background: TOKENS.hv100, border: `1px solid ${TOKENS.hv300}`, borderRadius: 10, padding: "14px 16px", fontSize: 12.5, color: TOKENS.hv900, marginBottom: 18 },

  rosterRow: { display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: `1px solid ${TOKENS.line}`, flexWrap: "wrap" },
  rosterName: { fontWeight: 700, fontSize: 13.5 },
  rosterMeta: { fontSize: 11.5, color: TOKENS.inkSoft },
  rosterSelect: { width: "auto", padding: "6px 8px", fontSize: 12 },
  avatarDotLight: { width: 30, height: 30, borderRadius: "50%", flex: "none", background: TOKENS.hv100, color: TOKENS.hv700, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12.5, fontFamily: FONT },

  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(10,18,14,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 },
  modal: { background: "#fff", borderRadius: 14, padding: 24, maxWidth: 440, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,.25)" },
  modalTitle: { margin: "0 0 6px", fontSize: 16 },
  modalMsg: { margin: "0 0 16px", color: TOKENS.inkSoft, fontSize: 13 },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 },
  closeX: { background: "none", border: "none", color: TOKENS.inkSoft, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 },

  toast: { position: "fixed", bottom: 22, right: 22, background: TOKENS.hv900, color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 60 },

  spinner: { width: 26, height: 26, borderRadius: "50%", border: `3px solid ${TOKENS.line}`, borderTopColor: TOKENS.hv500, animation: "spin .7s linear infinite", margin: "20px auto" },

  // ---- gate (login / trocar senha) ----
  gate: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: TOKENS.gradGate, position: "relative", overflow: "hidden" },
  gateCircle1: { position: "absolute", width: 420, height: 420, top: -160, right: -120, borderRadius: "50%", background: "rgba(255,255,255,.08)" },
  gateCircle2: { position: "absolute", width: 320, height: 320, bottom: -140, left: -100, borderRadius: "50%", background: "rgba(255,255,255,.06)" },
  gateCard: { maxWidth: 400, width: "100%", textAlign: "center", padding: "44px 36px", position: "relative", zIndex: 1, borderRadius: 20, background: "#fff", boxShadow: "0 24px 60px rgba(6,10,40,.35)" },
  gateMark: { display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  gateImg: { width: 60, height: "auto", display: "block" },
  gateH2: { margin: "0 0 8px", fontSize: 21, fontWeight: 800, color: TOKENS.ink, fontFamily: FONT },
  gateP: { color: TOKENS.inkSoft, fontSize: 13.5, margin: "0 0 24px", lineHeight: 1.5 },
  gateError: { background: "#FFCCCC", color: "#D42832", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, marginBottom: 14, textAlign: "left" },
  gateBtn: { width: "100%", justifyContent: "center", display: "flex", alignItems: "center", padding: "13px 16px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#fff", marginTop: 4, background: `linear-gradient(90deg, ${TOKENS.flowerRed} 0%, ${TOKENS.flowerOrange2} 100%)` },
  gateHint: { fontSize: 12, color: TOKENS.inkSoft, marginTop: 16, lineHeight: 1.5 },
  gateBackLink: { color: TOKENS.hv700, fontWeight: 700 },
  gateFooter: { position: "absolute", bottom: 22, left: 0, right: 0, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.55)", zIndex: 1 },
};
