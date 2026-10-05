import { useEffect, useRef, useState } from "react";
import { Globe, MapPin, Sliders, Award, Briefcase, Link as LinkIcon, Inbox, RefreshCw, Plus, Check, Search, X, Sun, Moon } from "react-feather";
import { api } from "./api.js";
import logoLight from "./assets/mark-light.png";
import logoDark from "./assets/mark-dark.png";

const TABS = [["worldwide", "Worldwide", Globe], ["nigeria", "Nigeria", MapPin], ["grants", "Grants", Award], ["settings", "Settings", Sliders]];
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const dtf = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const when = (iso) => { const d = Date.parse(iso); return Number.isNaN(d) ? null : d; };
const ago = (iso) => {
  const d = when(iso);
  if (d === null) return "date unknown";
  const mins = Math.round((d - Date.now()) / 6e4);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return rtf.format(hrs, "hour");
  return rtf.format(Math.round(hrs / 24), "day");
};
const Chip = ({ t, cls = "", ...p }) => <button type="button" className={`chip ${cls}`} {...p}>{t}</button>;
const Icon = ({ node: Node, ...p }) => <Node aria-hidden="true" focusable="false" {...p} />;
const lastVisit = Number(localStorage.getItem("lastVisit")) || 0;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const Highlight = ({ text = "", q }) => {
  const terms = q.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return text;
  const re = new RegExp("(" + terms.map(esc).join("|") + ")", "gi");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
};

function Jobs({ tab, q, setQ, searchRef }) {
  const [jobs, setJobs] = useState(null), [active, setActive] = useState(new Set()), [only, setOnly] = useState(true), [err, setErr] = useState("");
  useEffect(() => {
    const load = () => api.jobs(tab).then((d) => { setJobs(d); setErr(""); }, (e) => setErr(String(e?.message || e)));
    load(); setActive(new Set()); setErr("");
    const off = api.onUpdated(load);
    return () => { off?.(); localStorage.setItem("lastVisit", Date.now()); };
  }, [tab]);
  const grants = tab === "grants", noun = grants ? "opportunity" : "role";
  if (err) return <div className="empty"><Icon node={X} size={28} /><p>Could not load {noun}s: {err}</p></div>;
  if (!jobs) return <p className="empty" aria-live="polite">Loading {noun}s…</p>;

  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (j) => [j.title, j.org, j.location, j.source, ...j.tags].join(" ").toLowerCase();
  const shown = jobs.filter((j) => (grants || !only || j.score > 0 || j.tags.includes("relocation")) && [...active].every((t) => j.tags.includes(t)) && terms.every((w) => hay(j).includes(w)))
    .sort((a, b) => (Date.parse(b.posted) || 0) - (Date.parse(a.posted) || 0));
  const counts = {}; jobs.forEach((j) => j.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map((e) => e[0]);
  const toggle = (t) => setActive((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });
  return (<>
    <div className="search">
      <Icon node={Search} size={17} />
      <input ref={searchRef} id="role-search" type="search" name="q" autoComplete="off" spellCheck={false}
        value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setQ("")}
        placeholder="Search title, company, location, tag…" aria-label="Search roles" />
      {q && <button type="button" className="clear" onClick={() => setQ("")} aria-label="Clear search"><Icon node={X} size={16} /></button>}
    </div>
    <div className="bar">
      {!grants && <label className="check"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} />Only roles matching my interests</label>}
      <span className="push">{shown.length} of {jobs.length} {noun}s</span>
    </div>
    {top.length > 0 && <div className="tags gap">{top.map((t) => <Chip key={t} t={t} cls={active.has(t) ? "active" : ""} aria-pressed={active.has(t)} onClick={() => toggle(t)}>{t}</Chip>)}</div>}
    {shown.length ? <div className="list">{shown.map((j) => (
      <article key={j.id} className="job">
        <a className="job-main" href={j.url} target="_blank" rel="noopener noreferrer">
        <h2><Highlight text={j.title} q={q} /></h2>
        <div className="meta">
          {j.org && <span><Icon node={Briefcase} size={14} /><Highlight text={j.org} q={q} /></span>}
          {j.location && <span><Icon node={MapPin} size={14} /><Highlight text={j.location} q={q} /></span>}
          <span><Icon node={LinkIcon} size={14} />via {j.source}</span>
          <time dateTime={j.posted || undefined} title={when(j.posted) !== null ? dtf.format(when(j.posted)) : undefined}>{ago(j.posted)}</time>
          {j.deadline_label && <span>Deadline: {j.deadline_label}</span>}
          {j.first_seen > lastVisit && <span className="chip new">new</span>}
        </div>
        <div className="tags">{j.tags.map((t) => <span key={t} className="chip"><Highlight text={t} q={q} /></span>)}</div>
        </a>
        {j.attribution && <div className="meta"><a href={j.attribution.url} target="_blank" rel="noopener noreferrer">{j.attribution.label}</a></div>}
      </article>
    ))}</div> : <div className="empty"><Icon node={Inbox} size={28} /><p>{jobs.length ? `No ${noun}s match your search and filters.` : `No ${noun}s yet. The first refresh can take a minute; check Settings for source status.`}</p></div>}
  </>);
}

const Field = ({ label, hint, children }) => (
  <label className="field"><span className="lbl">{label}</span>{hint && <span className="hint">{hint}</span>}{children}</label>
);

function Settings() {
  const [s, setS] = useState(null), [health, setHealth] = useState([]), [url, setUrl] = useState("");
  const [key, setKey] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState("");
  const load = () => { api.getSettings().then(setS); api.health().then(setHealth); };
  useEffect(load, []);
  if (!s) return <p className="empty" aria-live="polite">Loading settings…</p>;

  const list = (v) => v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  const save = async () => {
    setBusy("save"); setMsg("");
    try {
      await api.setSettings({ interests: list(s.interestsText ?? s.interests.join(", ")).map((x) => x.toLowerCase()),
        xQueries: list(s.queriesText ?? s.xQueries.join("\n")), xHandles: list(s.handlesText ?? s.xHandles.join(", ")).map((h) => h.replace(/^@/, "")),
        ...(key ? { xaiKey: key } : {}) });
      setKey(""); setMsg("Saved"); load();
    } finally { setBusy(""); }
  };
  const addSource = async () => {
    if (!url.trim()) return;
    setBusy("add"); setMsg("");
    try { await api.addSource(url); setUrl(""); load(); } finally { setBusy(""); }
  };
  const refresh = async () => {
    setBusy("refresh"); setMsg("");
    try { await api.refresh(); setTimeout(load, 4000); } finally { setBusy(""); }
  };
  return (<div className="panels">
    <div className="col">
    <section className="panel"><h2>Interests</h2>
      <p className="bar">Tags or title words, comma-separated. Matching roles rank first.</p>
      <Field label="Interest Keywords"><input name="interests" autoComplete="off" spellCheck={false}
        value={s.interestsText ?? s.interests.join(", ")} onChange={(e) => setS({ ...s, interestsText: e.target.value })}
        placeholder="e.g. react, remote, nigeria…" /></Field></section>

    <section className="panel"><h2>X Search</h2>
      <p className="bar">Uses Grok&rsquo;s X Search tool at about $0.005 per search. Results are leads, so open each link to verify. {s.xaiKeySet ? "An xAI key is saved." : "No key saved yet."}</p>
      <Field label="xAI API Key"><input type="password" name="xaiKey" autoComplete="off" spellCheck={false}
        value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste your key…" /></Field>
      <Field label="Search Queries" hint="One search per line."><textarea name="xQueries" rows={3} spellCheck={false}
        value={s.queriesText ?? s.xQueries.join("\n")} onChange={(e) => setS({ ...s, queriesText: e.target.value })}
        placeholder="e.g. (remote OR onsite) react role Lagos…" /></Field>
      <Field label="Limit to Accounts" hint="Optional, comma-separated."><input name="xHandles" autoComplete="off" spellCheck={false}
        value={s.handlesText ?? s.xHandles.join(", ")} onChange={(e) => setS({ ...s, handlesText: e.target.value })}
        placeholder="e.g. handle1, handle2" /></Field></section>

    <div className="actions">
      <button type="button" className="btn" onClick={save} disabled={busy === "save"}>
        <Icon node={Check} size={16} />{busy === "save" ? "Saving…" : "Save Settings"}</button>
      <span className="msg" role="status">{msg}</span>
    </div>
    </div>

    <div className="col">
    <section className="panel"><h2>Add a Source</h2>
      <p className="bar">Paste a Greenhouse, Lever or Ashby board URL, or any RSS feed URL.</p>
      <Field label="Source URL"><input type="url" name="sourceUrl" autoComplete="off" spellCheck={false}
        value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://boards.greenhouse.io/acme" /></Field>
      <button type="button" className="btn quiet" onClick={addSource} disabled={busy === "add" || !url.trim()}>
        <Icon node={Plus} size={16} />{busy === "add" ? "Adding…" : "Add Source"}</button></section>

    <section className="panel"><h2>Source Health</h2>
      {health.map((r) => <div className="row" key={r.source}><span>{r.source}</span>
        <span className={r.ok ? "num" : "bad"}>{r.ok ? `${r.count} roles` : r.error}</span></div>)}
      {!health.length && <p className="bar">No refresh has finished yet.</p>}
      <button type="button" className="btn quiet" onClick={refresh} disabled={busy === "refresh"}>
        <Icon node={RefreshCw} size={16} className={busy === "refresh" ? "spin" : ""} />{busy === "refresh" ? "Refreshing…" : "Refresh Now"}</button></section>
    </div>
  </div>);
}

export default function App() {
  const [tab, setTab] = useState(() => {
    const h = location.hash.replace(/^#\/?/, "");
    return TABS.some(([id]) => id === h) ? h : "worldwide";
  });
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  const searchRef = useRef(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]:not([media])')?.remove();
    const m = document.createElement("meta");
    m.name = "theme-color";
    m.content = getComputedStyle(document.body).backgroundColor;
    document.head.append(m);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace(/^#\/?/, "");
      if (!TABS.some(([id]) => id === h)) return;
      if (tabRef.current !== h) setQ("");
      tabRef.current = h;
      setTab(h);
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const u = new URL(location.href);
    q ? u.searchParams.set("q", q) : u.searchParams.delete("q");
    try { history.replaceState(null, "", u); } catch {} // file:// can reject history writes
  }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName))) {
        e.preventDefault();
        if (tab !== "settings") { location.hash = "/" + tab; searchRef.current?.focus(); searchRef.current?.select(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [tab]);

  const go = (id) => { setTab(id); setQ(""); location.hash = "/" + id; };
  return (<div className="wrap">
    <a className="skip" href="#main">Skip to Content</a>
    <div className="bar-top">
      <header className="logo">
        <img className="logo-mark" src={theme === "dark" ? logoDark : logoLight} alt=""
          width={128} height={128} decoding="async" fetchPriority="high" />Yggdrasil
        <button type="button" className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
          {theme === "dark" ? <Icon node={Sun} size={17} /> : <Icon node={Moon} size={17} />}</button>
      </header>
      <nav className="tabs" aria-label="Views">{TABS.map(([id, label, I]) => (
        <button key={id} type="button" className={"tab" + (tab === id ? " on" : "")} aria-current={tab === id ? "page" : undefined} onClick={() => go(id)}>
          <Icon node={I} size={17} /><span>{label}</span></button>))}</nav>
    </div>
    <main id="main" tabIndex={-1}>
      {tab === "settings" ? <Settings /> : <Jobs tab={tab} q={q} setQ={setQ} searchRef={searchRef} />}
    </main>
  </div>);
}
