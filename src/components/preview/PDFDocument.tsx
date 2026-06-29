import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  sidebar: {
    width: '32%',
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    height: '100%',
  },
  main: {
    width: '68%',
    padding: 25,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    alignSelf: 'center',
    objectFit: 'cover',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sidebarText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#4b5563',
    marginBottom: 4,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  title: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  companyDate: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#4b5563',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: '#2563eb',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: '#374151',
  },
  educationItem: {
    marginBottom: 6,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  degree: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  institutionDate: {
    fontSize: 9,
    color: '#4b5563',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>
          {photoUrl ? (
            <Image src={photoUrl} style={styles.photo} />
          ) : null}

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarHeading}>Contact</Text>
            {personal.phone ? <Text style={styles.sidebarText}>📞 {personal.phone}</Text> : null}
            {personal.email ? <Text style={styles.sidebarText}>✉️ {personal.email}</Text> : null}
            {personal.location ? <Text style={styles.sidebarText}>📍 {personal.location}</Text> : null}
            {personal.linkedin ? <Text style={styles.sidebarText}>🔗 {personal.linkedin}</Text> : null}
            {personal.website ? <Text style={styles.sidebarText}>🌐 {personal.website}</Text> : null}
          </View>

          {skills.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>Compétences</Text>
              {skills.map((skill: string, i: number) => (
                <Text key={i} style={styles.sidebarText}>• {skill}</Text>
              ))}
            </View>
          ) : null}

          {languages.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>Langues</Text>
              {languages.map((lang: string, i: number) => (
                <Text key={i} style={styles.sidebarText}>• {lang}</Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.name}>{personal.name}</Text>
            {personal.title ? <Text style={styles.title}>{personal.title}</Text> : null}
          </View>

          {data.cv_summary ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Profil Professionnel</Text>
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
                    <Text style={styles.companyDate}>{exp.company} | {exp.dates}</Text>
                  </View>
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
              <Text style={styles.sectionHeading}>Éducation & Formations</Text>
              {education.map((edu: any, index: number) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.institutionDate}>{edu.institution} | {edu.dates}</Text>
                  </View>
                  {edu.description ? (
                    <Text style={styles.summaryText}>{edu.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

