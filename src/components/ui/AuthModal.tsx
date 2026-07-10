'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './AuthModal.module.css';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '',
          },
        });
        if (error) throw error;
        
        // Supabase sign up might send email confirmation, or auto-login
        if (data.session) {
          onSuccess(data.session);
          onClose();
        } else {
          setSuccessMsg('Compte créé avec succès ! Veuillez vérifier vos e-mails pour valider votre compte.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          onSuccess(data.session);
          onClose();
        }
      }
    } catch (err: any) {
      console.warn("Auth Error:", err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <h2 className={styles.title}>
          {isSignUp ? 'Créer un compte SaaS' : 'Connexion à votre espace'}
        </h2>
        <p className={styles.subtitle}>
          {isSignUp 
            ? 'Accédez à l\'historique de vos candidatures et à des crédits exclusifs.' 
            : 'Retrouvez tous vos CVs optimisés et vos lettres de motivation.'}
        </p>

        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
        {successMsg && <div className={styles.success}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="auth-email">Adresse e-mail</label>
            <input
              id="auth-email"
              type="email"
              placeholder="ex: jean.dupont@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="auth-password">Mot de passe</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            {isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </Button>
        </form>

        <div className={styles.switchMode}>
          {isSignUp ? (
            <span>
              Déjà un compte ?{' '}
              <button className={styles.linkBtn} onClick={() => { setIsSignUp(false); setErrorMsg(null); }}>
                Se connecter
              </button>
            </span>
          ) : (
            <span>
              Pas encore de compte ?{' '}
              <button className={styles.linkBtn} onClick={() => { setIsSignUp(true); setErrorMsg(null); }}>
                Créer un compte
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
