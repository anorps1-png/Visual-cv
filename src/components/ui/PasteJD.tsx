'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import styles from './PasteJD.module.css';

interface PasteJDProps {
  onSubmit: (text: string) => void;
}

export function PasteJD({ onSubmit }: PasteJDProps) {
  const [text, setText] = useState('');

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
      <textarea
        id="jd"
        className={styles.textarea}
        placeholder="Missions, Profil recherché, Compétences requises..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />
      <div className={styles.actions}>
        <span className={styles.hint}>
          {text.length} caractères (minimum conseillé : 50)
        </span>
        <Button 
          type="submit" 
          disabled={text.trim().length < 50}
        >
          Analyser l'offre
        </Button>
      </div>
    </form>
  );
}
