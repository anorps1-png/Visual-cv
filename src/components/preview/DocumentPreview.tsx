'use client';

import React, { useState } from 'react';
import styles from './DocumentPreview.module.css';
import { Button } from '../ui/Button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ATSPdfDocument } from './PDFDocument';

interface GeneratedData {
  score: number;
  keywords_matched: string[];
  keywords_missing: string[];
  cv_summary: string;
  cv_experiences: Array<{
    title: string;
    company: string;
    dates: string;
    bullet_points: string[];
  }>;
  cover_letter: string;
  email_text: string;
}

interface DocumentPreviewProps {
  data: GeneratedData;
  onReset: () => void;
}

export function DocumentPreview({ data, onReset }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter' | 'email'>('cv');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreText}>{data.score}%</span>
          </div>
          <div>
            <h3>Compatibilité</h3>
            <p className={styles.keywords}>Mots-clés trouvés : {data.keywords_matched.join(', ')}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={onReset}>Recommencer</Button>
          <PDFDownloadLink document={<ATSPdfDocument data={data} />} fileName="CV_Visual_Cameroon_ATS.pdf">
            {/* @ts-ignore */}
            {({ blob, url, loading, error }) =>
              <Button disabled={loading}>
                {loading ? 'Préparation du PDF...' : 'Télécharger PDF (ATS)'}
              </Button>
            }
          </PDFDownloadLink>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'cv' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('cv')}
        >
          CV Optimisé
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'letter' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('letter')}
        >
          Lettre de motivation
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'email' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Email
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'cv' && (
          <div className={styles.document}>
            <h2>Résumé</h2>
            <p>{data.cv_summary}</p>
            <h2>Expériences</h2>
            {data.cv_experiences.map((exp, idx) => (
              <div key={idx} className={styles.experience}>
                <div className={styles.expHeader}>
                  <strong>{exp.title}</strong>
                  <span>{exp.company} | {exp.dates}</span>
                </div>
                <ul>
                  {exp.bullet_points.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'letter' && (
          <div className={styles.document}>
            <pre className={styles.preText}>{data.cover_letter}</pre>
          </div>
        )}

        {activeTab === 'email' && (
          <div className={styles.document}>
             <pre className={styles.preText}>{data.email_text}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
