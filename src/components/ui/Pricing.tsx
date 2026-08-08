'use client';

import React, { useState } from 'react';
import styles from './Pricing.module.css';
import { authFetch } from '@/lib/authFetch';

interface PricingProps {
  currentPlan?: string;
  onSelectPlan?: (plan: string) => void;
  onRequireAuth?: () => void;
}

export function Pricing({ currentPlan = 'Gratuit', onSelectPlan, onRequireAuth }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [simulatedPlan, setSimulatedPlan] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plans = [
    {
      name: 'Gratuit',
      price: 0,
      description: 'Pour découvrir la plateforme et tester les fonctionnalités de base.',
      features: [
        '1 génération de CV optimisé par mois',
        'Aperçu en temps réel',
        'Téléchargement au format PDF',
        'Support communautaire'
      ],
      cta: 'Plan actuel',
      popular: false,
    },
    {
      name: 'Étudiant',
      price: billingCycle === 'monthly' ? 2500 : 2000,
      description: 'L\'offre idéale pour les étudiants à la recherche de stages.',
      features: [
        '5 générations de CV par mois',
        'Modèles de CV optimisés ATS',
        'Génération automatique de lettre de motivation',
        'Signature numérique intégrée',
        'Export au format PDF premium'
      ],
      cta: 'Choisir Étudiant',
      popular: true,
    },
    {
      name: 'Professionnel',
      price: billingCycle === 'monthly' ? 7500 : 6000,
      description: 'Pour les cadres et professionnels en quête de nouvelles opportunités.',
      features: [
        'Générations illimitées',
        'Génération d\'e-mail d\'accompagnement RH',
        'Signature numérique & photo pro',
        'Téléchargement aux formats PDF & Word (.doc)',
        'Accès aux modèles de CV premium',
        'Support prioritaire 24/7 (WhatsApp & Mail)'
      ],
      cta: 'Passer au plan Pro',
      popular: false,
    }
  ];

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Gratuit') return;

    setErrorMsg(null);
    setPendingPlan(planName);
    try {
      const res = await authFetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName, cycle: billingCycle }),
      });

      if (res.status === 401) {
        onRequireAuth?.();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Impossible d'initier le paiement.");
        return;
      }

      // Paiement Mobile Money réel : redirection vers le PSP.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Confirmation immédiate (mode sandbox / mock).
      if (data.status === 'paid') {
        setSimulatedPlan(planName);
        onSelectPlan?.(planName);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setErrorMsg('Erreur réseau lors du paiement.');
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Des tarifs simples et transparents</h2>
        <p className="text-muted">Boostez votre recherche d’emploi avec nos outils premium.</p>

        <div className="seg" style={{ marginTop: 'var(--space-4)' }}>
          <label className="seg-opt">
            <input type="radio" name="billing" checked={billingCycle === 'monthly'} onChange={() => setBillingCycle('monthly')} />
            Mensuel
          </label>
          <label className="seg-opt">
            <input type="radio" name="billing" checked={billingCycle === 'annual'} onChange={() => setBillingCycle('annual')} />
            Annuel −20%
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className={`${styles.banner} ${styles.bannerError}`}>
          <span>{errorMsg}</span>
          <button className={styles.closeBanner} onClick={() => setErrorMsg(null)}>&times;</button>
        </div>
      )}

      {simulatedPlan && (
        <div className={styles.banner}>
          <span>
            <strong>Félicitations !</strong> Vous venez de souscrire au plan <strong>{simulatedPlan}</strong> ({billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}). Mode premium activé (simulation).
          </span>
          <button className={styles.closeBanner} onClick={() => setSimulatedPlan(null)}>&times;</button>
        </div>
      )}

      <div className={styles.grid}>
        {plans.map((plan) => {
          const isActive = currentPlan === plan.name;
          const ctaClass = isActive
            ? 'btn btn-secondary btn-block'
            : plan.popular
              ? 'btn btn-primary btn-block'
              : `btn btn-block ${styles.ctaOutline}`;
          return (
            <div key={plan.name} className={styles.col}>
              <div className={styles.tagRow}>
                {plan.popular && <span className="tag tag-accent">Le plus choisi</span>}
              </div>

              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDesc}>{plan.description}</p>

              <div className={styles.price}>
                <span className={styles.priceValue}>{plan.price.toLocaleString('fr-FR')}</span>
                <span className={styles.priceUnit}> FCFA/mois</span>
              </div>
              {billingCycle === 'annual' && plan.price > 0 && (
                <div className={styles.annualNote}>Facturé {(plan.price * 12).toLocaleString('fr-FR')} FCFA/an</div>
              )}

              <button
                className={ctaClass}
                onClick={() => handleSubscribe(plan.name)}
                disabled={isActive || pendingPlan !== null}
              >
                {isActive ? 'Votre forfait' : pendingPlan === plan.name ? '…' : plan.cta}
              </button>

              <div className="hr" />

              <ul className={styles.features}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <span className={styles.check}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
