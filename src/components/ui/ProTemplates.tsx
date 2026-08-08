'use client';

import React from 'react';
import styles from './ProTemplates.module.css';

interface ProTemplatesProps {
  userPlan: string;
  onViewPricing: () => void;
}

/**
 * Modèles Pro — 4 modèles de CV « exécutif », réservés au plan Professionnel.
 * Les aperçus sont rendus en ENCRE uniquement (noir/gris, aucune couleur
 * d'accent) : un vrai CV doit rester neutre pour un recruteur. Le bordeaux est
 * réservé au chrome de l'app (titres de cartes, bouton « Utiliser »).
 */

/* — Aperçus (contenu illustratif : remplacé au runtime par le CV réel) — */

function SidebarCV() {
  return (
    <div className={`${styles.cv} ${styles.cvSidebar}`}>
      <aside className={styles.side}>
        <div className={styles.avatar}>AO</div>
        <div className={styles.sideName}>A. OBAMA</div>
        <div className={styles.sideRole}>Directeur Financier</div>
        <div className={styles.sideBlock}>
          <div className={styles.sideLabel}>Contact</div>
          <span>Yaoundé</span>
          <span>a.obama@mail.co</span>
          <span>+237 6 00 00 00</span>
        </div>
        <div className={styles.sideBlock}>
          <div className={styles.sideLabel}>Compétences</div>
          <span>Contrôle de gestion</span>
          <span>Consolidation IFRS</span>
          <span>Trésorerie</span>
          <span>Audit</span>
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.secLabel}>Expérience</div>
        {[
          ['Directeur Financier', 'Kaelis Group · 2019—2024'],
          ['Contrôleur de gestion', 'Meridian SA · 2015—2019'],
          ['Analyste financier', 'Atlas Bank · 2012—2015'],
        ].map(([t, m]) => (
          <div className={styles.entry} key={t}>
            <div className={styles.entryTitle}>{t}</div>
            <div className={styles.entryMeta}>{m}</div>
            <div className={styles.line} />
            <div className={styles.lineShort} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BandeauCV() {
  return (
    <div className={`${styles.cv} ${styles.cvBandeau}`}>
      <header className={styles.band}>
        <div className={styles.bandName}>AYISSI OBAMA</div>
        <div className={styles.bandRole}>Directeur Administratif &amp; Financier</div>
        <div className={styles.bandContact}>Yaoundé · a.obama@mail.co · +237 6 00 00 00</div>
      </header>
      <div className={styles.cols2}>
        <div>
          <div className={styles.secLabel}>Expérience</div>
          {[
            ['Directeur Financier', 'Kaelis Group · 2019—2024'],
            ['Contrôleur de gestion', 'Meridian SA · 2015—2019'],
          ].map(([t, m]) => (
            <div className={styles.entry} key={t}>
              <div className={styles.entryTitle}>{t}</div>
              <div className={styles.entryMeta}>{m}</div>
              <div className={styles.line} />
              <div className={styles.lineShort} />
            </div>
          ))}
        </div>
        <div className={styles.colRight}>
          <div className={styles.secLabel}>Compétences clés</div>
          <span>Consolidation IFRS</span>
          <span>Contrôle de gestion</span>
          <span>Trésorerie &amp; risques</span>
          <span>Reporting &amp; audit</span>
          <span>Management d’équipe</span>
        </div>
      </div>
    </div>
  );
}

function MonogrammeCV() {
  return (
    <div className={`${styles.cv} ${styles.cvMono}`}>
      <div className={styles.monogram}>AO</div>
      <div className={styles.monoName}>AYISSI OBAMA</div>
      <div className={styles.monoRole}>Directeur Administratif &amp; Financier</div>
      <div className={styles.doubleRule}><span /><span /></div>
      <div className={styles.secLabel}>Expérience</div>
      {[
        ['Directeur Financier', 'Kaelis Group · 2019—2024'],
        ['Contrôleur de gestion', 'Meridian SA · 2015—2019'],
        ['Analyste financier', 'Atlas Bank · 2012—2015'],
      ].map(([t, m]) => (
        <div className={styles.entry} key={t}>
          <div className={styles.entryTitle}>{t}</div>
          <div className={styles.entryMeta}>{m}</div>
          <div className={styles.line} />
        </div>
      ))}
    </div>
  );
}

function InternationalCV() {
  return (
    <div className={`${styles.cv} ${styles.cvIntl}`}>
      <header className={styles.intlHead}>
        <div>
          <div className={styles.intlName}>AYISSI OBAMA</div>
          <div className={styles.intlRole}>Chief Financial Officer</div>
        </div>
        <div className={styles.logoSquare} aria-hidden />
      </header>
      <div className={styles.doubleRule}><span /><span /></div>
      <div className={styles.cols2}>
        <div className={styles.colRight}>
          <div className={styles.secLabel}>Compétences</div>
          <span>IFRS · US GAAP</span>
          <span>M&amp;A · Due diligence</span>
          <div className={styles.secLabel} style={{ marginTop: 8 }}>Langues</div>
          <span>Français — natif</span>
          <span>Anglais — courant</span>
        </div>
        <div>
          <div className={styles.secLabel}>Expérience</div>
          {[
            ['CFO', 'Kaelis Group · 2019—2024'],
            ['Finance Manager', 'Meridian SA · 2015—2019'],
          ].map(([t, m]) => (
            <div className={styles.entry} key={t}>
              <div className={styles.entryTitle}>{t}</div>
              <div className={styles.entryMeta}>{m}</div>
              <div className={styles.line} />
              <div className={styles.lineShort} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: 'executive-sidebar', name: 'Exécutif — Sidebar', desc: 'Bandeau latéral sombre, contact et compétences à gauche.', Preview: SidebarCV },
  { id: 'executive-banner', name: 'Exécutif — Bandeau', desc: 'En-tête pleine largeur, corps sur deux colonnes.', Preview: BandeauCV },
  { id: 'executive-monogram', name: 'Exécutif — Monogramme', desc: 'En-tête centré, monogramme et double filet.', Preview: MonogrammeCV },
  { id: 'executive-international', name: 'Exécutif — International', desc: 'Emplacement logo, compétences et langues.', Preview: InternationalCV },
];

export function ProTemplates({ userPlan, onViewPricing }: ProTemplatesProps) {
  const isPro = userPlan === 'Professionnel';

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <span className="tag tag-accent">Réservé au plan Professionnel</span>
          <h2 className={styles.title}>Modèles Pro</h2>
          <p className="text-muted">
            Quatre mises en page « exécutif » pour vos candidatures de direction.
            Le contenu ci-dessous est illustratif — votre CV réel les remplira.
          </p>
        </div>
      </div>

      {!isPro && (
        <div className={styles.notice}>
          <span>Ces modèles sont réservés au plan Professionnel.</span>
          <button className="btn btn-primary" onClick={onViewPricing}>Voir les tarifs</button>
        </div>
      )}

      <div className={styles.grid}>
        {TEMPLATES.map(({ id, name, desc, Preview }) => (
          <div className={styles.card} key={id}>
            <div className={styles.paper}>
              <Preview />
            </div>
            <div className={styles.footer}>
              <div>
                <div className={styles.tName}>{name}</div>
                <div className={styles.tDesc}>{desc}</div>
              </div>
              <button
                className="btn btn-primary"
                onClick={isPro ? undefined : onViewPricing}
              >
                {isPro ? 'Utiliser' : 'Débloquer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
