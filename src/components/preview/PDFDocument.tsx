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
}

export const ATSPdfDocument = ({ data, photoUrl }: ATSPdfProps) => {
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
