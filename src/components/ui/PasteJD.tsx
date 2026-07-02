'use client';

import React, { useState } from 'react';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import styles from './PasteJD.module.css';

interface PasteJDProps {
  onSubmit: (text: string) => void;
}

export function PasteJD({ onSubmit }: PasteJDProps) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/jd/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setText(data.text);
      } else {
        setError(data.error || "Erreur lors de l'analyse du fichier.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'analyse. Veuillez vérifier votre connexion.");
    } finally {
      setIsParsing(false);
      // Réinitialiser la valeur pour permettre de ré-uploader le même fichier si besoin
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 50) {
      onSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="jd" className={styles.label}>
        Collez la description du poste (Job Description)
      </label>

      <div className={styles.importSection}>
        <div className={styles.importHeader}>
          <span className={styles.importTitle}>
            Importer depuis un fichier (PDF ou Image d'offre) :
          </span>
          <div className={styles.fileInputWrapper}>
            {isParsing ? (
              <div className={styles.loadingWrapper}>
                <Loader2 className={styles.spinner} size={18} />
                <span>Extraction du texte en cours...</span>
              </div>
            ) : (
              <label className={styles.fileLabel}>
                <Upload size={16} />
                <span>Sélectionner un fichier</span>
                <input 
                  type="file" 
                  accept="application/pdf, image/*" 
                  onChange={handleFileChange} 
                  className={styles.fileInput} 
                />
              </label>
            )}
          </div>
        </div>
        {error && (
          <div className={styles.errorText}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <textarea
        id="jd"
        className={styles.textarea}
        placeholder="Missions, Profil recherché, Compétences requises..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        disabled={isParsing}
      />
      <div className={styles.actions}>
        <span className={styles.hint}>
          {text.length} caractères (minimum conseillé : 50)
        </span>
        <Button 
          type="submit" 
          disabled={text.trim().length < 50 || isParsing}
        >
          Analyser l'offre
        </Button>
      </div>
    </form>
  );
}

