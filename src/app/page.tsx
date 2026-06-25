'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { FileUpload } from '@/components/ui/FileUpload';
import { PasteJD } from '@/components/ui/PasteJD';
import { Button } from '@/components/ui/Button';
import { DocumentPreview } from '@/components/preview/DocumentPreview';

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setCvFile(file);
    setIsParsing(true);
    setErrorMsg(null);
    
    // Upload the file to our /api/cv/parse endpoint
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/cv/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setCvText(data.text);
        setStep(2);
      } else {
        setErrorMsg(data.error || 'Erreur lors du parsing du PDF');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Erreur lors du parsing du PDF. Veuillez vérifier votre connexion.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleJDSubmit = (text: string) => {
    setJobDescription(text);
    setStep(3);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobDescription })
      });
      const resData = await res.json();
      if (resData.success) {
        setGeneratedData(resData.data);
        setStep(4);
      } else {
        setErrorMsg(resData.error || 'Erreur de génération IA');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur de génération IA. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Visual CV Cameroon</h1>
        <p>Générez un CV optimisé ATS et une lettre de motivation en un clic.</p>
      </header>
      
      {step < 4 && (
        <div className={styles.stepper}>
          <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>1. CV Maître</div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>2. Offre</div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ''}`}>3. Génération</div>
        </div>
      )}

      <section className={styles.contentArea}>
        {errorMsg && (
          <div className={styles.errorBanner}>
            <span>{errorMsg}</span>
            <button className={styles.closeError} onClick={() => setErrorMsg(null)}>×</button>
          </div>
        )}

        {step === 1 && (
          <div className={styles.card}>
            <h2>Importez votre CV actuel</h2>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isParsing} />
          </div>
        )}

        {step === 2 && (
          <div className={styles.card}>
            <h2>L'offre d'emploi cible</h2>
            <PasteJD onSubmit={handleJDSubmit} />
            <button 
              className={styles.textButton} 
              onClick={() => setStep(1)}
            >
              ← Retour au CV
            </button>
          </div>
        )}

        {step === 3 && (
          <div className={styles.card}>
            <h2>Prêt à générer !</h2>
            <p>Nous allons comparer votre CV <strong>{cvFile?.name}</strong> avec l'offre sélectionnée.</p>
            <div className={styles.generateBox}>
              <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating}
                style={{ width: '100%', padding: '1rem', fontSize: '1.25rem' }}
              >
                Générer mon dossier de candidature
              </Button>
            </div>
            <button 
              className={styles.textButton} 
              onClick={() => setStep(2)}
              disabled={isGenerating}
            >
              ← Modifier l'offre
            </button>
          </div>
        )}

        {step === 4 && generatedData && (
          <DocumentPreview 
            data={generatedData} 
            onReset={() => {
              setStep(1);
              setCvFile(null);
              setCvText('');
              setJobDescription('');
              setGeneratedData(null);
            }} 
          />
        )}
      </section>
    </main>
  );
}
