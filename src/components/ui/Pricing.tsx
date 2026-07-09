'use client';

import React, { useState } from 'react';
import styles from './Pricing.module.css';
import { Button } from './Button';

interface PricingProps {
  currentPlan?: string;
  onSelectPlan?: (plan: string) => void;
}

export function Pricing({ currentPlan = 'Gratuit', onSelectPlan }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [simulatedPlan, setSimulatedPlan] = useState<string | null>(null);

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
      cta: 'Plan Actuel',
      popular: false,
    },
    {
      name: 'Étudiant',
      price: billingCycle === 'monthly' ? 2500 : 2000,
      description: 'L\'offre idéale pour les étudiants camerounais à la recherche de stages.',
      features: [
        '5 générations de CV par mois',
        'Modèles de CV optimisés ATS',
        'Génération automatique de Lettre de Motivation',
        'Signature numérique intégrée',
        'Export au format PDF premium'
      ],
      cta: 'Choisir Étudiant',
      popular: true,
    },
    {
      name: 'Professionnel',
      price: billingCycle === 'monthly' ? 7500 : 6000,
      description: 'Pour les cadres et professionnels à la recherche de nouvelles opportunités.',
      features: [
        'Générations illimitées',
        'Génération d\'e-mail d\'accompagnement RH',
        'Signature numérique & Photo pro',
        'Téléchargement aux formats PDF & Word (.doc)',
        'Accès aux modèles de CV premium',
        'Support prioritaire 24/7 (WhatsApp & Mail)'
      ],
      cta: 'Passer au Plan Pro',
      popular: false,
    }
  ];

  const handleSubscribe = (planName: string) => {
    if (planName === 'Gratuit') return;
    
    // Simulate payment / checkout
    setSimulatedPlan(planName);
    if (onSelectPlan) {
      onSelectPlan(planName);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Des tarifs simples et transparents</h2>
        <p>Boostez votre recherche d'emploi au Cameroun avec nos outils premium.</p>
        
        <div className={styles.billingToggle}>
          <button 
            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Facturation mensuelle
          </button>
          <button 
            className={`${styles.toggleBtn} ${billingCycle === 'annual' ? styles.active : ''}`}
            onClick={() => setBillingCycle('annual')}
          >
            Facturation annuelle <span className={styles.saveBadge}>-20%</span>
          </button>
        </div>
      </div>

      {simulatedPlan && (
        <div className={styles.simulationBanner}>
          <span>
            🎉 <strong>Félicitations !</strong> Vous venez de souscrire au plan <strong>{simulatedPlan}</strong> ({billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}). Mode Premium activé (simulation).
          </span>
          <button className={styles.closeBanner} onClick={() => setSimulatedPlan(null)}>&times;</button>
        </div>
      )}

      <div className={styles.grid}>
        {plans.map((plan) => {
          const isActive = currentPlan === plan.name;
          return (
            <div key={plan.name} className={`${styles.card} ${plan.popular ? styles.popularCard : ''}`}>
              {plan.popular && <span className={styles.popularBadge}>Le Plus Choisi</span>}
              
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDesc}>{plan.description}</p>
              
              <div className={styles.priceContainer}>
                <span className={styles.priceValue}>
                  {plan.price.toLocaleString('fr-FR')}
                </span>
                <span className={styles.priceCurrency}> FCFA</span>
                <span className={styles.pricePeriod}>/mois</span>
              </div>

              {billingCycle === 'annual' && plan.price > 0 && (
                <div className={styles.annualPriceNote}>
                  Facturé {(plan.price * 12).toLocaleString('fr-FR')} FCFA par an
                </div>
              )}

              <Button 
                onClick={() => handleSubscribe(plan.name)}
                disabled={isActive}
                style={{ 
                  width: '100%', 
                  margin: '1.5rem 0', 
                  backgroundColor: isActive ? 'var(--secondary)' : (plan.popular ? 'var(--primary)' : 'transparent'),
                  color: isActive ? 'var(--text-muted)' : (plan.popular ? '#ffffff' : 'var(--primary)'),
                  border: isActive ? '1px solid var(--border)' : '2px solid var(--primary)',
                  boxShadow: plan.popular ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                {isActive ? 'Votre forfait' : plan.cta}
              </Button>

              <ul className={styles.featureList}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    <span className={styles.featureText}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={styles.faqSec}>
        <h3>Questions fréquentes</h3>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>Comment fonctionne le paiement ?</h4>
            <p>Nous acceptons les paiements via Mobile Money (Orange Money, MTN MoMo) ainsi que les cartes de crédit locales pour faciliter vos démarches.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Puis-je annuler mon abonnement ?</h4>
            <p>Oui, votre abonnement est sans engagement. Vous pouvez l'annuler à tout moment depuis les paramètres de votre compte.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
