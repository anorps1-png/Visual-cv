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
    fontSize: 9.5,
    fontFamily: 'LatoBold',
    color: '#000000',
    width: '68%',
  },
  institutionDate: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'LatoItalic',
    textAlign: 'right',
  },
  institutionName: {
    fontSize: 9,
    color: '#000000',
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
const INK = '#1a1a1a';
const INK_SOFT = '#4a4a4a';
const INK_DARK = '#2d2b2b';

const body = StyleSheet.create({
  section: { marginBottom: 12 },
  heading: { fontSize: 10, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 2, marginBottom: 6 },
  summary: { fontSize: 9, lineHeight: 1.4, color: INK_SOFT },
  expItem: { marginBottom: 7 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  jobTitle: { fontSize: 9.5, fontFamily: EXEC_BOLD, color: INK, width: '70%' },
  dates: { fontSize: 8.5, fontFamily: EXEC_ITALIC, color: INK_SOFT, textAlign: 'right' },
  company: { fontSize: 9, fontFamily: EXEC_ITALIC, color: INK_SOFT, marginBottom: 2 },
  bulletRow: { flexDirection: 'row', marginBottom: 1.5, paddingLeft: 2 },
  bullet: { width: 8, fontSize: 9, color: INK },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.35, color: INK },
  item: { fontSize: 9, lineHeight: 1.35, color: INK, marginBottom: 2.5 },
});

const bodyLight = StyleSheet.create({
  heading: { fontSize: 9.5, fontFamily: EXEC_BOLD, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 0.5, borderBottomColor: '#8a8a8a', paddingBottom: 2, marginBottom: 6 },
  item: { fontSize: 8.5, lineHeight: 1.35, color: '#e6e6e6', marginBottom: 2.5 },
});

const tpl = StyleSheet.create({
  sbPage: { backgroundColor: '#fff', fontFamily: EXEC_FONT, flexDirection: 'row' },
  sbBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '34%', backgroundColor: INK_DARK },
  sbSide: { width: '34%', paddingVertical: 28, paddingHorizontal: 16, backgroundColor: INK_DARK },
  sbMain: { width: '66%', paddingVertical: 28, paddingHorizontal: 22 },
  sbPhoto: { width: 74, height: 86, objectFit: 'cover', marginBottom: 12, alignSelf: 'center' },
  sbName: { fontSize: 20, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase' },
  sbTitle: { fontSize: 10.5, fontFamily: EXEC_ITALIC, color: INK_SOFT, marginBottom: 10 },
  exPage: { paddingTop: 30, paddingBottom: 30, paddingLeft: 44, paddingRight: 44, backgroundColor: '#fff', fontFamily: EXEC_FONT },
  exHeadWrap: { alignItems: 'center', marginBottom: 4 },
  exName: { fontSize: 22, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  exTitle: { fontSize: 11, fontFamily: EXEC_ITALIC, color: INK_SOFT, textAlign: 'center', marginTop: 3 },
  exContact: { fontSize: 8.5, color: INK_SOFT, textAlign: 'center', marginTop: 5 },
  dRule: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK, height: 3, marginVertical: 14 },
});

const contactArr = (p: any): string[] => [p.location, p.phone, p.email, p.linkedin, p.website].filter(Boolean);

const SummaryBlock = ({ text }: { text?: string }) => text ? (
  <View style={body.section}><Text style={body.heading}>Profil professionnel</Text><Text style={body.summary}>{text}</Text></View>
) : null;

const ExperienceBlock = ({ items }: { items: any[] }) => items.length ? (
  <View style={body.section}>
    <Text style={body.heading}>Expérience professionnelle</Text>
    {items.map((exp: any, i: number) => (
      <View key={i} style={body.expItem}>
        <View style={body.expHeader}>
          <Text style={body.jobTitle}>{exp.title}</Text>
          <Text style={body.dates}>{exp.dates}</Text>
        </View>
        {exp.company ? <Text style={body.company}>{exp.company}</Text> : null}
        {(exp.bullet_points || []).map((bp: string, j: number) => (
          <View key={j} style={body.bulletRow}><Text style={body.bullet}>•</Text><Text style={body.bulletText}>{bp}</Text></View>
        ))}
      </View>
    ))}
  </View>
) : null;

const EducationBlock = ({ items }: { items: any[] }) => items.length ? (
  <View style={body.section}>
    <Text style={body.heading}>Formation</Text>
    {items.map((edu: any, i: number) => (
      <View key={i} style={body.expItem}>
        <View style={body.expHeader}>
          <Text style={body.jobTitle}>{edu.degree}</Text>
          <Text style={body.dates}>{edu.dates}</Text>
        </View>
        {edu.institution ? <Text style={body.company}>{edu.institution}</Text> : null}
        {edu.description ? <Text style={body.summary}>{edu.description}</Text> : null}
      </View>
    ))}
  </View>
) : null;

const BulletList = ({ heading, items, light }: { heading: string; items: string[]; light?: boolean }) => items.length ? (
  <View style={body.section}>
    <Text style={light ? bodyLight.heading : body.heading}>{heading}</Text>
    {items.map((it, i) => <Text key={i} style={light ? bodyLight.item : body.item}>{light ? it : `• ${it}`}</Text>)}
  </View>
) : null;

const ModernDoc = ({ data, photoUrl }: { data: any; photoUrl?: string | null }) => {
  const p = data.personal_info || {};
  const contacts = contactArr(p);
  return (
    <Document>
      <Page size="A4" style={tpl.sbPage}>
        <View fixed style={tpl.sbBar} />
        <View style={tpl.sbSide}>
          {photoUrl ? <Image src={photoUrl} style={tpl.sbPhoto} /> : null}
          {contacts.length ? (
            <View style={body.section}>
              <Text style={bodyLight.heading}>Contact</Text>
              {contacts.map((c, i) => <Text key={i} style={bodyLight.item}>{c}</Text>)}
            </View>
          ) : null}
          <BulletList heading="Compétences" items={data.keywords_matched || []} light />
          <BulletList heading="Langues" items={data.languages || []} light />
          <BulletList heading="Centres d'intérêt" items={data.hobbies || []} light />
        </View>
        <View style={tpl.sbMain}>
          <Text style={tpl.sbName}>{p.name}</Text>
          {p.title ? <Text style={tpl.sbTitle}>{p.title}</Text> : null}
          <SummaryBlock text={data.cv_summary} />
          <ExperienceBlock items={data.cv_experiences || []} />
          <EducationBlock items={data.education || []} />
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
  formationItem: { fontSize: 9, color: '#374151', marginBottom: 4, lineHeight: 1.4 },
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
                <Text key={i} style={navy.formationItem}>
                  {[e.dates, e.degree, e.institution].filter(Boolean).join(' - ')}
                  {e.description ? ` — ${e.description}` : ''}
                </Text>
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
                    <View style={styles.educationHeader}>
                      <Text style={styles.degree}>{edu.degree}</Text>
                      <Text style={styles.institutionDate}>{edu.dates}</Text>
                    </View>
                    {edu.institution ? <Text style={styles.institutionName}>{edu.institution}</Text> : null}
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
