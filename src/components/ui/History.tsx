'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './History.module.css';

interface HistoryCv {
  id: string;
  jobTitle: string | null;
  companyName: string | null;
  createdAt: string;
  generatedCVUrl: string | null;
  coverLetterUrl: string | null;
  emailText: string | null;
  originalText: string | null;
}

interface HistoryProps {
  onLoadCv: (cvData: any, metadata: { jobTitle: string; companyName: string }) => void;
  onNavigateToGenerator: () => void;
}

export function History({ onLoadCv, onNavigateToGenerator }: HistoryProps) {
  const [cvList, setCvList] = useState<HistoryCv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg('Veuillez vous connecter pour voir votre historique.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/cv/history', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCvList(data.cvs);
      } else {
        setErrorMsg(data.error || 'Erreur lors de la récupération de l\'historique.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette candidature de votre historique ?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/cv/history?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCvList(cvList.filter(item => item.id !== id));
      } else {
        alert(data.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      console.error(err);
      alert('Impossible de supprimer le document.');
    }
  };

  const handleSelect = (item: HistoryCv) => {
    try {
      if (!item.generatedCVUrl) return;
      const parsedCV = JSON.parse(item.generatedCVUrl);

      // Inject the cover letter and email text into the parsed CV structure
      parsedCV.cover_letter = item.coverLetterUrl || '';
      parsedCV.email_text = item.emailText || '';

      onLoadCv(parsedCV, {
        jobTitle: item.jobTitle || 'Poste',
        companyName: item.companyName || 'Entreprise'
      });
    } catch (err) {
      console.error('Error parsing loaded CV data:', err);
      alert('Erreur lors du chargement des données.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.state}>
        <div className={styles.spinner}></div>
        <p className="text-muted">Chargement de votre historique…</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={styles.state}>
        <p className={styles.errorText}>{errorMsg}</p>
        <button className="btn btn-secondary" onClick={fetchHistory}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Mon historique</h2>
        <p className="text-muted">Retrouvez et rouvrez vos candidatures passées en un clic.</p>
      </div>

      {cvList.length === 0 ? (
        <div className={styles.empty}>
          <h3>Aucune candidature</h3>
          <p className="text-muted">Vous n’avez pas encore généré de dossier.</p>
          <button className="btn btn-primary" onClick={onNavigateToGenerator}>Créer ma première candidature</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className="table">
            <thead>
              <tr>
                <th>Poste</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th>Score ATS</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {cvList.map((item) => (
                <tr key={item.id}>
                  <td>{item.jobTitle || 'Poste non spécifié'}</td>
                  <td>{item.companyName || '—'}</td>
                  <td>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td><span className="tag tag-accent">Optimisé ATS</span></td>
                  <td className={styles.actions}>
                    <button className="btn btn-ghost" onClick={() => handleSelect(item)}>Ouvrir →</button>
                    <button className="btn btn-ghost" onClick={(e) => handleDelete(item.id, e)} aria-label="Supprimer" title="Supprimer">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
