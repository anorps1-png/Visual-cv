import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 26,
    paddingRight: 26,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times-Roman',
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
    fontFamily: 'Times-Bold',
    color: '#000000',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 10.5,
    color: '#000000',
    fontFamily: 'Times-Italic',
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
    fontFamily: 'Times-Bold',
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
    fontFamily: 'Times-Bold',
    color: '#000000',
    width: '68%',
  },
  companyDate: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Times-Italic',
    textAlign: 'right',
  },
  companyName: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
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
    fontFamily: 'Times-Bold',
    color: '#000000',
    width: '68%',
  },
  institutionDate: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Times-Italic',
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
    fontFamily: 'Times-Roman',
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
    fontFamily: 'Times-Bold',
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

interface ATSPdfProps {
  data: any;
  photoUrl?: string | null;
  template?: 'standard' | 'sidebar' | 'bandeau' | 'monogramme' | 'international';
}

/* ───────────────────────── Gabarits exécutifs ─────────────────────────
   Rendu ENCRE uniquement (noir/gris sur blanc) : un CV doit rester neutre
   pour un recruteur. Times reste au gabarit Standard ; les exécutifs sont
   en Helvetica pour un rendu plus contemporain. */

const EXEC_FONT = 'Helvetica';
const EXEC_BOLD = 'Helvetica-Bold';
const EXEC_ITALIC = 'Helvetica-Oblique';
const INK = '#1a1a1a';
const INK_SOFT = '#4a4a4a';
const INK_DARK = '#2d2b2b';
const RULE = '#cfcfcf';

const body = StyleSheet.create({
  section: { marginBottom: 12 },
  heading: {
    fontSize: 10, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase',
    letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 2, marginBottom: 6,
  },
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
  heading: {
    fontSize: 9.5, fontFamily: EXEC_BOLD, color: '#ffffff', textTransform: 'uppercase',
    letterSpacing: 1, borderBottomWidth: 0.5, borderBottomColor: '#8a8a8a', paddingBottom: 2, marginBottom: 6,
  },
  item: { fontSize: 8.5, lineHeight: 1.35, color: '#e6e6e6', marginBottom: 2.5 },
});

const tpl = StyleSheet.create({
  pageCol: { paddingTop: 28, paddingBottom: 28, paddingLeft: 32, paddingRight: 32, backgroundColor: '#fff', fontFamily: EXEC_FONT, flexDirection: 'column' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  colL: { width: '64%' },
  colR: { width: '32%' },

  sbPage: { backgroundColor: '#fff', fontFamily: EXEC_FONT, flexDirection: 'row' },
  // Calque de fond pleine hauteur (répété sur chaque page via `fixed`), pour que
  // la colonne sombre descende toujours jusqu'en bas, même sur un CV court.
  sbBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '34%', backgroundColor: INK_DARK },
  sbSide: { width: '34%', paddingVertical: 28, paddingHorizontal: 16 },
  sbMain: { width: '66%', paddingVertical: 28, paddingHorizontal: 22 },
  sbPhoto: { width: 74, height: 86, objectFit: 'cover', marginBottom: 12, alignSelf: 'center' },
  sbName: { fontSize: 20, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase' },
  sbTitle: { fontSize: 10.5, fontFamily: EXEC_ITALIC, color: INK_SOFT, marginBottom: 10 },

  band: { backgroundColor: INK_DARK, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 14 },
  bandName: { fontSize: 21, fontFamily: EXEC_BOLD, color: '#fff', textTransform: 'uppercase' },
  bandTitle: { fontSize: 10.5, color: '#dcdcdc', marginTop: 2 },
  bandContact: { fontSize: 8.5, color: '#bcbcbc', marginTop: 5 },

  monoWrap: { alignItems: 'center', marginBottom: 8 },
  monoCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.2, borderColor: INK, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  monoInit: { fontSize: 16, fontFamily: EXEC_BOLD, color: INK },
  monoName: { fontSize: 20, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  monoTitle: { fontSize: 10.5, fontFamily: EXEC_ITALIC, color: INK_SOFT, textAlign: 'center', marginTop: 2 },
  monoContact: { fontSize: 8.5, color: INK_SOFT, textAlign: 'center', marginTop: 5 },
  dRule: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK, height: 3, marginVertical: 12 },

  intlName: { fontSize: 21, fontFamily: EXEC_BOLD, color: INK, textTransform: 'uppercase' },
  intlTitle: { fontSize: 10.5, fontFamily: EXEC_ITALIC, color: INK_SOFT, marginTop: 2 },
  logo: { width: 46, height: 46, backgroundColor: '#e6e6e6', borderWidth: 0.5, borderColor: RULE },
});

const contactArr = (p: any): string[] => [p.location, p.phone, p.email, p.linkedin, p.website].filter(Boolean);
const initialsOf = (name: string) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const SummaryBlock = ({ text }: { text?: string }) => text ? (
  <View style={body.section}>
    <Text style={body.heading}>Profil professionnel</Text>
    <Text style={body.summary}>{text}</Text>
  </View>
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
          <View key={j} style={body.bulletRow}>
            <Text style={body.bullet}>•</Text>
            <Text style={body.bulletText}>{bp}</Text>
          </View>
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
    {items.map((it, i) => (
      <Text key={i} style={light ? bodyLight.item : body.item}>{light ? it : `• ${it}`}</Text>
    ))}
  </View>
) : null;

const ExecSidebar = ({ data, photoUrl }: { data: any; photoUrl?: string | null }) => {
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

const ExecBandeau = ({ data }: { data: any }) => {
  const p = data.personal_info || {};
  return (
    <Document>
      <Page size="A4" style={tpl.pageCol}>
        <View style={tpl.band}>
          <Text style={tpl.bandName}>{p.name}</Text>
          {p.title ? <Text style={tpl.bandTitle}>{p.title}</Text> : null}
          <Text style={tpl.bandContact}>{contactArr(p).join('  ·  ')}</Text>
        </View>
        <SummaryBlock text={data.cv_summary} />
        <View style={tpl.row}>
          <View style={tpl.colL}>
            <ExperienceBlock items={data.cv_experiences || []} />
            <EducationBlock items={data.education || []} />
          </View>
          <View style={tpl.colR}>
            <BulletList heading="Compétences clés" items={data.keywords_matched || []} />
            <BulletList heading="Langues" items={data.languages || []} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

const ExecMonogramme = ({ data }: { data: any }) => {
  const p = data.personal_info || {};
  return (
    <Document>
      <Page size="A4" style={tpl.pageCol}>
        <View style={tpl.monoWrap}>
          <View style={tpl.monoCircle}><Text style={tpl.monoInit}>{initialsOf(p.name)}</Text></View>
          <Text style={tpl.monoName}>{p.name}</Text>
          {p.title ? <Text style={tpl.monoTitle}>{p.title}</Text> : null}
          <Text style={tpl.monoContact}>{contactArr(p).join('  ·  ')}</Text>
        </View>
        <View style={tpl.dRule} />
        <SummaryBlock text={data.cv_summary} />
        <ExperienceBlock items={data.cv_experiences || []} />
        <EducationBlock items={data.education || []} />
        <BulletList heading="Compétences" items={data.keywords_matched || []} />
        <BulletList heading="Langues" items={data.languages || []} />
      </Page>
    </Document>
  );
};

const ExecInternational = ({ data }: { data: any }) => {
  const p = data.personal_info || {};
  return (
    <Document>
      <Page size="A4" style={tpl.pageCol}>
        <View style={tpl.row}>
          <View style={{ width: '80%' }}>
            <Text style={tpl.intlName}>{p.name}</Text>
            {p.title ? <Text style={tpl.intlTitle}>{p.title}</Text> : null}
            <Text style={tpl.monoContact}>{contactArr(p).join('  ·  ')}</Text>
          </View>
          <View style={tpl.logo} />
        </View>
        <View style={tpl.dRule} />
        <View style={tpl.row}>
          <View style={tpl.colR}>
            <BulletList heading="Compétences" items={data.keywords_matched || []} />
            <BulletList heading="Langues" items={data.languages || []} />
            <BulletList heading="Centres d'intérêt" items={data.hobbies || []} />
          </View>
          <View style={tpl.colL}>
            <SummaryBlock text={data.cv_summary} />
            <ExperienceBlock items={data.cv_experiences || []} />
            <EducationBlock items={data.education || []} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

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

  if (template === 'sidebar') return <ExecSidebar data={data} photoUrl={photoUrl} />;
  if (template === 'bandeau') return <ExecBandeau data={data} />;
  if (template === 'monogramme') return <ExecMonogramme data={data} />;
  if (template === 'international') return <ExecInternational data={data} />;

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
          <Text style={{ fontFamily: 'Times-Bold' }}>{signatoryName}</Text>
        </View>
      </Page>
    </Document>
  );
};
