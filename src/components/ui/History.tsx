'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './History.module.css';
import { Button } from './Button';

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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement de votre historique...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{errorMsg}</p>
        <Button onClick={fetchHistory} style={{ marginTop: '1rem' }}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Mon Historique SaaS</h2>
        <p>Retrouvez et modifiez vos candidatures passées en un clin d'œil.</p>
      </div>

      {cvList.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <h3>Aucune candidature trouvée</h3>
          <p>Vous n'avez pas encore généré de CV optimisé avec cette version.</p>
          <Button onClick={onNavigateToGenerator} style={{ marginTop: '1.5rem' }}>
            Créer ma première candidature
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {cvList.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => handleSelect(item)}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <button className={styles.deleteBtn} onClick={(e) => handleDelete(item.id, e)} title="Supprimer">
                  &times;
                </button>
              </div>
              <h3 className={styles.jobTitle}>{item.jobTitle || 'Poste non spécifié'}</h3>
              <p className={styles.companyName}>🏢 {item.companyName || 'Entreprise non spécifiée'}</p>
              
              <div className={styles.cardFooter}>
                <span className={styles.badge}>Optimisé ATS</span>
                <span className={styles.loadLink}>Charger l'aperçu &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
