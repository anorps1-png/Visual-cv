'use client';

import React, { useState } from 'react';
import styles from './CVBuilder.module.css';
import { Button } from './Button';

interface Experience {
  title: string;
  company: string;
  dates: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  dates: string;
}

interface CVBuilderProps {
  onComplete: (cvText: string) => void;
}

export function CVBuilder({ onComplete }: CVBuilderProps) {
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
  });

  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');

  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', dates: '', description: '' }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', dates: '' }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let rawText = `Nom: ${personalInfo.name}\n`;
    rawText += `Titre: ${personalInfo.title}\n`;
    rawText += `Email: ${personalInfo.email}\n`;
    rawText += `Téléphone: ${personalInfo.phone}\n`;
    rawText += `Localisation: ${personalInfo.location}\n\n`;

    rawText += `Résumé:\n${summary}\n\n`;

    rawText += `Expériences:\n`;
    experiences.forEach(exp => {
      rawText += `- ${exp.title} chez ${exp.company} (${exp.dates})\n  ${exp.description}\n`;
    });
    rawText += '\n';

    rawText += `Formations:\n`;
    education.forEach(edu => {
      rawText += `- ${edu.degree} - ${edu.institution} (${edu.dates})\n`;
    });
    rawText += '\n';

    rawText += `Compétences:\n${skills}\n\n`;
    rawText += `Langues:\n${languages}\n`;

    onComplete(rawText);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Créez votre CV de A à Z</h2>
      <form onSubmit={handleSubmit}>
        <h3 className={styles.sectionTitle}>Informations Personnelles</h3>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nom complet</label>
            <input 
              required
              className={styles.input} 
              value={personalInfo.name} 
              onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Titre ciblé</label>
            <input 
              required
              className={styles.input} 
              value={personalInfo.title} 
              onChange={e => setPersonalInfo({...personalInfo, title: e.target.value})} 
            />
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              required
              type="email"
              className={styles.input} 
              value={personalInfo.email} 
              onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Téléphone</label>
            <input 
              className={styles.input} 
              value={personalInfo.phone} 
              onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} 
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Localisation</label>
          <input 
            className={styles.input} 
            value={personalInfo.location} 
            onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})} 
          />
        </div>

        <h3 className={styles.sectionTitle}>Profil / Résumé</h3>
        <div className={styles.formGroup}>
          <textarea 
            className={styles.textarea} 
            rows={4} 
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Présentez-vous brièvement..."
          />
        </div>

        <h3 className={styles.sectionTitle}>Expériences Professionnelles</h3>
        {experiences.map((exp, index) => (
          <div key={index} className={styles.listGroup}>
            <button type="button" onClick={() => removeExperience(index)} className={styles.removeBtn}>Supprimer</button>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Titre du poste</label>
                <input 
                  className={styles.input} 
                  value={exp.title} 
                  onChange={e => updateExperience(index, 'title', e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Entreprise</label>
                <input 
                  className={styles.input} 
                  value={exp.company} 
                  onChange={e => updateExperience(index, 'company', e.target.value)} 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Dates (ex: Jan 2020 - Présent)</label>
              <input 
                className={styles.input} 
                value={exp.dates} 
                onChange={e => updateExperience(index, 'dates', e.target.value)} 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description & Réalisations</label>
              <textarea 
                className={styles.textarea} 
                rows={3} 
                value={exp.description} 
                onChange={e => updateExperience(index, 'description', e.target.value)} 
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addExperience} className={styles.addBtn}>+ Ajouter une expérience</button>

        <h3 className={styles.sectionTitle}>Formations</h3>
        {education.map((edu, index) => (
          <div key={index} className={styles.listGroup}>
            <button type="button" onClick={() => removeEducation(index)} className={styles.removeBtn}>Supprimer</button>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Diplôme</label>
                <input 
                  className={styles.input} 
                  value={edu.degree} 
                  onChange={e => updateEducation(index, 'degree', e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Établissement</label>
                <input 
                  className={styles.input} 
                  value={edu.institution} 
                  onChange={e => updateEducation(index, 'institution', e.target.value)} 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Dates</label>
              <input 
                className={styles.input} 
                value={edu.dates} 
                onChange={e => updateEducation(index, 'dates', e.target.value)} 
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addEducation} className={styles.addBtn}>+ Ajouter une formation</button>

        <h3 className={styles.sectionTitle}>Compétences & Langues</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Compétences (séparées par des virgules)</label>
          <textarea 
            className={styles.textarea} 
            rows={2} 
            value={skills} 
            onChange={e => setSkills(e.target.value)} 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Langues (séparées par des virgules)</label>
          <input 
            className={styles.input} 
            value={languages} 
            onChange={e => setLanguages(e.target.value)} 
          />
        </div>

        <Button type="submit" className={styles.submitBtn}>
          Terminer & Passer à l'étape suivante
        </Button>
      </form>
    </div>
  );
}
