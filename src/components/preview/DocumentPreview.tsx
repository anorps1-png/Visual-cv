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
  personal_info?: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  cv_experiences: Array<{
    title: string;
    company: string;
    dates: string;
    bullet_points: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    dates: string;
    description?: string;
  }>;
  languages?: string[];
  cover_letter: string;
  email_text: string;
}

interface DocumentPreviewProps {
  data: GeneratedData;
  photoUrl?: string | null;
  onReset: () => void;
}

export function DocumentPreview({ data, photoUrl, onReset }: DocumentPreviewProps) {
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
          <PDFDownloadLink document={<ATSPdfDocument data={data} photoUrl={photoUrl} />} fileName="CV_Optimise_Visual_Cameroon.pdf">
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
            <div className={styles.cvLayout}>
              {/* Sidebar */}
              <div className={styles.cvSidebar}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo de profil" className={styles.previewPhoto} />
                ) : null}
                
                <div className={styles.cvSection}>
                  <h3>Contact</h3>
                  {data.personal_info?.phone ? <p className={styles.sidebarItem}>📞 {data.personal_info.phone}</p> : null}
                  {data.personal_info?.email ? <p className={styles.sidebarItem}>✉️ {data.personal_info.email}</p> : null}
                  {data.personal_info?.location ? <p className={styles.sidebarItem}>📍 {data.personal_info.location}</p> : null}
                  {data.personal_info?.linkedin ? <p className={styles.sidebarItem}>🔗 {data.personal_info.linkedin}</p> : null}
                  {data.personal_info?.website ? <p className={styles.sidebarItem}>🌐 {data.personal_info.website}</p> : null}
                </div>

                {data.keywords_matched && data.keywords_matched.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Compétences</h3>
                    <div className={styles.badgeList}>
                      {data.keywords_matched.map((skill: string, i: number) => (
                        <span key={i} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {data.languages && data.languages.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Langues</h3>
                    <ul style={{ paddingLeft: '1.2rem' }}>
                      {data.languages.map((lang: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lang}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {/* Main Column */}
              <div className={styles.cvMain}>
                <div className={styles.cvHeader}>
                  <h1>{data.personal_info?.name || 'Curriculum Vitae'}</h1>
                  {data.personal_info?.title ? <h2>{data.personal_info.title}</h2> : null}
                </div>

                {data.cv_summary ? (
                  <div className={styles.cvSection}>
                    <h3>Profil Professionnel</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>{data.cv_summary}</p>
                  </div>
                ) : null}

                {data.cv_experiences && data.cv_experiences.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Expérience Professionnelle</h3>
                    {data.cv_experiences.map((exp, idx) => (
                      <div key={idx} className={styles.experience}>
                        <div className={styles.expHeader}>
                          <strong>{exp.title}</strong>
                          <span>{exp.company} | {exp.dates}</span>
                        </div>
                        <ul className={styles.bullets}>
                          {exp.bullet_points.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}

                {data.education && data.education.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Éducation & Formations</h3>
                    {data.education.map((edu, idx) => (
                      <div key={idx} className={styles.education}>
                        <div className={styles.expHeader}>
                          <strong>{edu.degree}</strong>
                          <span>{edu.institution} | {edu.dates}</span>
                        </div>
                        {edu.description ? <p className={styles.eduDesc}>{edu.description}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
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

