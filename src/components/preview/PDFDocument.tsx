import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for ATS friendly PDF (simple, 1 column, clear hierarchy)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyDate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
  }
});

interface ATSPdfProps {
  data: any;
}

export const ATSPdfDocument = ({ data }: ATSPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading1}>Curriculum Vitae</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading2}>PROFIL PROFESSIONNEL</Text>
        <Text style={styles.text}>{data.cv_summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading2}>EXPÉRIENCE PROFESSIONNELLE</Text>
        {data.cv_experiences.map((exp: any, index: number) => (
          <View key={index} style={{ marginBottom: 10 }}>
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

      <View style={styles.section}>
        <Text style={styles.heading2}>COMPÉTENCES CLÉS</Text>
        <Text style={styles.text}>{data.keywords_matched.join(' • ')}</Text>
      </View>
    </Page>
  </Document>
);
