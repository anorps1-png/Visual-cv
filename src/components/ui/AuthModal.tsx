'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './AuthModal.module.css';

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
          setSuccessMsg('Compte créé ! Vérifiez vos e-mails pour valider votre compte.');
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
      console.warn('Auth Error:', err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = (signup: boolean) => {
    setIsSignUp(signup);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">{isSignUp ? 'Inscription' : 'Connexion'}</div>

        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          <label className="seg-opt">
            <input type="radio" name="auth-mode" checked={!isSignUp} onChange={() => setMode(false)} />
            Connexion
          </label>
          <label className="seg-opt">
            <input type="radio" name="auth-mode" checked={isSignUp} onChange={() => setMode(true)} />
            Inscription
          </label>
        </div>

        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
        {successMsg && <div className={styles.success}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="field">
            <label htmlFor="auth-email">Adresse e-mail</label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="ex : jean.dupont@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password">Mot de passe</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '…' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
