'use client';

import React, { useState } from 'react';
import styles from './Landing.module.css';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Layers, CheckCircle, RefreshCw } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onViewPricing: () => void;
}

const FAQS = [
  {
    q: "Est-ce que Virtual CV est gratuit ?",
    a: "Oui ! Notre plan de base gratuit permet de générer des CV optimisés ATS et des lettres de motivation sans frais. Les plans Étudiant et Professionnel, très abordables en FCFA, débloquent l'analyse illimitée et des modèles premium."
  },
  {
    q: "Comment fonctionne l'optimisation ATS ?",
    a: "Les recruteurs utilisent des logiciels (ATS) pour filtrer les candidatures par mots-clés. Notre IA analyse l'offre et adapte votre CV pour inclure les termes techniques indispensables."
  },
  {
    q: "Mes données personnelles sont-elles sécurisées ?",
    a: "Absolument. Vos données sont stockées de façon sécurisée, jamais revendues, et vous pouvez les supprimer à tout moment."
  },
  {
    q: "Puis-je adapter mon CV à plusieurs offres ?",
    a: "C'est la force de l'outil : clonez votre CV maître et ajustez-le pour chaque offre en quelques secondes."
  },
  {
    q: "Qu'est-ce qui est inclus dans le kit généré ?",
    a: "Un CV reformaté, une lettre de motivation personnalisée et un e-mail d'accompagnement prêt à l'envoi."
  }
];

const ATS_DEFAULT_TEXT = "J'ai géré les factures et fait de la saisie de l'entreprise.";

export const Landing: React.FC<LandingProps> = ({ onStart, onViewPricing }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // ATS Simulator State
  const [atsJobTitle, setAtsJobTitle] = useState<string>('Chef Comptable');
  const [atsText, setAtsText] = useState<string>(ATS_DEFAULT_TEXT);
  const [atsState, setAtsState] = useState<'idle' | 'loading' | 'optimized'>('idle');
  const [atsScore, setAtsScore] = useState<number>(35);
  const [atsOptimizedText, setAtsOptimizedText] = useState<string>('');

  const handleSimulateOptimize = () => {
    setAtsState('loading');
    setTimeout(() => {
      const title = atsJobTitle.trim() || 'Ce poste';
      const swaps: [RegExp, string][] = [
        [/\bj'ai géré\b/gi, "j'ai piloté"],
        [/\bgéré\b/gi, 'piloté'],
        [/\bje me suis occupé(e)?\b/gi, "j'ai piloté"],
        [/\boccupé(e)?\b/gi, 'piloté'],
        [/\bj'ai fait\b/gi, "j'ai assuré"],
        [/\bfait\b/gi, 'assuré'],
        [/\bje vendais\b/gi, 'je négociais'],
        [/\bvendais\b/gi, 'négociais'],
        [/\btravaillé\b/gi, 'dirigé'],
        [/\baidé\b/gi, 'coordonné']
      ];
      let base = (atsText || '').trim().replace(/\.$/, '');
      swaps.forEach(([re, rep]) => {
        base = base.replace(re, rep);
      });
      const optimized = `${title} : ${base}, avec un impact mesurable et un vocabulaire aligné sur les attentes des recruteurs.`;
      setAtsState('optimized');
      setAtsScore(96);
      setAtsOptimizedText(optimized);
    }, 900);
  };

  const handleSimulateReset = () => {
    setAtsState('idle');
    setAtsScore(35);
    setAtsOptimizedText('');
    setAtsText(ATS_DEFAULT_TEXT);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.container}>
      {/* 1 — Hero */}
      <section className={styles.section}>
        <div className={`${styles.inner} ${styles.hero}`}>
          <div className={styles.heroContent}>
            <span className="tag tag-accent" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>
              PROPULSÉ PAR L'IA
            </span>
            <h1 className={styles.heroTitle}>
              Un CV qui passe les filtres. <span className={styles.accentText}>Écrit en quelques minutes.</span>
            </h1>
            <p className={styles.heroLede}>
              Le générateur de CV pensé pour décrocher l'entretien : optimisation ATS, lettre de motivation et e-mail d'accompagnement en un clic.
            </p>
            <div className={styles.heroActions}>
              <button
                className="btn btn-primary"
                onClick={onStart}
                style={{ padding: 'var(--space-3) var(--space-6)', fontSize: '16px' }}
              >
                Créer mon CV gratuitement
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary"
                onClick={onViewPricing}
                style={{ padding: 'var(--space-3) var(--space-6)', fontSize: '16px' }}
              >
                Découvrir les offres
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mockup}>
              <span className={`tag tag-accent ${styles.mockupTag}`}>SCORE ATS : 98%</span>
              <div className={styles.mockupHead}>
                <div className={styles.mockupAvatar}>JC</div>
                <div className={styles.mockupHeadLines}>
                  <div className={styles.lineStrong} />
                  <div className={styles.lineShort} />
                </div>
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.line} style={{ width: '90%' }} />
                <div className={styles.line} style={{ width: '75%' }} />
                <div className={styles.line} style={{ width: '82%' }} />
                <div className={styles.line} style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Processus en 3 étapes */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-2)' }}>COMMENT ÇA MARCHE</h6>
          <h2 style={{ marginBottom: 'var(--space-6)' }}>Trois étapes, un dossier complet</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCell}>
              <h2 className={styles.stepNum}>01</h2>
              <h3 className={styles.stepTitle}>Importez votre CV</h3>
              <p className={styles.stepBody}>Téléversez votre CV actuel au format PDF. L'extraction des informations clés est instantanée.</p>
            </div>
            <div className={styles.stepCell}>
              <h2 className={styles.stepNum}>02</h2>
              <h3 className={styles.stepTitle}>Ciblez l'offre</h3>
              <p className={styles.stepBody}>Collez l'offre d'emploi ou recherchez-la directement. L'IA repère les mots-clés essentiels.</p>
            </div>
            <div className={styles.stepCell}>
              <h2 className={styles.stepNum}>03</h2>
              <h3 className={styles.stepTitle}>Générez votre kit</h3>
              <p className={styles.stepBody}>CV optimisé, lettre de motivation et e-mail d'accompagnement, prêts en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Démonstration ATS */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-1)' }}>DÉMONSTRATION</h6>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Testez l'optimiseur ATS</h2>
          <p style={{ maxWidth: '60ch', opacity: 0.75, marginBottom: 'var(--space-6)', textAlign: 'left' }}>
            Une phrase passive devient une réalisation chiffrée, adaptée aux recruteurs locaux.
          </p>

          <div className={styles.simPanel}>
            <div className={styles.simControls}>
              <div className="field">
                <label htmlFor="ats-job-title">Poste ciblé</label>
                <input
                  id="ats-job-title"
                  className="input"
                  value={atsJobTitle}
                  onChange={(e) => setAtsJobTitle(e.target.value)}
                  placeholder="ex : Chef Comptable"
                />
              </div>
              <div className="field">
                <label htmlFor="ats-exp-text">Votre expérience (CV actuel)</label>
                <textarea
                  id="ats-exp-text"
                  className="input"
                  value={atsText}
                  onChange={(e) => setAtsText(e.target.value)}
                  disabled={atsState === 'loading'}
                  rows={3}
                />
              </div>
              <div>
                {atsState === 'optimized' ? (
                  <button className="btn btn-secondary" onClick={handleSimulateReset}>
                    <RefreshCw size={16} />
                    Recommencer
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleSimulateOptimize}
                    disabled={atsState === 'loading'}
                  >
                    <Sparkles size={16} />
                    {atsState === 'loading' ? 'Optimisation en cours…' : 'Optimiser mon expérience'}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.simResults}>
              <div>
                <div className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>Score ATS</span>
                  <span className={styles.scoreValue}>{atsScore}%</span>
                </div>
                <div className={styles.scoreBarTrack}>
                  <div
                    className={styles.scoreBarFill}
                    style={{
                      width: `${atsScore}%`,
                      background: atsState === 'optimized' ? 'var(--color-accent)' : 'var(--color-neutral-500)'
                    }}
                  />
                </div>
              </div>

              <div className={styles.simText}>
                {atsState === 'idle' && (
                  <p style={{ opacity: 0.7, fontSize: '14px', margin: 0 }}>
                    Choisissez un poste et cliquez sur "Optimiser" pour voir l'IA réécrire votre expérience.
                  </p>
                )}
                {atsState === 'loading' && (
                  <p style={{ opacity: 0.7, fontSize: '14px', margin: 0 }}>
                    L'IA reformule votre expérience avec des termes d'action quantifiables…
                  </p>
                )}
                {atsState === 'optimized' && (
                  <div className={styles.simOptimizedBox}>
                    <h6 style={{ color: 'var(--color-accent-700)', marginBottom: '8px' }}>VERSION OPTIMISÉE</h6>
                    <p className={styles.simOptimized}>"{atsOptimizedText}"</p>
                    <span className="tag tag-accent" style={{ marginTop: 'var(--space-2)' }}>
                      Recommandé pour passer les filtres ATS
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Avant / Après */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-1)' }}>AVANT / APRÈS</h6>
          <h2 style={{ marginBottom: 'var(--space-6)' }}>Ce qui fait la différence</h2>
          <div className={styles.compareGrid}>
            <div className={`${styles.compareCol} ${styles.compareWeak}`}>
              <div className={styles.compareStatus}>CV CLASSIQUE — REJETÉ PAR L'ATS</div>
              <p className={styles.compareLabel}>Compétences</p>
              <p className={styles.compareText}>"Je maîtrise Word, Excel et j'ai un bon contact avec les clients."</p>
              <p className={styles.compareLabel}>Expérience</p>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Comptable — Kaelis Group</p>
              <p className={styles.compareText}>"J'ai fait la comptabilité générale, classé les factures et saisi les écritures."</p>
            </div>
            <div className={`${styles.compareCol} ${styles.compareStrong}`}>
              <div className={styles.compareStatus}>CV OPTIMISÉ — SÉLECTIONNÉ</div>
              <p className={styles.compareLabel}>Compétences clés</p>
              <p className={styles.compareText}>
                Comptabilité Générale &amp; Analytique • Analyse de Risques Budgétaires • Conformité Fiscale (DSF)
              </p>
              <p className={styles.compareLabel}>Expérience de leadership</p>
              <p className={styles.compareRoleTitle}>Chef du Département Financier &amp; Comptable — Kaelis Group</p>
              <p className={styles.compareText}>
                "Pilotage de la comptabilité. Réduction de 15% des anomalies de trésorerie et automatisation des rapprochements bancaires."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Fonctionnalités */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-1)' }}>FONCTIONNALITÉS</h6>
          <h2 style={{ marginBottom: 'var(--space-6)' }}>Conçu pour candidater efficacement</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCell}>
              <CheckCircle size={28} className={styles.featureIcon} />
              <div>
                <h3 className={styles.featureTitle}>Optimisation ATS intelligente</h3>
                <p className={styles.featureBody}>Les bons mots-clés, exigés par les recruteurs locaux et internationaux.</p>
              </div>
            </div>
            <div className={styles.featureCell}>
              <Layers size={28} className={styles.featureIcon} />
              <div>
                <h3 className={styles.featureTitle}>Multi-versions illimité</h3>
                <p className={styles.featureBody}>Un CV différent pour chaque offre, sans repartir de zéro.</p>
              </div>
            </div>
            <div className={styles.featureCell}>
              <Mail size={28} className={styles.featureIcon} />
              <div>
                <h3 className={styles.featureTitle}>Lettre &amp; e-mail d'accompagnement</h3>
                <p className={styles.featureBody}>Un texte professionnel et accrocheur, prêt à envoyer.</p>
              </div>
            </div>
            <div className={styles.featureCell}>
              <ShieldCheck size={28} className={styles.featureIcon} />
              <div>
                <h3 className={styles.featureTitle}>Confidentialité totale</h3>
                <p className={styles.featureBody}>Vos données, supprimables définitivement en un clic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — FAQ */}
      <section className={styles.faqSection} id="FAQ">
        <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-1)' }}>FAQ</h6>
        <h2 style={{ marginBottom: 'var(--space-6)' }}>Foire aux questions</h2>
        <div className={styles.faqList}>
          {FAQS.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaqIndex === index}
              >
                <span>{faq.q}</span>
                <span className={styles.faqToggle}>{openFaqIndex === index ? '−' : '+'}</span>
              </button>
              {openFaqIndex === index && (
                <p className={styles.faqAnswer}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7 — CTA bordeaux */}
      <section className={styles.ctaField}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Prêt à booster votre carrière ?</h2>
          <p className={styles.ctaLede}>
            Rejoignez des milliers de professionnels qui utilisent l'IA pour décrocher l'emploi de leurs rêves.
          </p>
          <button
            className={`btn ${styles.ctaBtn}`}
            onClick={onStart}
          >
            Créer mon CV gratuitement
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 8 — Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>VIRTUAL CV</div>
            <p className={styles.footerDesc}>
              La plateforme intelligente d'aide à la recherche d'emploi et de création de CV.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h4>PRODUIT</h4>
            <ul>
              <li><button onClick={onStart}>Générateur</button></li>
              <li><button onClick={onViewPricing}>Tarifs</button></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>LÉGAL</h4>
            <ul>
              <li><a href="#privacy">Confidentialité</a></li>
              <li><a href="#terms">Conditions</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>SUPPORT</h4>
            <ul>
              <li><a href="mailto:support@virtualcv.cm">support@virtualcv.cm</a></li>
            </ul>
          </div>
        </div>
        <div className={`${styles.inner} ${styles.footerBottom}`}>
          <span>© 2026 Virtual CV. Tous droits réservés.</span>
          <div className={styles.footerLinks}>
            <a href="#privacy">Confidentialité</a>
            <a href="#terms">Mentions légales</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
