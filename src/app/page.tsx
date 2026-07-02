'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { FileUpload } from '@/components/ui/FileUpload';
import { PasteJD } from '@/components/ui/PasteJD';
import { Button } from '@/components/ui/Button';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { SearchJD } from '@/components/ui/SearchJD';

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modelProvider, setModelProvider] = useState<'openai' | 'deepseek'>('openai');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [jdMode, setJdMode] = useState<'search' | 'paste'>('search');

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
        body: JSON.stringify({ cvText, jobDescription, provider: modelProvider })
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

      <section 
        className={styles.contentArea} 
        style={{ maxWidth: step === 2 && jdMode === 'search' ? '850px' : '600px', width: '100%', transition: 'max-width 0.3s ease' }}
      >
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

            <div className={styles.photoUploadBox}>
              <label className={styles.photoLabel}>Photo de profil (Optionnelle) :</label>
              <div className={styles.photoUploadControls}>
                {photoUrl ? (
                  <div className={styles.photoPreviewWrapper}>
                    <img src={photoUrl} alt="Aperçu" className={styles.photoPreview} />
                    <button 
                      type="button" 
                      onClick={() => setPhotoUrl(null)} 
                      className={styles.photoRemoveBtn}
                    >
                      Supprimer la photo
                    </button>
                  </div>
                ) : (
                  <div className={styles.photoInputWrapper}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={styles.photoInput}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.card}>
            <h2>L'offre d'emploi cible</h2>
            
            <div className={styles.tabHeader}>
              <button 
                type="button"
                className={`${styles.tabBtn} ${jdMode === 'search' ? styles.activeTabBtn : ''}`}
                onClick={() => setJdMode('search')}
              >
                Rechercher une offre réelle
              </button>
              <button 
                type="button"
                className={`${styles.tabBtn} ${jdMode === 'paste' ? styles.activeTabBtn : ''}`}
                onClick={() => setJdMode('paste')}
              >
                Coller une offre manuellement
              </button>
            </div>

            <div className={styles.tabContent}>
              {jdMode === 'search' ? (
                <SearchJD onSelect={handleJDSubmit} />
              ) : (
                <PasteJD onSubmit={handleJDSubmit} />
              )}
            </div>

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
            
            <div className={styles.selectorGroup}>
              <label htmlFor="llm-select" className={styles.selectorLabel}>
                Modèle d'IA à utiliser :
              </label>
              <select
                id="llm-select"
                value={modelProvider}
                onChange={(e) => setModelProvider(e.target.value as 'openai' | 'deepseek')}
                className={styles.selectInput}
                disabled={isGenerating}
              >
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="deepseek">DeepSeek (DeepSeek Chat)</option>
              </select>
            </div>

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
            photoUrl={photoUrl}
            signatureUrl={signatureUrl}
            setSignatureUrl={setSignatureUrl}
            onReset={() => {
              setStep(1);
              setCvFile(null);
              setCvText('');
              setJobDescription('');
              setGeneratedData(null);
              setPhotoUrl(null);
              setSignatureUrl(null);
            }} 
            onNewDocuments={() => {
              setStep(2);
              setJobDescription('');
              setGeneratedData(null);
            }}
          />
        )}
      </section>
    </main>
  );
}
