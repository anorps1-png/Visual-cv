import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Police professionnelle (Lato) — TTF statiques servis par jsDelivr (miroir du
// dépôt google/fonts), récupérés par le navigateur au moment du rendu PDF.
Font.register({ family: 'Lato', src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lato/Lato-Regular.ttf' });
Font.register({ family: 'LatoBold', src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lato/Lato-Bold.ttf' });
Font.register({ family: 'LatoItalic', src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/lato/Lato-Italic.ttf' });

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 26,
    paddingRight: 26,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Lato',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    paddingBottom: 6,
  },
  headerLeft: {
    width: '74%',
  },
  headerRight: {
    width: '22%',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#000000',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 10.5,
    color: '#000000',
    fontFamily: 'LatoItalic',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 8.5,
    color: '#000000',
    lineHeight: 1.25,
  },
  photo: {
    width: 70,
    height: 80,
    objectFit: 'cover',
    borderWidth: 0.5,
    borderColor: '#000000',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  leftColumn: {
    width: '68%',
  },
  rightColumn: {
    width: '28%',
  },
  section: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'LatoBold',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#000000',
  },
  experienceItem: {
    marginBottom: 6,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1.5,
  },
  jobTitle: {
    fontSize: 9.5,
    fontFamily: 'LatoBold',
    color: '#000000',
    width: '68%',
  },
  companyDate: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'LatoItalic',
    textAlign: 'right',
  },
  companyName: {
    fontSize: 9,
    fontFamily: 'LatoBold',
    color: '#000000',
    marginBottom: 2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 1.5,
    paddingLeft: 4,
  },
  bullet: {
    width: 8,
    fontSize: 9,
    color: '#000000',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: '#000000',
  },
  educationItem: {
    marginBottom: 6,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1.5,
  },
  degree: {
    fontSize: 10,
    fontFamily: 'LatoBold',
    color: '#000000',
    marginTop: 1.5,
  },
  institutionDate: {
    fontSize: 8.5,
    color: '#000000',
    fontFamily: 'LatoBold',
  },
  institutionName: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'LatoItalic',
    marginTop: 1.5,
    marginBottom: 1.5,
  },
  sidebarText: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#000000',
    marginBottom: 2.5,
  }
});

const letterStyles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 55,
    paddingRight: 55,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Lato',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  senderColumn: {
    width: '45%',
    flexDirection: 'column',
  },
  senderDetail: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 3,
  },
  recipientColumn: {
    width: '45%',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  recipientBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  recipientText: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 3,
  },
  subjectLine: {
    fontFamily: 'LatoBold',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 20,
  },
  salutationLine: {
    fontSize: 11,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.55,
    textAlign: 'justify',
    marginBottom: 16,
  },
  signatureSection: {
    marginTop: 35,
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
  },
  signatureImage: {
    width: 140,
    height: 50,
    objectFit: 'contain',
    marginBottom: 6,
  }
});

/* ───────── Gabarits Modern & Executive (encre uniquement) ─────────
   Rendus distincts du Standard (Times) : Helvetica, noir/gris sur blanc. */

const EXEC_FONT = 'Lato';
const EXEC_BOLD = 'LatoBold';
const EXEC_ITALIC = 'LatoItalic';
const contactArr = (p: any): string[] => [p.location, p.phone, p.email, p.linkedin, p.website].filter(Boolean);

/* ───────── Gabarit Modern (maquette « Souleymane BA ») ─────────
   En-tête centré + séparateur losangé, colonne gauche gris clair
   (photo ronde / À propos / Contact / Formation en cascade),
   colonne droite blanche (Expérience + Compétences en 2 colonnes). */
const GRAY_BG = '#ececec';
const MINK = '#1f2937';
const MINK_SOFT = '#4b5563';
const modern = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: EXEC_FONT, paddingTop: 34, paddingBottom: 0 },
  header: { alignItems: 'center', paddingHorizontal: 44, marginBottom: 4 },
  name: { fontSize: 30, color: MINK, textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center' },
  subtitle: { fontSize: 11, color: MINK_SOFT, textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', marginTop: 5 },
  ornament: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '48%', alignSelf: 'center', marginTop: 12, marginBottom: 14 },
  ornLine: { flex: 1, height: 1, backgroundColor: MINK },
  ornMid: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  diamond: { width: 5, height: 5, backgroundColor: MINK, marginHorizontal: 1.5, transform: 'rotate(45deg)' },
  ornDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: MINK, marginHorizontal: 4 },
  body: { flexDirection: 'row', flex: 1 },
  left: { width: '35%', backgroundColor: GRAY_BG, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 34 },
  right: { width: '65%', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 34 },
  photoWrap: { alignItems: 'center', marginBottom: 6 },
  photo: { width: 122, height: 122, borderRadius: 61, objectFit: 'cover' },
  photoPlaceholder: { width: 122, height: 122, borderRadius: 61, backgroundColor: '#dcdcdc', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 9, color: '#8a8a8a', letterSpacing: 1 },
  rule: { height: 1, backgroundColor: '#9ca3af', marginVertical: 14 },
  lHeadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lHead: { fontSize: 11, fontFamily: EXEC_BOLD, color: MINK, textTransform: 'uppercase', letterSpacing: 1 },
  lHeadRule: { flex: 1, height: 1, backgroundColor: '#9ca3af', marginLeft: 8 },
  about: { fontSize: 8.5, color: '#374151', lineHeight: 1.5, textAlign: 'justify' },
  contactLine: { fontSize: 8.5, color: '#374151', lineHeight: 1.55, marginBottom: 3 },
  contactLabel: { fontFamily: EXEC_BOLD, color: MINK },
  eduItem: { marginBottom: 11 },
  eduDegree: { fontSize: 9, fontFamily: EXEC_BOLD, color: MINK },
  eduSchool: { fontSize: 8.5, color: '#374151', marginTop: 2.5 },
  eduDate: { fontSize: 8.5, color: MINK_SOFT, marginTop: 2.5 },
  rHeadWrap: { borderTopWidth: 1, borderTopColor: MINK, paddingTop: 7, marginBottom: 12 },
  rHead: { fontSize: 13, fontFamily: EXEC_BOLD, color: MINK, textTransform: 'uppercase', letterSpacing: 1 },
  expItem: { marginBottom: 13 },
  expTitle: { fontSize: 10, fontFamily: EXEC_BOLD, color: MINK },
  expCompany: { fontSize: 9, color: MINK_SOFT, marginTop: 2.5, marginBottom: 3.5 },
  expDesc: { fontSize: 9, color: '#374151', lineHeight: 1.5, textAlign: 'justify' },
  compGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  compRow: { width: '47%', flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  compName: { fontSize: 8.5, color: '#374151', textTransform: 'uppercase', width: '52%' },
  compTrack: { flex: 1, height: 4, backgroundColor: '#d1d5db' },
  compFill: { height: 4, backgroundColor: '#6b7280', width: '80%' },
  skillRow: { flexDirection: 'row', marginBottom: 3.5 },
  skillDash: { width: 9, fontSize: 8.5, color: MINK },
  skillText: { flex: 1, fontSize: 8.5, color: '#374151', lineHeight: 1.4 },
  bulletRow: { flexDirection: 'row', marginBottom: 2.5 },
  bulletDash: { width: 10, fontSize: 9, color: MINK },
  bulletText: { flex: 1, fontSize: 9, color: '#374151', lineHeight: 1.45, textAlign: 'justify' },
});

const ModernDoc = ({ data, photoUrl }: { data: any; photoUrl?: string | null }) => {
  const p = data.personal_info || {};
  const exps = data.cv_experiences || [];
  const edu = data.education || [];
  const skills = data.keywords_matched || [];
  return (
    <Document>
      <Page size="A4" style={modern.page}>
        {/* En-tête centré + séparateur losangé */}
        <View style={modern.header}>
          <Text style={modern.name}>{p.name}</Text>
          {p.title ? <Text style={modern.subtitle}>{p.title}</Text> : null}
        </View>
        <View style={modern.ornament}>
          <View style={modern.ornLine} />
          <View style={modern.ornMid}>
            <View style={modern.diamond} /><View style={modern.diamond} /><View style={modern.diamond} />
            <View style={modern.ornDot} />
            <View style={modern.diamond} /><View style={modern.diamond} /><View style={modern.diamond} />
          </View>
          <View style={modern.ornLine} />
        </View>

        <View style={modern.body}>
          {/* Colonne gauche — gris clair */}
          <View style={modern.left}>
            <View style={modern.photoWrap}>
              {photoUrl
                ? <Image src={photoUrl} style={modern.photo} />
                : <View style={modern.photoPlaceholder}><Text style={modern.photoPlaceholderText}>PHOTO</Text></View>}
            </View>
            <View style={modern.rule} />

            {data.cv_summary ? (
              <View>
                <View style={modern.lHeadRow}><Text style={modern.lHead}>À propos de moi</Text><View style={modern.lHeadRule} /></View>
                <Text style={modern.about}>{data.cv_summary}</Text>
              </View>
            ) : null}

            {(p.phone || p.email || p.location) ? (
              <View style={{ marginTop: 14 }}>
                {p.phone ? <Text style={modern.contactLine}><Text style={modern.contactLabel}>Tél </Text>: {p.phone}</Text> : null}
                {p.email ? <Text style={modern.contactLine}><Text style={modern.contactLabel}>Email </Text>: {p.email}</Text> : null}
                {p.location ? <Text style={modern.contactLine}><Text style={modern.contactLabel}>Adresse </Text>: {p.location}</Text> : null}
                {p.linkedin ? <Text style={modern.contactLine}><Text style={modern.contactLabel}>LinkedIn </Text>: {p.linkedin}</Text> : null}
              </View>
            ) : null}

            {skills.length ? (
              <View>
                <View style={modern.rule} />
                <View style={modern.lHeadRow}><Text style={modern.lHead}>Compétences</Text><View style={modern.lHeadRule} /></View>
                {skills.map((s: string, i: number) => (
                  <View key={i} style={modern.skillRow}><Text style={modern.skillDash}>–</Text><Text style={modern.skillText}>{s}</Text></View>
                ))}
              </View>
            ) : null}

            {(data.languages || []).length ? (
              <View>
                <View style={modern.rule} />
                <View style={modern.lHeadRow}><Text style={modern.lHead}>Langues</Text><View style={modern.lHeadRule} /></View>
                {(data.languages || []).map((l: string, i: number) => (
                  <View key={i} style={modern.skillRow}><Text style={modern.skillDash}>–</Text><Text style={modern.skillText}>{l}</Text></View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Colonne droite — blanche */}
          <View style={modern.right}>
            {exps.length ? (
              <View>
                <View style={modern.rHeadWrap}><Text style={modern.rHead}>Expérience professionnelle</Text></View>
                {exps.map((exp: any, i: number) => (
                  <View key={i} style={modern.expItem}>
                    <Text style={modern.expTitle}>{[exp.title, exp.dates].filter(Boolean).join('   |   ')}</Text>
                    {exp.company ? <Text style={modern.expCompany}>{exp.company}</Text> : null}
                    {(exp.bullet_points || []).map((bp: string, j: number) => (
                      <View key={j} style={modern.bulletRow}><Text style={modern.bulletDash}>–</Text><Text style={modern.bulletText}>{bp}</Text></View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {edu.length ? (
              <View>
                <View style={modern.rHeadWrap}><Text style={modern.rHead}>Formation</Text></View>
                {edu.map((e: any, i: number) => (
                  <View key={i} style={modern.eduItem}>
                    {e.degree ? <Text style={modern.eduDegree}>{e.degree}</Text> : null}
                    {e.institution ? <Text style={modern.eduSchool}>{e.institution}</Text> : null}
                    {e.dates ? <Text style={modern.eduDate}>{e.dates}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const NAVY = '#25374d';
const navy = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: EXEC_FONT, flexDirection: 'row' },
  bar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '35%', backgroundColor: NAVY },
  side: { width: '35%', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: NAVY },
  main: { width: '65%', paddingVertical: 28, paddingHorizontal: 24 },
  photo: { width: '100%', height: 128, objectFit: 'cover', marginBottom: 16 },
  photoPlaceholder: { width: '100%', height: 128, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: 1 },
  sideHeading: { fontSize: 10, fontFamily: EXEC_BOLD, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginTop: 10, marginBottom: 6 },
  sideBody: { fontSize: 8.5, color: '#d7dce3', lineHeight: 1.5, textAlign: 'center', marginBottom: 3 },
  sideContact: { fontSize: 8.5, color: '#d7dce3', lineHeight: 1.4, marginBottom: 4 },
  name: { fontSize: 30, color: '#1f2937', fontFamily: EXEC_BOLD },
  title: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 3, marginTop: 2, marginBottom: 18 },
  heading: { fontSize: 12, color: '#1f2937', fontFamily: EXEC_BOLD, textTransform: 'uppercase', letterSpacing: 2, marginTop: 12, marginBottom: 4 },
  headingRule: { borderBottomWidth: 1.2, borderBottomColor: NAVY, width: 38, marginBottom: 8 },
  formationBlock: { marginBottom: 9 },
  formationDate: { fontSize: 8.5, fontFamily: EXEC_BOLD, color: NAVY, letterSpacing: 0.5 },
  formationDegree: { fontSize: 10, fontFamily: EXEC_BOLD, color: '#1f2937', marginTop: 1.5 },
  formationSchool: { fontSize: 9, fontFamily: EXEC_ITALIC, color: '#6b7280', marginTop: 1.5 },
  expRow: { flexDirection: 'row', marginBottom: 9 },
  expDateCol: { width: '27%', paddingRight: 6 },
  expDate: { fontSize: 8.5, fontFamily: EXEC_BOLD, color: '#1f2937' },
  expCompany: { fontSize: 8, color: '#6b7280', marginTop: 1 },
  expBodyCol: { width: '73%' },
  expRole: { fontSize: 9, fontFamily: EXEC_BOLD, color: '#1f2937', textTransform: 'uppercase', marginBottom: 3 },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 8, fontSize: 8.5, color: NAVY },
  bulletText: { flex: 1, fontSize: 8.5, color: '#374151', lineHeight: 1.35 },
  compCols: { flexDirection: 'row', justifyContent: 'space-between' },
  compCol: { width: '48%' },
  compSub: { fontSize: 8.5, fontFamily: EXEC_BOLD, color: '#1f2937', marginBottom: 4 },
  compItem: { fontSize: 8.5, color: '#374151', marginBottom: 2 },
});

const ExecutiveDoc = ({ data, photoUrl }: { data: any; photoUrl?: string | null }) => {
  const p = data.personal_info || {};
  const contacts = contactArr(p);
  const exps = data.cv_experiences || [];
  const edu = data.education || [];
  const langs = data.languages || [];
  const skills = data.keywords_matched || [];
  const hobbies = data.hobbies || [];
  return (
    <Document>
      <Page size="A4" style={navy.page}>
        <View fixed style={navy.bar} />
        <View style={navy.side}>
          {photoUrl
            ? <Image src={photoUrl} style={navy.photo} />
            : <View style={navy.photoPlaceholder}><Text style={navy.photoPlaceholderText}>PHOTO</Text></View>}
          {data.cv_summary ? (
            <View>
              <Text style={navy.sideHeading}>Profil</Text>
              <Text style={navy.sideBody}>{data.cv_summary}</Text>
            </View>
          ) : null}
          {contacts.length ? (
            <View>
              <Text style={navy.sideHeading}>Contact</Text>
              {contacts.map((c: string, i: number) => <Text key={i} style={navy.sideContact}>{c}</Text>)}
            </View>
          ) : null}
          {hobbies.length ? (
            <View>
              <Text style={navy.sideHeading}>Intérêts</Text>
              {hobbies.map((h: string, i: number) => <Text key={i} style={navy.sideContact}>{h}</Text>)}
            </View>
          ) : null}
          {skills.length ? (
            <View>
              <Text style={navy.sideHeading}>Compétences</Text>
              {skills.map((s: string, i: number) => <Text key={i} style={navy.sideContact}>{s}</Text>)}
            </View>
          ) : null}
          {langs.length ? (
            <View>
              <Text style={navy.sideHeading}>Langues</Text>
              {langs.map((l: string, i: number) => <Text key={i} style={navy.sideContact}>{l}</Text>)}
            </View>
          ) : null}
        </View>

        <View style={navy.main}>
          <Text style={navy.name}>{p.name}</Text>
          {p.title ? <Text style={navy.title}>{p.title}</Text> : null}

          {exps.length ? (
            <View>
              <Text style={navy.heading}>Expérience</Text>
              <View style={navy.headingRule} />
              {exps.map((exp: any, i: number) => (
                <View key={i} style={navy.expRow}>
                  <View style={navy.expDateCol}>
                    <Text style={navy.expDate}>{exp.dates}</Text>
                    {exp.company ? <Text style={navy.expCompany}>{exp.company}</Text> : null}
                  </View>
                  <View style={navy.expBodyCol}>
                    <Text style={navy.expRole}>{exp.title}</Text>
                    {(exp.bullet_points || []).map((bp: string, j: number) => (
                      <View key={j} style={navy.bulletRow}>
                        <Text style={navy.bulletDot}>•</Text>
                        <Text style={navy.bulletText}>{bp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {edu.length ? (
            <View>
              <Text style={navy.heading}>Formation</Text>
              <View style={navy.headingRule} />
              {edu.map((e: any, i: number) => (
                <View key={i} style={navy.formationBlock}>
                  {e.degree ? <Text style={navy.formationDegree}>{e.degree}</Text> : null}
                  {e.institution ? <Text style={navy.formationSchool}>{e.institution}</Text> : null}
                  {e.dates ? <Text style={navy.formationDate}>{e.dates}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

interface ATSPdfProps {
  data: any;
  photoUrl?: string | null;
  template?: 'standard' | 'modern' | 'executive';
}

export const ATSPdfDocument = ({ data, photoUrl, template = 'standard' }: ATSPdfProps) => {
  const personal = data.personal_info || {
    name: "Curriculum Vitae",
    title: "",
    email: "",
    phone: "",
    location: ""
  };
  const education = data.education || [];
  const languages = data.languages || [];
  const experiences = data.cv_experiences || [];
  const skills = data.keywords_matched || [];
  const hobbies = data.hobbies || [];

  const contactParts = [];
  if (personal.location) contactParts.push(personal.location);
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.email) contactParts.push(personal.email);
  if (personal.linkedin) contactParts.push(personal.linkedin);
  if (personal.website) contactParts.push(personal.website);
  const contactString = contactParts.join(' | ');

  if (template === 'modern') return <ModernDoc data={data} photoUrl={photoUrl} />;
  if (template === 'executive') return <ExecutiveDoc data={data} photoUrl={photoUrl} />;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{personal.name}</Text>
            {personal.title ? <Text style={styles.title}>{personal.title}</Text> : null}
            <Text style={styles.contactInfo}>{contactString}</Text>
          </View>
          <View style={styles.headerRight}>
            {photoUrl ? (
              <Image src={photoUrl} style={styles.photo} />
            ) : null}
          </View>
        </View>

        <View style={styles.columnsContainer}>
          <View style={styles.leftColumn}>
            {data.cv_summary ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Profil professionnel</Text>
                <Text style={styles.summaryText}>{data.cv_summary}</Text>
              </View>
            ) : null}

            {experiences.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Expérience Professionnelle</Text>
                {experiences.map((exp: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <Text style={styles.jobTitle}>{exp.title}</Text>
                      <Text style={styles.companyDate}>{exp.dates}</Text>
                    </View>
                    {exp.company ? <Text style={styles.companyName}>{exp.company}</Text> : null}
                    {exp.bullet_points.map((bp: string, i: number) => (
                      <View key={i} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bp}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {education.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Formation</Text>
                {education.map((edu: any, index: number) => (
                  <View key={index} style={styles.educationItem}>
                    {edu.degree ? <Text style={styles.degree}>{edu.degree}</Text> : null}
                    {edu.institution ? <Text style={styles.institutionName}>{edu.institution}</Text> : null}
                    {edu.dates ? <Text style={styles.institutionDate}>{edu.dates}</Text> : null}
                    {edu.description ? (
                      <Text style={styles.summaryText}>{edu.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.rightColumn}>
            {skills.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Compétences</Text>
                {skills.map((skill: string, i: number) => (
                  <Text key={i} style={styles.sidebarText}>• {skill}</Text>
                ))}
              </View>
            ) : null}

            {languages.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Langues</Text>
                {languages.map((lang: string, i: number) => (
                  <Text key={i} style={styles.sidebarText}>• {lang}</Text>
                ))}
              </View>
            ) : null}

            {hobbies.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Hobbies</Text>
                {hobbies.map((hobby: string, i: number) => (
                  <Text key={i} style={styles.sidebarText}>• {hobby}</Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};

interface CoverLetterPdfProps {
  senderText: string;
  recipientText: string;
  subject: string;
  bodyText: string;
  signatoryName: string;
  signatureUrl?: string | null;
}

export const CoverLetterPdfDocument = ({
  senderText,
  recipientText,
  subject,
  bodyText,
  signatoryName,
  signatureUrl
}: CoverLetterPdfProps) => {
  const senderLines = senderText.split('\n').map(l => l.trim()).filter(Boolean);
  const recipientLines = recipientText.split('\n').map(l => l.trim()).filter(Boolean);
  const paragraphs = bodyText.split('\n\n').map(p => p.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={letterStyles.page}>
        <View style={letterStyles.headerRow}>
          <View style={letterStyles.senderColumn}>
            {senderLines.map((line, idx) => (
              <Text key={idx} style={letterStyles.senderDetail}>{line}</Text>
            ))}
          </View>

          <View style={letterStyles.recipientColumn}>
            <View style={letterStyles.recipientBlock}>
              {recipientLines.map((line, idx) => (
                <Text key={idx} style={letterStyles.recipientText}>{line}</Text>
              ))}
            </View>
          </View>
        </View>

        {subject ? <Text style={letterStyles.subjectLine}>{subject}</Text> : null}

        {paragraphs.map((p, idx) => {
          if (idx === 0 && (p.startsWith("Madame, Monsieur,") || p.startsWith("Monsieur, Madame,"))) {
            const salutation = p.startsWith("Madame, Monsieur,") ? "Madame, Monsieur," : "Monsieur, Madame,";
            const restOfParagraph = p.substring(salutation.length).trim();
            return (
              <View key={idx}>
                <Text style={letterStyles.salutationLine}>{salutation}</Text>
                {restOfParagraph ? <Text style={letterStyles.paragraph}>{restOfParagraph}</Text> : null}
              </View>
            );
          }
          return (
            <Text key={idx} style={letterStyles.paragraph}>{p}</Text>
          );
        })}

        <View style={letterStyles.signatureSection}>
          {signatureUrl ? (
            <Image src={signatureUrl} style={letterStyles.signatureImage} />
          ) : null}
          <Text style={{ fontFamily: 'LatoBold' }}>{signatoryName}</Text>
        </View>
      </Page>
    </Document>
  );
};
