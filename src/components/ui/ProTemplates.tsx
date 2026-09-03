'use client';

import React from 'react';
import styles from './ProTemplates.module.css';

interface ProTemplatesProps {
  userPlan?: string;
  onSelectTemplate: (templateId: string) => void;
  onUpgrade: () => void;
}

export function ProTemplates({ userPlan = 'Gratuit', onSelectTemplate, onUpgrade }: ProTemplatesProps) {
  const isPro = userPlan === 'Professionnel';

  const handleUse = (templateId: string) => {
    if (!isPro) {
      onUpgrade();
    } else {
      onSelectTemplate(templateId);
    }
  };

  return (
    <section className={styles.container}>
      <span className={`tag tag-accent ${styles.kickerTag}`}>RÉSERVÉ AU PLAN PROFESSIONNEL</span>
      <h2 className={styles.title}>Modèles de CV exécutifs</h2>
      <p className={styles.lede}>
        Quatre mises en page premium, pensées pour les cadres et dirigeants — même moteur ATS, quatre partis pris visuels.
      </p>

      <div className={styles.grid}>
        {/* Modèle 1 : Exécutif — Sidebar */}
        <div className={styles.templateCard}>
          <div className={styles.previewWindow}>
            <div className={styles.sidebarLayout}>
              <div className={styles.darkSidebar}>
                <div className={styles.avatarCircle}></div>
                <div>
                  <div className={styles.sidebarName}>AÏSSATOU NJOYA</div>
                  <div className={styles.sidebarTitle}>Directrice Financière</div>
                </div>
                <div className={styles.sidebarDivider}></div>
                <div className={styles.sidebarContact}>
                  a.njoya@mail.com<br />
                  +00 00 00 00 00
                </div>
                <div className={styles.sidebarDivider}></div>
                <div className={styles.sidebarSectionHead}>Compétences</div>
                <div className={styles.sidebarSkills}>
                  Pilotage budgétaire<br />
                  Trésorerie multi-sites<br />
                  Reporting IFRS<br />
                  Levée de fonds
                </div>
              </div>
              <div className={styles.sidebarMain}>
                <div className={styles.sectionLabel}>Expérience</div>
                <div className={styles.jobHeading}>Directrice Administrative &amp; Financière — Groupe Ferova</div>
                <div className={styles.jobDates}>2019 — 2026</div>
                <div className={styles.jobDesc}>
                  Pilotage budgétaire annuel de 40 Mds FCFA, optimisation de la trésorerie multi-sites.
                </div>
                <div className={styles.jobHeading}>Responsable Contrôle de Gestion — Kaelis Group</div>
                <div className={styles.jobDates}>2014 — 2019</div>
                <div className={styles.jobDesc}>
                  Mise en place d'indicateurs de performance clés et automatisation du reporting mensuel.
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <div>
              <h3 className={styles.templateName}>Exécutif — Sidebar</h3>
              <p className={styles.templateDesc}>Colonne latérale sombre, photo, pour cadres</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleUse('executive-sidebar')}>
              Utiliser
            </button>
          </div>
        </div>

        {/* Modèle 2 : Exécutif — Bandeau */}
        <div className={styles.templateCard}>
          <div className={styles.previewWindow}>
            <div className={styles.bandeauHeader}>
              <div>
                <div className={styles.bandeauName}>SAMUEL EKWALLA</div>
                <div className={styles.bandeauSub}>Directeur Commercial</div>
              </div>
              <div className={styles.bandeauContact}>
                s.ekwalla@mail.com<br />
                +00 00 00 00 00
              </div>
            </div>
            <div className={styles.bandeauBody}>
              <div>
                <div className={styles.sectionLabel}>Expérience</div>
                <div className={styles.jobHeading}>Directeur Commercial Régional — Bolloré Transport</div>
                <div className={styles.jobDates}>2022 — 2026</div>
                <div className={styles.jobDesc}>
                  Négociation de contrats grands comptes, croissance du chiffre d'affaires annuel de 22%.
                </div>
                <div className={styles.jobHeading}>Chargé d'affaires senior — Société Générale</div>
                <div className={styles.jobDates}>2019 — 2022</div>
                <div className={styles.jobDesc}>
                  Développement d'un portefeuille de 80 entreprises clientes.
                </div>
              </div>
              <div>
                <div className={styles.sectionLabel}>Compétences clés</div>
                <div style={{ fontSize: '7.5px', lineHeight: '1.8', opacity: 0.8 }}>
                  Négociation grands comptes<br />
                  Pilotage de la performance<br />
                  Management d'équipe<br />
                  Développement export
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <div>
              <h3 className={styles.templateName}>Exécutif — Bandeau</h3>
              <p className={styles.templateDesc}>Bandeau plein-cadre en tête, corps deux colonnes</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleUse('executive-bandeau')}>
              Utiliser
            </button>
          </div>
        </div>

        {/* Modèle 3 : Exécutif — Monogramme */}
        <div className={styles.templateCard}>
          <div className={`${styles.previewWindow} ${styles.monogramLayout}`}>
            <div className={styles.monogramBadge}>FO</div>
            <div className={styles.monogramName}>FATIMA OUSMANOU</div>
            <div className={styles.monogramSub}>DIRECTRICE DES RESSOURCES HUMAINES</div>
            <div className={styles.doubleRule1}></div>
            <div className={styles.doubleRule2}></div>
            <div style={{ textAlign: 'left' }}>
              <div className={styles.sectionLabel}>Expérience</div>
              <div className={styles.jobHeading}>Directrice RH Groupe — Eneo</div>
              <div className={styles.jobDates}>2020 — 2026</div>
              <div className={styles.jobDesc}>
                Gestion de 320 collaborateurs, refonte de la politique de recrutement et des relations sociales.
              </div>
              <div className={styles.jobHeading}>Responsable RH — Bocom Industries</div>
              <div className={styles.jobDates}>2016 — 2020</div>
              <div className={styles.jobDesc}>
                Suivi administratif, paie et politique de formation de 150 employés.
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <div>
              <h3 className={styles.templateName}>Exécutif — Monogramme</h3>
              <p className={styles.templateDesc}>En-tête centré, style lettre à en-tête</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleUse('executive-monogram')}>
              Utiliser
            </button>
          </div>
        </div>

        {/* Modèle 4 : Exécutif — International */}
        <div className={styles.templateCard}>
          <div className={`${styles.previewWindow} ${styles.internationalLayout}`}>
            <div className={styles.intlHeader}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '13px' }}>
                  JEAN-CLAUDE MBARGA
                </div>
                <div style={{ fontSize: '8px', color: '#2b2b2b', fontWeight: 700 }}>
                  Chef Comptable Senior
                </div>
              </div>
              <div className={styles.intlLogoSlot}></div>
            </div>
            <div className={styles.intlDivider}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className={styles.sectionLabel}>Compétences</div>
                <div style={{ fontSize: '7.5px', lineHeight: '1.7', opacity: 0.8 }}>
                  Comptabilité générale<br />
                  Normes IFRS<br />
                  Conformité fiscale<br />
                  ERP &amp; Excel avancé
                </div>
                <div className={styles.sectionLabel} style={{ marginTop: '10px' }}>Langues</div>
                <div style={{ fontSize: '7.5px', lineHeight: '1.6', opacity: 0.8 }}>
                  Français (natif) · Anglais (courant)
                </div>
              </div>
              <div>
                <div className={styles.sectionLabel}>Expérience</div>
                <div className={styles.jobHeading}>Chef Comptable — Groupe SABC</div>
                <div className={styles.jobDates}>2021 — 2026</div>
                <div className={styles.jobDesc}>
                  Direction de la comptabilité générale, automatisation des rapprochements bancaires.
                </div>
                <div className={styles.jobHeading}>Comptable senior — SABC International</div>
                <div className={styles.jobDates}>2017 — 2021</div>
                <div className={styles.jobDesc}>
                  Suivi budgétaire et clôtures pour trois filiales.
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <div>
              <h3 className={styles.templateName}>Exécutif — International</h3>
              <p className={styles.templateDesc}>Espace logo, format attendu à l'international</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleUse('executive-international')}>
              Utiliser
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
