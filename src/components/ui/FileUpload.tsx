'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (isLoading) return;
    
    if (rejectedFiles.length > 0) {
      setError('Veuillez uploader uniquement un fichier PDF ou DOCX (pas d\'image).');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      setError(null);
      setSelectedFile(acceptedFiles[0]);
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, isLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className={styles.container}>
      <div 
        {...getRootProps()} 
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${selectedFile ? styles.success : ''}`}
        style={isLoading ? { pointerEvents: 'none', opacity: 0.7 } : undefined}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div className={styles.content}>
            <Loader2 className={styles.spinner} size={48} />
            <p className={styles.text}>Analyse du CV en cours...</p>
            <p className={styles.subtext}>Veuillez patienter pendant l'extraction du texte de votre PDF.</p>
          </div>
        ) : selectedFile ? (
          <div className={styles.content}>
            <CheckCircle className={styles.iconSuccess} size={48} />
            <p className={styles.text}>Fichier sélectionné :</p>
            <p className={styles.filename}>{selectedFile.name}</p>
          </div>
        ) : (
          <div className={styles.content}>
            <UploadCloud className={styles.icon} size={48} />
            <p className={styles.text}>
              {isDragActive 
                ? "Déposez votre CV ici..." 
                : "Glissez et déposez votre CV maître ici, ou cliquez pour sélectionner"}
            </p>
            <p className={styles.subtext}>Formats acceptés : PDF, DOCX (Texte uniquement, pas d'images scannées)</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

