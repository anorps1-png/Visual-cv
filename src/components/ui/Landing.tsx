import React, { useState } from 'react';
import styles from './Landing.module.css';
import { Sparkles, ArrowRight, ShieldCheck, MailOpen, Layers, CheckCircle, RefreshCw } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onViewPricing: () => void;
}

/** Renforce une phrase d'expérience : retire les tournures passives et
 *  capitalise, pour simuler la réécriture « orientée résultats » de l'IA. */
function strengthen(text: string): string {
  let t = text.trim().replace(/^j['’]ai\s+/i, '').replace(/^je\s+(me\s+suis\s+)?/i, '');
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const Landing: React.FC<LandingProps> = ({ onStart, onViewPricing }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulateur ATS
  const [atsJobTitle, setAtsJobTitle] = useState<string>('Directeur Administratif et Financier');
  const [atsText, setAtsText] = useState<string>("J'ai géré les factures et fait de la saisie au centre médical.");
  const [atsState, setAtsState] = useState<'idle' | 'loading' | 'optimized'>('idle');
  const [atsScore, setAtsScore] = useState<number>(35);
  const [atsOptimizedText, setAtsOptimizedText] = useState<string>('');

  const handleSimulateOptimize = () => {
    setAtsState('loading');
    setTimeout(() => {
      const role = atsJobTitle.trim() || 'Professionnel';
      const core = strengthen(atsText) || 'Prise en charge des responsabilités clés du poste';
      setAtsOptimizedText(
        `${role} : ${core}, avec des résultats mesurables alignés sur les priorités du poste et les mots-clés recherchés par les recruteurs.`
      );
      setAtsScore(96);
      setAtsState('optimized');
    }, 900);
  };

  const handleSimulateReset = () => {
    setAtsState('idle');
    setAtsScore(35);
    setAtsOptimizedText('');
  };

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    {
      q: 'Est-ce que Virtual CV est gratuit ?',
      a: 'Oui. Le plan gratuit permet de générer des CV optimisés ATS et des lettres de motivation de qualité professionnelle sans frais. Pour des besoins avancés (générations illimitées, modèles premium), les plans Étudiant et Professionnel restent très abordables en FCFA.',
    },
    {
      q: 'Comment fonctionne l’optimisation ATS ?',
      a: 'Les recruteurs utilisent des logiciels (ATS) qui filtrent les candidatures par mots-clés. Notre IA analyse l’offre visée et adapte votre CV pour y intégrer les termes techniques et compétences indispensables, afin de maximiser vos chances de franchir ces filtres.',
    },
    {
      q: 'Mes données personnelles sont-elles sécurisées ?',
      a: 'Vos données sont stockées de façon sécurisée et ne sont ni partagées ni revendues. Vous gardez le contrôle total pour modifier ou supprimer vos informations et votre historique à tout moment.',
    },
    {
      q: 'Puis-je adapter mon CV à plusieurs offres ?',
      a: 'C’est la force de l’outil : au lieu d’envoyer le même CV générique, vous clonez votre CV maître et l’ajustez pour chaque offre en quelques secondes.',
    },
    {
      q: 'Qu’est-ce qui est inclus dans le dossier généré ?',
      a: 'Pour chaque génération, vous obtenez un CV reformaté pour le poste cible, une lettre de motivation personnalisée prête à signer, et un modèle d’e-mail d’accompagnement.',
    },
  ];

  return (
    <div className={styles.container}>
      {/* 1 — Hero */}
      <section className={styles.section}>
        <div className={`${styles.inner} ${styles.hero}`}>
          <div className={styles.heroContent}>
            <span className="tag tag-accent">Propulsé par l’IA</span>
            <h1 className={styles.heroTitle}>
              Décrochez l’entretien avec un CV <span className={styles.accentText}>optimisé ATS</span>.
            </h1>
            <p className={styles.heroLede}>
              Transformez votre CV et l’offre visée en un dossier complet — CV, lettre de motivation et
              e-mail — reformaté pour passer les filtres automatiques des recruteurs.
            </p>
            <div className={styles.heroActions}>
              <button onClick={onStart} className="btn btn-primary">
                Créer mon CV gratuitement <ArrowRight size={16} />
              </button>
              <button onClick={onViewPricing} className="btn btn-secondary">Découvrir les offres</button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.mockup}>
              <span className={`tag tag-accent ${styles.mockupTag}`}>Score ATS : 98%</span>
              <div className={styles.mockupHead}>
                <div className={styles.mockupAvatar}>JC</div>
                <div className={styles.mockupHeadLines}>
                  <div className={styles.lineStrong} />
                  <div className={styles.lineShort} />
                </div>
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.line} />
                <div className={styles.line} style={{ width: '85%' }} />
                <div className={styles.line} style={{ width: '70%' }} />
                <div className={styles.lineRule} />
                <div className={styles.line} style={{ width: '90%' }} />
                <div className={styles.line} style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Processus en 3 étapes */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className="tag tag-neutral">Processus</span>
            <h2>Trois étapes, un dossier complet</h2>
          </div>
          <div className={styles.stepsGrid}>
            {[
              ['01', 'Importez votre CV', 'Téléversez votre CV au format PDF. L’analyseur extrait instantanément vos informations clés.'],
              ['02', 'Ciblez l’offre', 'Collez l’offre d’emploi ou recherchez-la. L’IA identifie les mots-clés essentiels.'],
              ['03', 'Générez le dossier', 'Obtenez un CV optimisé, une lettre de motivation sur mesure et un e-mail d’accompagnement.'],
            ].map(([num, title, body]) => (
              <div className={styles.stepCell} key={num}>
                <div className={styles.stepNum}>{num}</div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Simulateur ATS */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className="tag tag-neutral">Démo</span>
            <h2>Testez l’optimiseur ATS</h2>
            <p className="text-muted">
              Renseignez un poste et une expérience : l’IA les réécrit en une formulation orientée résultats.
            </p>
          </div>

          <div className={styles.simPanel}>
            <div className={styles.simControls}>
              <div className="field">
                <label htmlFor="ats-title">Poste ciblé</label>
                <input
                  id="ats-title"
                  className="input"
                  type="text"
                  value={atsJobTitle}
                  onChange={(e) => setAtsJobTitle(e.target.value)}
                  disabled={atsState === 'loading'}
                  placeholder="ex : Directeur Financier"
                />
              </div>
              <div className="field">
                <label htmlFor="ats-exp">Votre expérience</label>
                <textarea
                  id="ats-exp"
                  className="input"
                  value={atsText}
                  onChange={(e) => setAtsText(e.target.value)}
                  disabled={atsState === 'loading'}
                  rows={4}
                  placeholder="Décrivez une tâche ou une mission…"
                />
              </div>
              <div>
                {atsState === 'optimized' ? (
                  <button onClick={handleSimulateReset} className="btn btn-secondary">
                    <RefreshCw size={15} /> Recommencer
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateOptimize}
                    className="btn btn-primary"
                    disabled={atsState === 'loading' || !atsText.trim()}
                  >
                    {atsState === 'loading' ? 'Optimisation…' : (<><Sparkles size={15} /> Optimiser</>)}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.simResults}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Score ATS</span>
                <span className={styles.scoreValue}>{atsScore}%</span>
              </div>
              <div className={styles.scoreBarTrack}>
                <div className={styles.scoreBarFill} style={{ width: `${atsScore}%` }} />
              </div>

              <div className={styles.simText}>
                {atsState === 'idle' && (
                  <p className="text-muted">Cliquez sur <strong>Optimiser</strong> pour voir l’IA réécrire votre expérience.</p>
                )}
                {atsState === 'loading' && (
                  <p className="text-muted">L’IA reformule votre expérience avec des termes d’action mesurables…</p>
                )}
                {atsState === 'optimized' && (
                  <>
                    <div className="tag tag-accent">Version optimisée</div>
                    <p className={styles.simOptimized}>« {atsOptimizedText} »</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Avant / Après */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className="tag tag-neutral">Avant / Après</span>
            <h2>Ce qui fait la différence</h2>
          </div>
          <div className={styles.compareGrid}>
            <div className={`${styles.compareCol} ${styles.compareWeak}`}>
              <div className={styles.compareStatus}>CV classique — ignoré par l’ATS</div>
              <h5 className={styles.compareLabel}>Expérience</h5>
              <p className={styles.compareText}>
                « J’ai fait la comptabilité générale, classé les factures et saisi les écritures chez Kaelis Group. »
              </p>
              <p className={styles.compareNote}>Pas de mots-clés, aucun impact chiffré, format illisible par les logiciels de tri.</p>
            </div>
            <div className={`${styles.compareCol} ${styles.compareStrong}`}>
              <div className={styles.compareStatus}>CV optimisé — sélectionné</div>
              <h5 className={styles.compareLabel}>Expérience de leadership</h5>
              <p className={styles.compareText}>
                « Pilotage de la comptabilité de Kaelis Group : réduction de 15 % des anomalies de trésorerie et
                automatisation des rapprochements bancaires. »
              </p>
              <p className={styles.compareNote}>Score ATS 98 %, rôle valorisé, termes techniques recherchés intégrés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Fonctionnalités */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className="tag tag-neutral">Fonctionnalités</span>
            <h2>Tout pour accélérer votre recherche</h2>
          </div>
          <div className={styles.featuresGrid}>
            {[
              [<CheckCircle size={22} key="i" />, 'Optimisation ATS intelligente', 'Les bons mots-clés, exigés par les recruteurs locaux et internationaux.'],
              [<Layers size={22} key="i" />, 'Multi-versions illimité', 'Personnalisez votre CV pour chaque offre sans repartir de zéro.'],
              [<MailOpen size={22} key="i" />, 'Lettre & e-mail', 'Une lettre de motivation et un e-mail d’accompagnement prêts à l’emploi.'],
              [<ShieldCheck size={22} key="i" />, 'Confidentialité totale', 'Vos données restent privées et supprimables en un clic.'],
            ].map(([icon, title, body], i) => (
              <div className={styles.featureCell} key={i}>
                <div className={styles.featureIcon}>{icon}</div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — FAQ */}
      <section className={styles.section} id="FAQ">
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <span className="tag tag-neutral">FAQ</span>
            <h2>Questions fréquentes</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button className={styles.faqQuestion} onClick={() => toggleFaq(index)} aria-expanded={openFaq === index}>
                  <span>{faq.q}</span>
                  <span className={styles.faqToggle}>{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && <p className={styles.faqAnswer}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — CTA (champ bordeaux) */}
      <section className={styles.ctaField}>
        <div className={`${styles.inner} ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Prêt à décrocher votre prochain poste ?</h2>
          <p className={styles.ctaLede}>Créez votre premier dossier de candidature en quelques minutes.</p>
          <button onClick={onStart} className={`btn ${styles.ctaBtn}`}>
            Créer mon CV gratuitement <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 8 — Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerGrid}`}>
          <div>
            <div className={styles.footerBrand}>VIRTUAL CV</div>
            <p className={styles.footerDesc}>La plateforme intelligente de création de CV et de candidatures optimisées ATS.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Produit</h4>
            <ul>
              <li><button onClick={onStart}>Générateur</button></li>
              <li><button onClick={onViewPricing}>Tarifs</button></li>
              <li><a href="#FAQ">FAQ</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Légal</h4>
            <ul>
              <li><a href="#privacy">Confidentialité</a></li>
              <li><a href="#terms">Conditions d’utilisation</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@virtualcv.app">support@virtualcv.app</a></li>
              <li><a href="#help">Centre d’aide</a></li>
            </ul>
          </div>
        </div>
        <div className={`${styles.inner} ${styles.footerBottom}`}>
          <span>© {new Date().getFullYear()} Virtual CV. Tous droits réservés.</span>
          <span className={styles.footerLinks}>
            <a href="#privacy">Confidentialité</a>
            <a href="#terms">Mentions légales</a>
          </span>
        </div>
      </footer>
    </div>
  );
};
