'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/authFetch';
import styles from './admin.module.css';

type Tab = 'stats' | 'users' | 'payments' | 'jobs';

interface Stats {
  userCount: number;
  cvCount: number;
  planBreakdown: Record<string, number>;
  revenueThisMonth: number;
}
interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
  plan: string;
  isAdmin: boolean;
  usage: { used: number; limit: number };
}
interface Payment {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
}

const PLANS = ['Gratuit', 'Étudiant', 'Professionnel'];
const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

const TAB_LABELS: Record<Tab, string> = {
  stats: 'Statistiques',
  users: 'Utilisateurs',
  payments: 'Paiements',
  jobs: 'Offres',
};

export default function AdminPage() {
  const [authState, setAuthState] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [tab, setTab] = useState<Tab>('stats');

  useEffect(() => {
    authFetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAuthState(d?.isAdmin ? 'ok' : 'denied'))
      .catch(() => setAuthState('denied'));
  }, []);

  if (authState === 'checking') {
    return <div className={styles.center}><p className="text-muted">Vérification des droits…</p></div>;
  }
  if (authState === 'denied') {
    return (
      <div className={styles.center}>
        <h2>Accès refusé</h2>
        <p className="text-muted">Cette page est réservée aux administrateurs.</p>
        <Link href="/" className="btn btn-ghost">← Retour à l’accueil</Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="nav">
        <span className="nav-brand">Administration</span>
        <Link href="/" className="btn btn-ghost">← Retour à l’app</Link>
      </nav>

      <div className={styles.container}>
        <div className={styles.segWrap} role="tablist" aria-label="Sections d’administration">
          <div className="seg">
            {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
              <label key={t} className="seg-opt">
                <input
                  type="radio"
                  name="admin-tab"
                  checked={tab === t}
                  onChange={() => setTab(t)}
                />
                {TAB_LABELS[t]}
              </label>
            ))}
          </div>
        </div>

        <section className={styles.panel}>
          {tab === 'stats' && <StatsPanel />}
          {tab === 'users' && <UsersPanel />}
          {tab === 'payments' && <PaymentsPanel />}
          {tab === 'jobs' && <JobsPanel />}
        </section>
      </div>
    </div>
  );
}

function StatCard({ kicker, value }: { kicker: string; value: number | string }) {
  return (
    <div className="card">
      <span className="card-kicker">{kicker}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    authFetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => (d.success ? setStats(d.stats) : setErr(d.error || 'Erreur')))
      .catch(() => setErr('Erreur réseau'));
  }, []);

  if (err) return <p className={styles.error}>{err}</p>;
  if (!stats) return <p className="text-muted">Chargement…</p>;

  return (
    <div className={styles.cards}>
      <StatCard kicker="Utilisateurs" value={stats.userCount} />
      <StatCard kicker="CV générés" value={stats.cvCount} />
      <StatCard kicker="Revenus du mois" value={fcfa(stats.revenueThisMonth)} />
      {PLANS.map((p) => (
        <StatCard key={p} kicker={`Plan ${p}`} value={stats.planBreakdown[p] ?? 0} />
      ))}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () =>
    authFetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => (d.success ? setUsers(d.users) : setErr(d.error || 'Erreur')))
      .catch(() => setErr('Erreur réseau'));

  useEffect(() => { load(); }, []);

  const changePlan = async (userId: string, plan: string) => {
    setSaving(userId);
    try {
      const res = await authFetch('/api/admin/users/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Échec du changement de plan.');
      }
    } finally {
      setSaving(null);
    }
  };

  if (err) return <p className={styles.error}>{err}</p>;

  return (
    <div className={styles.tableWrap}>
      <table className="table">
        <thead>
          <tr><th>Email</th><th>Inscrit le</th><th>Usage (mois)</th><th>Plan</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}{u.isAdmin && <span className={`tag tag-accent ${styles.inlineTag}`}>admin</span>}</td>
              <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              <td>{u.usage.used}{u.usage.limit >= 0 ? ` / ${u.usage.limit}` : ' / ∞'}</td>
              <td>
                <select
                  value={u.plan}
                  disabled={saving === u.id}
                  onChange={(e) => changePlan(u.id, e.target.value)}
                  className={`input ${styles.planSelect}`}
                >
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={4} className="text-muted">Aucun utilisateur.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const STATUS_TAG: Record<string, string> = {
  paid: 'tag-accent',
  pending: 'tag-neutral',
  failed: 'tag-outline',
};

function PaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    authFetch('/api/admin/payments')
      .then((r) => r.json())
      .then((d) => (d.success ? setPayments(d.payments) : setErr(d.error || 'Erreur')))
      .catch(() => setErr('Erreur réseau'));
  }, []);

  if (err) return <p className={styles.error}>{err}</p>;

  return (
    <div className={styles.tableWrap}>
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Plan</th><th>Montant</th><th>Fournisseur</th><th>Statut</th></tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.created_at).toLocaleString('fr-FR')}</td>
              <td>{p.plan}</td>
              <td>{fcfa(p.amount)}</td>
              <td>{p.provider}</td>
              <td><span className={`tag ${STATUS_TAG[p.status] ?? 'tag-neutral'}`}>{p.status}</span></td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={5} className="text-muted">Aucun paiement enregistré.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function JobsPanel() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const trigger = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await authFetch('/api/admin/scrape', { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      setResult(
        res.ok
          ? `✅ ${d.upserted} offre(s) mises à jour (${d.scraped} scrapées) en ${Math.round((d.durationMs || 0) / 1000)}s.`
          : `❌ ${d.error || 'Échec du scraping.'}`
      );
    } catch {
      setResult('❌ Erreur réseau.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <p className="text-muted">Le scraping s’exécute automatiquement chaque jour. Vous pouvez aussi le relancer maintenant :</p>
      <button className="btn btn-primary" onClick={trigger} disabled={running}>
        {running ? 'Scraping en cours… (jusqu’à 1 min)' : 'Relancer le scraping des offres'}
      </button>
      {result && <p className={styles.result}>{result}</p>}
    </div>
  );
}
