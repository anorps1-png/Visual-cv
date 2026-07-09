import React, { useState } from 'react';
import styles from './Landing.module.css';
import { Sparkles, ArrowRight, ShieldCheck, MailOpen, Layers, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onViewPricing: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onViewPricing }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ATS Simulator states
  const [atsJob, setAtsJob] = useState<'comptable' | 'daf' | 'commercial'>('comptable');
  const [atsText, setAtsText] = useState<string>("J'ai géré les factures et fait de la saisie au centre médical.");
  const [atsState, setAtsState] = useState<'idle' | 'loading' | 'optimized'>('idle');
  const [atsScore, setAtsScore] = useState<number>(35);
  const [atsOptimizedText, setAtsOptimizedText] = useState<string>("");

  const handleJobChange = (job: 'comptable' | 'daf' | 'commercial') => {
    setAtsJob(job);
    setAtsState('idle');
    setAtsScore(35);
    setAtsOptimizedText("");
    if (job === 'comptable') {
      setAtsText("J'ai géré les factures et fait de la saisie au centre médical.");
    } else if (job === 'daf') {
      setAtsText("Je me suis occupé du budget et de la trésorerie de l'entreprise.");
    } else {
      setAtsText("Je vendais des produits aux clients de la ville.");
    }
  };

  const handleSimulateOptimize = () => {
    setAtsState('loading');
    setTimeout(() => {
      let optimized = "";
      let score = 95;
      if (atsJob === 'comptable') {
        optimized = "Chef de Département Financier : Direction de la comptabilité générale, diminution de 15% des anomalies bancaires et automatisation des rapprochements mensuels.";
        score = 96;
      } else if (atsJob === 'daf') {
        optimized = "Responsable Administratif & Financier : Pilotage budgétaire annuel, optimisation de la trésorerie multi-sites et mise en place d'indicateurs de performance clés (KPI).";
        score = 98;
      } else {
        optimized = "Ingénieur Commercial B2B : Négociation de contrats grands comptes à Douala et Yaoundé, générant une croissance du chiffre d'affaires annuel de 22%.";
        score = 95;
      }
      setAtsOptimizedText(optimized);
      setAtsScore(score);
      setAtsState('optimized');
    }, 1200);
  };

  const handleSimulateReset = () => {
    setAtsState('idle');
    setAtsScore(35);
    setAtsOptimizedText("");
    if (atsJob === 'comptable') {
      setAtsText("J'ai géré les factures et fait de la saisie au centre médical.");
    } else if (atsJob === 'daf') {
      setAtsText("Je me suis occupé du budget et de la trésorerie de l'entreprise.");
    } else {
      setAtsText("Je vendais des produits aux clients de la ville.");
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Est-ce que Visual CV Cameroon est gratuit ?",
      a: "Oui ! Notre plan de base gratuit vous permet de générer des CV optimisés ATS et des lettres de motivation de qualité professionnelle sans frais. Pour des besoins avancés (analyse IA illimitée, modèles premium supplémentaires), nous proposons des plans Étudiant et Professionnel très abordables en FCFA."
    },
    {
      q: "Comment fonctionne l'optimisation ATS intégrée ?",
      a: "Les recruteurs utilisent des logiciels appelés ATS (Applicant Tracking Systems) pour filtrer les candidatures par mots-clés. Notre IA analyse la description du poste pour lequel vous postulez et adapte votre CV pour inclure les termes techniques et compétences clés indispensables afin de maximiser vos chances de franchir ces filtres automatiques."
    },
    {
      q: "Mes données personnelles sont-elles sécurisées ?",
      a: "Absolument. Vos données sont stockées de façon sécurisée en accord avec notre charte de confidentialité. Nous ne partageons ni ne revendons vos informations personnelles. De plus, vous avez le contrôle total pour modifier ou supprimer vos données et votre historique à tout moment."
    },
    {
      q: "Puis-je adapter mon CV à plusieurs offres d'emploi différentes ?",
      a: "C'est précisément la force de notre outil ! Au lieu d'envoyer le même CV générique à toutes les entreprises, notre générateur vous permet de cloner votre CV maître et de l'ajuster spécifiquement pour chaque offre (Douala, Yaoundé, etc.) en quelques secondes."
    },
    {
      q: "Qu'est-ce qui est inclus dans le kit de candidature généré ?",
      a: "Pour chaque génération, vous obtenez un CV reformaté optimisé pour le poste cible, une lettre de motivation personnalisée prête à signer, ainsi qu'un modèle d'e-mail d'accompagnement percutant pour envoyer votre dossier au recruteur."
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} style={{ marginRight: '6px' }} />
            Propulsé par l'Intelligence Artificielle
          </div>
          <h1>
            Créez un CV professionnel d'exception en <span>quelques minutes</span>.
          </h1>
          <p>
            Le premier créateur de CV en ligne au Cameroun conçu pour passer les filtres ATS et décrocher des entretiens d'embauche dans les meilleures entreprises à Douala, Yaoundé et à l'international.
          </p>
          <div className={styles.heroActions}>
            <button onClick={onStart} className={styles.primaryBtn}>
              Créer mon CV gratuitement
              <ArrowRight size={18} />
            </button>
            <button onClick={onViewPricing} className={styles.secondaryBtn}>
              Découvrir les offres
            </button>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.cvCardMockup}>
            <div className={styles.badgeATS}>
              Score ATS : 98%
            </div>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupAvatar}>
                JC
              </div>
              <div className={styles.mockupTitle}>
                <div className={styles.lineLong} style={{ width: '180px', backgroundColor: 'var(--text-main)' }}></div>
                <div className={styles.lineShort} style={{ width: '110px' }}></div>
              </div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupRow}>
                <div className={styles.circleMini}>
                  <div className={styles.pulseDot}></div>
                </div>
                <div className={styles.lineLong} style={{ width: '220px' }}></div>
              </div>
              <div className={styles.mockupRow}>
                <div className={styles.circleMini}>
                  <div className={styles.pulseDot}></div>
                </div>
                <div className={styles.lineLong} style={{ width: '160px' }}></div>
              </div>
              <div className={styles.mockupRow}>
                <div className={styles.circleMini}>
                  <div className={styles.pulseDot}></div>
                </div>
                <div className={styles.lineLong} style={{ width: '190px' }}></div>
              </div>
            </div>
          </div>
          <div className={styles.decoratorBlob}></div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className={styles.stepsSection}>
        <div className={styles.sectionHeader}>
          <h2>Comment ça marche ?</h2>
          <p>Notre processus intelligent s'occupe de tout pour vous simplifier la vie.</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3>Importez votre CV</h3>
            <p>Téléversez votre CV actuel au format PDF. Notre analyseur extrait instantanément vos informations clés.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3>Ciblez l'offre d'emploi</h3>
            <p>Copiez-collez l'offre d'emploi ou recherchez-la directement. Notre IA identifie les mots-clés essentiels.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3>Générez votre kit</h3>
            <p>Obtenez en un clic un CV optimisé, une lettre de motivation rédigée sur mesure et un e-mail d'accompagnement.</p>
          </div>
        </div>
      </section>

      {/* ATS Simulator Section */}
      <section className={styles.simulatorSection}>
        <div className={styles.sectionHeader}>
          <h2>Testez l'Optimiseur ATS en temps réel</h2>
          <p>Découvrez comment notre IA transforme vos descriptions de tâches passives en réalisations percutantes et chiffrées adaptées aux recruteurs locaux.</p>
        </div>
        
        <div className={styles.simulatorCard}>
          <div className={styles.simulatorControls}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Poste ciblé :</label>
              <select 
                value={atsJob} 
                onChange={(e) => handleJobChange(e.target.value as any)}
                className={styles.simSelect}
              >
                <option value="comptable">Chef Comptable - Douala</option>
                <option value="daf">Directeur Financier Junior - Yaoundé</option>
                <option value="commercial">Ingénieur Commercial B2B - Douala</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Votre expérience (CV actuel) :</label>
              <textarea 
                value={atsText}
                onChange={(e) => setAtsText(e.target.value)}
                className={styles.simTextarea}
                placeholder="Décrivez votre expérience..."
                disabled={atsState === 'loading'}
              />
            </div>
            
            <div className={styles.simulatorActions}>
              {atsState === 'optimized' ? (
                <button onClick={handleSimulateReset} className={styles.simResetBtn}>
                  <RefreshCw size={16} style={{ marginRight: '6px' }} /> Recommencer
                </button>
              ) : (
                <button 
                  onClick={handleSimulateOptimize} 
                  className={styles.simOptimizeBtn}
                  disabled={atsState === 'loading' || !atsText.trim()}
                >
                  {atsState === 'loading' ? (
                    <>
                      <div className={styles.spinner}></div>
                      Optimisation en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} style={{ marginRight: '6px' }} /> Optimiser mon expérience
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.simulatorResults}>
            <div className={styles.scoreGaugeBox}>
              <div className={styles.gaugeContainer}>
                <svg className={styles.gaugeSvg} viewBox="0 0 100 100">
                  <circle 
                    className={styles.gaugeBg} 
                    cx="50" 
                    cy="50" 
                    r="40" 
                  />
                  <circle 
                    className={`${styles.gaugeFill} ${atsState === 'optimized' ? styles.gaugeFillOptimized : ''}`} 
                    cx="50" 
                    cy="50" 
                    r="40"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * atsScore) / 100}
                  />
                </svg>
                <div className={styles.gaugeText}>
                  <span className={styles.gaugeNumber}>{atsScore}%</span>
                  <span className={styles.gaugeLabel}>Score ATS</span>
                </div>
              </div>
            </div>
            
            <div className={styles.resultTextBox}>
              {atsState === 'idle' && (
                <div className={styles.resultPlaceholder}>
                  <p>Choisissez un poste et cliquez sur <strong>"Optimiser mon expérience"</strong> pour voir l'IA réécrire votre CV.</p>
                </div>
              )}
              {atsState === 'loading' && (
                <div className={styles.resultLoading}>
                  <div className={styles.shimmerLine}></div>
                  <div className={styles.shimmerLine} style={{ width: '80%' }}></div>
                  <p>L'IA analyse le poste et reformule votre expérience avec des termes d'action quantifiables...</p>
                </div>
              )}
              {atsState === 'optimized' && (
                <div className={styles.resultContent}>
                  <h4 className={styles.resultTitle}>✨ Version Optimisée par l'IA :</h4>
                  <p className={styles.resultOptimizedText}>"{atsOptimizedText}"</p>
                  <div className={styles.impactBadge}>
                    <TrendingUp size={14} style={{ marginRight: '6px' }} /> Recommandé pour passer les filtres ATS
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionHeader}>
          <h2>Ce qui fait la différence</h2>
          <p>Découvrez comment les détails font passer votre profil d'une candidature ignorée à un entretien décroché.</p>
        </div>
        
        <div className={styles.comparisonGrid}>
          <div className={`${styles.comparisonCard} ${styles.beforeCard}`}>
            <div className={styles.cardHeaderBad}>
              <span className={styles.cardHeaderStatus}>❌ CV Classique (Rejeté par l'ATS)</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cvSectionMock}>
                <h5>Compétences</h5>
                <p className={styles.cvTextBad}>"Je maîtrise Word, Excel et j'ai un bon contact avec les clients."</p>
              </div>
              <div className={styles.cvSectionMock}>
                <h5>Expérience professionnelle</h5>
                <p className={styles.cvTitleMock}>Comptable - Centre Médical Le Jourdain (Yaoundé)</p>
                <p className={styles.cvTextBad}>"J'ai fait la comptabilité générale de l'établissement, classé les factures et saisi les écritures."</p>
              </div>
              <div className={styles.cvBadNotice}>
                ⚠️ Manque de mots-clés spécifiques, pas d'impact chiffré, format non optimisé pour les logiciels de tri automatique.
              </div>
            </div>
          </div>
          
          <div className={`${styles.comparisonCard} ${styles.afterCard}`}>
            <div className={styles.cardHeaderGood}>
              <span className={styles.cardHeaderStatus}>✅ CV Optimisé Visual CV (Sélectionné)</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cvSectionMock}>
                <h5>Compétences Clés</h5>
                <p className={styles.cvTextGood}>"Comptabilité Générale & Analytique • Analyse de Risques Budgétaires • Modélisation Financière • Conformité Fiscale (DSF)"</p>
              </div>
              <div className={styles.cvSectionMock}>
                <h5>Expérience de Leadership</h5>
                <p className={styles.cvTitleMockGood}>Chef du Département Financier & Comptable - Centre Médical Le Jourdain</p>
                <p className={styles.cvTextGood}>"Pilotage de la comptabilité de l'établissement. Réduction de 15% des anomalies de trésorerie et automatisation de rapprochements bancaires complexes."</p>
              </div>
              <div className={styles.cvGoodNotice}>
                ⭐ Score ATS de 98%, valorisation du rôle de gestion, intégration de termes techniques recherchés à Douala/Yaoundé.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Conçu pour le marché de l'emploi camerounais</h2>
          <p>Toutes les fonctionnalités nécessaires pour accélérer votre recherche et booster votre profil.</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3>Optimisation ATS Intelligente</h3>
              <p>Assurez-vous que votre CV contienne les bons mots-clés exigés par les recruteurs locaux et internationaux.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Layers size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3>Multi-Versions Illimité</h3>
              <p>Personnalisez votre CV pour chaque entreprise. Ciblez des rôles différents sans repartir de zéro.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <MailOpen size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3>Lettre & E-mail d'Accompagnement</h3>
              <p>Plus besoin d'hésiter sur la rédaction de vos courriels. Notre IA prépare un texte professionnel accrocheur.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3>Confidentialité Totale</h3>
              <p>Vos CVs et données sont stockés de façon privée. Vous pouvez les supprimer définitivement en un seul clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>10k+</div>
            <div className={styles.statLabel}>Candidats Inscrits</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>25k+</div>
            <div className={styles.statLabel}>CVs Générés</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>98%</div>
            <div className={styles.statLabel}>Taux de Satisfaction</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2>Foire Aux Questions</h2>
          <p>Des réponses à toutes vos interrogations sur l'application.</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={`${styles.faqItem} ${openFaq === index ? styles.open : ''}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(index)}>
                {faq.q}
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className={styles.bottomCta}>
        <div className={styles.ctaCard}>
          <h2>Prêt à booster votre carrière ?</h2>
          <p>Rejoignez des milliers de professionnels camerounais qui utilisent l'IA pour décrocher l'emploi de leurs rêves.</p>
          <button onClick={onStart} className={styles.primaryBtn}>
            Créer mon CV gratuitement
            <ArrowRight size={18} />
          </button>
          <div className={styles.ctaSubtitle}>
            Inscription rapide et gratuite • Sans carte de crédit
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              🇨🇲 Visual CV
            </div>
            <p className={styles.footerDescription}>
              La plateforme intelligente d'aide à la recherche d'emploi et de création de CV au Cameroun.
            </p>
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
              <li><a href="#terms">Conditions d'utilisation</a></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@visualcv.cm">support@visualcv.cm</a></li>
              <li><a href="#help">Centre d'aide</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} Visual CV Cameroon. Tous droits réservés.
          </div>
          <div className={styles.footerLinks}>
            <a href="#privacy">Confidentialité</a>
            <a href="#terms">Mentions légales</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
