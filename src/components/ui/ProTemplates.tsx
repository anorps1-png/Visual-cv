'use client';

import React from 'react';
import styles from './ProTemplates.module.css';

interface ProTemplatesProps {
  userPlan: string;
  onViewPricing: () => void;
  onUse: (templateId: string) => void;
}

/**
 * Modèles Pro — présente les 3 modèles de CV : Standard (gratuit), Modern et
 * Executive (réservés au plan Professionnel). Les aperçus sont rendus en ENCRE
 * uniquement (noir/gris) : un vrai CV doit rester neutre pour un recruteur.
 */

const EXPERIENCE = [
  ['Directeur Financier', 'Kaelis Group · 2019—2024'],
  ['Contrôleur de gestion', 'Meridian SA · 2015—2019'],
  ['Analyste financier', 'Atlas Bank · 2012—2015'],
];

function Entries({ items }: { items: string[][] }) {
  return (
    <>
      {items.map(([t, m]) => (
        <div className={styles.entry} key={t}>
          <div className={styles.entryTitle}>{t}</div>
          <div className={styles.entryMeta}>{m}</div>
          <div className={styles.line} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </>
  );
}

/* Standard : deux colonnes claires. */
function StandardCV() {
  return (
    <div className={`${styles.cv} ${styles.cvSidebar}`}>
      <aside className={styles.sideLight}>
        <div className={styles.stdPhoto} />
        <div className={styles.sideLabelDark}>Contact</div>
        <span>Yaoundé</span>
        <span>a.obama@mail.co</span>
        <span>+237 6 00 00 00</span>
        <div className={styles.sideLabelDark}>Compétences</div>
        <span>Contrôle de gestion</span>
        <span>Consolidation IFRS</span>
        <span>Trésorerie</span>
        <span>Audit</span>
      </aside>
      <div className={styles.main}>
        <div className={styles.stdName}>AYISSI OBAMA</div>
        <div className={styles.stdRole}>Directeur Administratif &amp; Financier</div>
        <div className={styles.secLabel}>Expérience</div>
        <Entries items={EXPERIENCE} />
      </div>
    </div>
  );
}

/* Modern : bandeau latéral sombre. */
function ModernCV() {
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
        <Entries items={EXPERIENCE} />
      </div>
    </div>
  );
}

/* Executive : en-tête centré, double filet, style lettre. */
function ExecutiveCV() {
  return (
    <div className={`${styles.cv} ${styles.cvMono}`}>
      <div className={styles.monogram}>AO</div>
      <div className={styles.monoName}>AYISSI OBAMA</div>
      <div className={styles.monoRole}>Directeur Administratif &amp; Financier</div>
      <div className={styles.doubleRule}><span /><span /></div>
      <div className={styles.secLabel}>Expérience</div>
      <Entries items={EXPERIENCE} />
    </div>
  );
}

const TEMPLATES = [
  { id: 'standard', name: 'Standard', desc: 'Deux colonnes, sobre et parfaitement lisible par les ATS.', pro: false, Preview: StandardCV },
  { id: 'modern', name: 'Modern', desc: 'Bandeau latéral sombre : contact et compétences à gauche.', pro: true, Preview: ModernCV },
  { id: 'executive', name: 'Executive', desc: 'En-tête centré, double filet, style lettre de direction.', pro: true, Preview: ExecutiveCV },
];

export function ProTemplates({ userPlan, onViewPricing, onUse }: ProTemplatesProps) {
  const isPro = userPlan === 'Professionnel';

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <span className="tag tag-accent">Modern &amp; Executive réservés au plan Professionnel</span>
          <h2 className={styles.title}>Modèles Pro</h2>
          <p className="text-muted">
            Trois mises en page pour vos candidatures. Le contenu ci-dessous est
            illustratif — votre CV réel les remplira.
          </p>
        </div>
      </div>

      {!isPro && (
        <div className={styles.notice}>
          <span>Les modèles Modern et Executive sont réservés au plan Professionnel.</span>
          <button className="btn btn-primary" onClick={onViewPricing}>Voir les tarifs</button>
        </div>
      )}

      <div className={styles.grid}>
        {TEMPLATES.map(({ id, name, desc, pro, Preview }) => {
          const locked = pro && !isPro;
          return (
            <div className={styles.card} key={id}>
              <div className={styles.paper}>
                <Preview />
              </div>
              <div className={styles.footer}>
                <div>
                  <div className={styles.tName}>{name}{!pro && <span className={`tag tag-neutral ${styles.freeTag}`}>Gratuit</span>}</div>
                  <div className={styles.tDesc}>{desc}</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => (locked ? onViewPricing() : onUse(id))}
                >
                  {locked ? 'Débloquer' : 'Utiliser'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
