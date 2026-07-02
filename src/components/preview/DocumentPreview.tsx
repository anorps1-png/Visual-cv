'use client';

import React, { useState } from 'react';
import styles from './DocumentPreview.module.css';
import { Button } from '../ui/Button';
import { ATSPdfDocument, CoverLetterPdfDocument } from './PDFDocument';

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
  hobbies?: string[];
  cover_letter: string;
  email_text: string;
  letter_metadata?: {
    date: string;
    recipient: string;
    company: string;
    subject: string;
  };
}

interface DocumentPreviewProps {
  data: GeneratedData;
  photoUrl?: string | null;
  onReset: () => void;
  onNewDocuments?: () => void;
  signatureUrl: string | null;
  setSignatureUrl: (url: string | null) => void;
}

export function DocumentPreview({ data, photoUrl, onReset, onNewDocuments, signatureUrl, setSignatureUrl }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter' | 'email'>('cv');
  const [cvData, setCvData] = useState<GeneratedData>({
    ...data,
    hobbies: data.hobbies || []
  });
  
  // États de chargement pour la génération des PDF
  const [isCvLoading, setIsCvLoading] = useState(false);
  const [isLetterLoading, setIsLetterLoading] = useState(false);

  const [senderText, setSenderText] = useState<string>(() => {
    const personal = cvData.personal_info;
    return [
      personal?.name || "",
      personal?.phone || "",
      personal?.email || "",
      personal?.location || ""
    ].filter(Boolean).join('\n');
  });

  const [recipientText, setRecipientText] = useState<string>(() => {
    const meta = data.letter_metadata;
    const dateLine = (() => {
      const today = new Date();
      const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
      return `Yaoundé, le ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    })();
    const recipientLine = meta?.recipient ? `À l'attention du\n${meta.recipient}` : "À l'attention du\nResponsable des Ressources Humaines";
    const companyLine = meta?.company ? `de ${meta.company}` : "de ECOBANK CAMEROUN SA";
    
    return `${dateLine}\n\n${recipientLine}\n${companyLine}`;
  });

  const [letterSubject, setLetterSubject] = useState<string>(
    data.letter_metadata?.subject || `Objet : Candidature au poste de ${cvData.personal_info?.title || 'Caissier'}`
  );
  
  const [signatoryName, setSignatoryName] = useState<string>(
    cvData.personal_info?.name || ""
  );

  // Convertir et compresser l'image de signature en PNG compact
  const handleSignatureUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 300;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Traitement d'image pour isoler le tracé et enlever le fond blanc/gris
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (brightness > 185) {
              data[i + 3] = 0; // Rendre transparent
            } else {
              data[i] = 15;
              data[i + 1] = 23;
              data[i + 2] = 42;
            }
          }
          ctx.putImageData(imgData, 0, 0);

          const compressedBase64 = canvas.toDataURL('image/png');
          setSignatureUrl(compressedBase64);
        } else {
          setSignatureUrl(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setSignatureUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Mettre à jour les infos personnelles
  const updatePersonalInfo = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personal_info: {
        ...(cvData.personal_info || { name: '', title: '', email: '', phone: '', location: '' }),
        [field]: value
      }
    });
  };

  // Mettre à jour une expérience
  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...cvData.cv_experiences];
    updated[index] = { ...updated[index], [field]: value };
    setCvData({ ...cvData, cv_experiences: updated });
  };

  // Mettre à jour un point d'une expérience
  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const updatedExps = [...cvData.cv_experiences];
    const updatedBullets = [...updatedExps[expIndex].bullet_points];
    updatedBullets[bulletIndex] = value;
    updatedExps[expIndex] = { ...updatedExps[expIndex], bullet_points: updatedBullets };
    setCvData({ ...cvData, cv_experiences: updatedExps });
  };

  // Mettre à jour une formation
  const updateEducation = (index: number, field: string, value: string) => {
    if (!cvData.education) return;
    const updated = [...cvData.education];
    updated[index] = { ...updated[index], [field]: value };
    setCvData({ ...cvData, education: updated });
  };

  // Mettre à jour une langue
  const updateLanguage = (index: number, value: string) => {
    if (!cvData.languages) return;
    const updated = [...cvData.languages];
    updated[index] = value;
    setCvData({ ...cvData, languages: updated });
  };

  // Mettre à jour un hobby
  const updateHobby = (index: number, value: string) => {
    if (!cvData.hobbies) return;
    const updated = [...cvData.hobbies];
    updated[index] = value;
    setCvData({ ...cvData, hobbies: updated });
  };

  // Enregistrer le CV PDF en demandant le dossier cible
  const saveCvPdf = async () => {
    setIsCvLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<ATSPdfDocument data={cvData} photoUrl={photoUrl} />).toBlob();
      
      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: 'CV_Optimise_Visual_Cameroon.pdf',
          types: [{
            description: 'Document PDF',
            accept: { 'application/pdf': ['.pdf'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CV_Optimise_Visual_Cameroon.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert("Erreur lors de la sauvegarde du CV PDF.");
      }
    } finally {
      setIsCvLoading(false);
    }
  };

  // Enregistrer la lettre de motivation PDF en demandant le dossier cible
  const saveLetterPdf = async () => {
    setIsLetterLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <CoverLetterPdfDocument 
          senderText={senderText}
          recipientText={recipientText}
          subject={letterSubject}
          bodyText={cvData.cover_letter}
          signatoryName={signatoryName}
          signatureUrl={signatureUrl} 
        />
      ).toBlob();
      
      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: 'Lettre_de_Motivation.pdf',
          types: [{
            description: 'Document PDF',
            accept: { 'application/pdf': ['.pdf'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Lettre_de_Motivation.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert("Erreur lors de la sauvegarde de la lettre PDF.");
      }
    } finally {
      setIsLetterLoading(false);
    }
  };

  // Télécharger la lettre de motivation au format Word (.doc)
  const downloadAsWord = async () => {
    const senderHtml = senderText.split('\n').map(line => `<div>${line}</div>`).join('');
    const recipientHtml = recipientText.split('\n').map(line => `<div>${line}</div>`).join('');
    
    const paragraphsHtml = cvData.cover_letter
      .split('\n\n')
      .map(p => {
        const text = p.trim();
        if (text.startsWith("Madame, Monsieur,") || text.startsWith("Monsieur, Madame,")) {
          const salutation = text.startsWith("Madame, Monsieur,") ? "Madame, Monsieur," : "Monsieur, Madame,";
          const rest = text.substring(salutation.length).trim();
          return `<div class="paragraph">${salutation}</div>${rest ? `<div class="paragraph">${rest}</div>` : ''}`;
        }
        return `<div class="paragraph">${text}</div>`;
      })
      .join('');

    const signatureHtml = signatureUrl 
      ? `<div style="text-align: right; margin-top: 30pt; float: right; width: 200px;">
           <img src="${signatureUrl}" style="max-width: 150px; max-height: 60px;" /><br/>
           <strong style="font-family: 'Times New Roman', serif; font-size: 11pt;">${signatoryName}</strong>
         </div>`
      : `<div style="text-align: right; margin-top: 30pt; float: right; width: 200px;">
           <strong style="font-family: 'Times New Roman', serif; font-size: 11pt;">${signatoryName}</strong>
         </div>`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Lettre de Motivation</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.55;
            margin: 1in;
            color: #000000;
          }
          .header-table {
            width: 100%;
            margin-bottom: 30pt;
            border-collapse: collapse;
          }
          .sender-col {
            width: 45%;
            text-align: left;
            vertical-align: top;
            font-size: 10pt;
          }
          .recipient-col {
            width: 45%;
            text-align: right;
            vertical-align: top;
            font-size: 10pt;
          }
          .recipient-block {
            display: inline-block;
            text-align: left;
          }
          .subject {
            font-weight: bold;
            margin-top: 20pt;
            margin-bottom: 20pt;
            font-size: 11pt;
          }
          .paragraph {
            text-align: justify;
            margin-bottom: 16pt;
            font-size: 11pt;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="sender-col">
              ${senderHtml}
            </td>
            <td style="width: 10%;"></td>
            <td class="recipient-col">
              <div class="recipient-block">
                ${recipientHtml}
              </div>
            </td>
          </tr>
        </table>
        
        <div class="subject">${letterSubject}</div>
        
        <div>
          ${paragraphsHtml}
        </div>
        
        <table style="width: 100%; margin-top: 20pt; border-collapse: collapse;">
          <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%; text-align: right; vertical-align: top;">
              ${signatureHtml}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    
    try {
      if ('showSaveFilePicker' in window) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: 'Lettre_de_Motivation.doc',
          types: [{
            description: 'Document Word',
            accept: { 'application/msword': ['.doc'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Lettre_de_Motivation.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert("Erreur lors de la sauvegarde de la lettre Word.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreText}>{cvData.score}%</span>
          </div>
          <div>
            <h3>Compatibilité</h3>
            <p className={styles.keywords}>Mots-clés trouvés : {cvData.keywords_matched.join(', ')}</p>
          </div>
        </div>
        <div className={styles.actions}>
          {onNewDocuments && (
            <Button onClick={onNewDocuments}>
              Générer de nouveaux documents
            </Button>
          )}
          <Button variant="outline" onClick={onReset}>Recommencer</Button>
          
          {activeTab === 'cv' && (
            <Button disabled={isCvLoading} onClick={saveCvPdf}>
              {isCvLoading ? 'Préparation...' : 'Télécharger CV (PDF)'}
            </Button>
          )}

          {activeTab === 'letter' && (
            <>
              <Button disabled={isLetterLoading} onClick={saveLetterPdf}>
                {isLetterLoading ? 'Préparation...' : 'Télécharger Lettre (PDF)'}
              </Button>
              <Button variant="outline" onClick={downloadAsWord}>
                Télécharger Lettre (Word)
              </Button>
            </>
          )}
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
                  <div className={styles.sidebarEditGroup}>
                    <label>Tél :</label>
                    <input 
                      type="text" 
                      value={cvData.personal_info?.phone || ''} 
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)} 
                      className={styles.sidebarInput} 
                    />
                  </div>
                  <div className={styles.sidebarEditGroup}>
                    <label>Email :</label>
                    <input 
                      type="text" 
                      value={cvData.personal_info?.email || ''} 
                      onChange={(e) => updatePersonalInfo('email', e.target.value)} 
                      className={styles.sidebarInput} 
                    />
                  </div>
                  <div className={styles.sidebarEditGroup}>
                    <label>Lieu :</label>
                    <input 
                      type="text" 
                      value={cvData.personal_info?.location || ''} 
                      onChange={(e) => updatePersonalInfo('location', e.target.value)} 
                      className={styles.sidebarInput} 
                    />
                  </div>
                  {cvData.personal_info?.linkedin !== undefined && (
                    <div className={styles.sidebarEditGroup}>
                      <label>LinkedIn :</label>
                      <input 
                        type="text" 
                        value={cvData.personal_info.linkedin} 
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} 
                        className={styles.sidebarInput} 
                      />
                    </div>
                  )}
                  {cvData.personal_info?.website !== undefined && (
                    <div className={styles.sidebarEditGroup}>
                      <label>Site :</label>
                      <input 
                        type="text" 
                        value={cvData.personal_info.website} 
                        onChange={(e) => updatePersonalInfo('website', e.target.value)} 
                        className={styles.sidebarInput} 
                      />
                    </div>
                  )}
                </div>

                <div className={styles.cvSection}>
                  <h3>Compétences</h3>
                  <textarea 
                    value={cvData.keywords_matched.join(', ')} 
                    onChange={(e) => setCvData({ ...cvData, keywords_matched: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                    className={styles.sidebarTextarea} 
                    rows={4}
                    placeholder="Compétences séparées par des virgules"
                  />
                </div>

                {cvData.languages && cvData.languages.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Langues</h3>
                    {cvData.languages.map((lang: string, i: number) => (
                      <input 
                        key={i}
                        type="text" 
                        value={lang} 
                        onChange={(e) => updateLanguage(i, e.target.value)} 
                        className={styles.sidebarListItemInput} 
                      />
                    ))}
                  </div>
                ) : null}

                {cvData.hobbies && cvData.hobbies.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Hobbies</h3>
                    {cvData.hobbies.map((hobby: string, i: number) => (
                      <input 
                        key={i}
                        type="text" 
                        value={hobby} 
                        onChange={(e) => updateHobby(i, e.target.value)} 
                        className={styles.sidebarListItemInput} 
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Main Column */}
              <div className={styles.cvMain}>
                <div className={styles.cvHeader}>
                  <input 
                    type="text" 
                    value={cvData.personal_info?.name || ''} 
                    onChange={(e) => updatePersonalInfo('name', e.target.value)} 
                    className={styles.nameInput} 
                    placeholder="Votre Nom"
                  />
                  <input 
                    type="text" 
                    value={cvData.personal_info?.title || ''} 
                    onChange={(e) => updatePersonalInfo('title', e.target.value)} 
                    className={styles.titleInput} 
                    placeholder="Titre ciblé"
                  />
                </div>

                <div className={styles.cvSection}>
                  <h3>Profil Professionnel</h3>
                  <textarea 
                    value={cvData.cv_summary || ''} 
                    onChange={(e) => setCvData({ ...cvData, cv_summary: e.target.value })} 
                    className={styles.summaryTextarea}
                    rows={4}
                  />
                </div>

                {cvData.cv_experiences && cvData.cv_experiences.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Expérience Professionnelle</h3>
                    {cvData.cv_experiences.map((exp, idx) => (
                      <div key={idx} className={styles.experience}>
                        <div className={styles.expHeader}>
                          <input 
                            type="text" 
                            value={exp.title} 
                            onChange={(e) => updateExperience(idx, 'title', e.target.value)} 
                            className={styles.jobTitleInput}
                          />
                          <div className={styles.metaInputs}>
                            <input 
                              type="text" 
                              value={exp.company} 
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)} 
                              className={styles.companyInput}
                            />
                            <input 
                              type="text" 
                              value={exp.dates} 
                              onChange={(e) => updateExperience(idx, 'dates', e.target.value)} 
                              className={styles.datesInput}
                            />
                          </div>
                        </div>
                        <div className={styles.bulletsList}>
                          {exp.bullet_points.map((bp, i) => (
                            <div key={i} className={styles.bulletItem}>
                              <span className={styles.bulletMarker}>•</span>
                              <textarea 
                                value={bp} 
                                onChange={(e) => updateExperienceBullet(idx, i, e.target.value)} 
                                className={styles.bulletTextarea}
                                rows={1}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {cvData.education && cvData.education.length > 0 ? (
                  <div className={styles.cvSection}>
                    <h3>Formation</h3>
                    {cvData.education.map((edu, idx) => (
                      <div key={idx} className={styles.education}>
                        <div className={styles.expHeader}>
                          <input 
                            type="text" 
                            value={edu.degree} 
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)} 
                            className={styles.jobTitleInput}
                          />
                          <div className={styles.metaInputs}>
                            <input 
                              type="text" 
                              value={edu.institution} 
                              onChange={(e) => updateEducation(idx, 'institution', e.target.value)} 
                              className={styles.companyInput}
                            />
                            <input 
                              type="text" 
                              value={edu.dates} 
                              onChange={(e) => updateEducation(idx, 'dates', e.target.value)} 
                              className={styles.datesInput}
                            />
                          </div>
                        </div>
                        {edu.description !== undefined && (
                          <input 
                            type="text" 
                            value={edu.description} 
                            onChange={(e) => updateEducation(idx, 'description', e.target.value)} 
                            className={styles.eduDescInput}
                          />
                        )}
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
            <div className={styles.letterPreviewLayout}>
              {/* En-tête (Expéditeur à gauche, Destinataire & Date à droite) */}
              <div className={styles.letterHeaderRow}>
                {/* Gauche : Expéditeur */}
                <div className={styles.letterSenderColumn}>
                  <textarea
                    value={senderText}
                    onChange={(e) => setSenderText(e.target.value)}
                    className={styles.letterSenderTextarea}
                    rows={4}
                    placeholder="Coordonnées de l'expéditeur"
                  />
                </div>

                {/* Droite : Destinataire & Date */}
                <div className={styles.letterRecipientColumn}>
                  <textarea
                    value={recipientText}
                    onChange={(e) => setRecipientText(e.target.value)}
                    className={styles.letterRecipientTextarea}
                    rows={6}
                    placeholder="Lieu, date et attention"
                  />
                </div>
              </div>

              {/* Ligne d'Objet (gras) */}
              <div className={styles.letterSubjectRow}>
                <input
                  type="text"
                  value={letterSubject}
                  onChange={(e) => setLetterSubject(e.target.value)}
                  className={styles.letterSubjectInput}
                  placeholder="Objet de la lettre"
                />
              </div>

              {/* Corps de la lettre */}
              <textarea
                value={cvData.cover_letter}
                onChange={(e) => setCvData({ ...cvData, cover_letter: e.target.value })}
                className={styles.letterTextarea}
                rows={22}
                placeholder="Madame, Monsieur..."
              />
              
              {/* Signature alignée à droite */}
              <div className={styles.letterSignatureBlock}>
                {signatureUrl ? (
                  <div className={styles.signaturePreviewContainer}>
                    <img src={signatureUrl} alt="Signature manuscrite" className={styles.signatureImage} />
                    <button 
                      type="button" 
                      onClick={() => setSignatureUrl(null)} 
                      className={styles.removeSignatureBtn}
                    >
                      Supprimer la signature
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadBtnContainer}>
                    <label className={styles.signatureUploadLabel}>
                      🖋️ Charger une signature (Image PNG / JPG)
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSignatureUpload(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
                <input 
                  type="text" 
                  value={signatoryName} 
                  onChange={(e) => setSignatoryName(e.target.value)} 
                  className={styles.signatoryNameInput}
                  placeholder="Votre Nom"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className={styles.document}>
            <textarea
              value={cvData.email_text}
              onChange={(e) => setCvData({ ...cvData, email_text: e.target.value })}
              className={styles.emailTextarea}
              rows={15}
            />
          </div>
        )}
      </div>
    </div>
  );
}
