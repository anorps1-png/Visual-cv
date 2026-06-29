'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Eye, Check } from 'lucide-react';
import { Button } from './Button';
import styles from './SearchJD.module.css';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  sourceUrl?: string;
}

interface SearchJDProps {
  onSelect: (description: string) => void;
}

export function SearchJD({ onSelect }: SearchJDProps) {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async (searchVal: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(searchVal)}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Error searching jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs('');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(query);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
        <div className={styles.inputWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Rechercher un poste, une entreprise ou une ville..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
          />
        </div>
        <Button type="submit" disabled={loading}>Rechercher</Button>
      </form>

      <div className={styles.layout}>
        {/* Jobs List */}
        <div className={styles.listSection}>
          <h4>Offres d'emploi en direct</h4>
          {loading ? (
            <p className={styles.statusText}>Chargement des offres...</p>
          ) : jobs.length === 0 ? (
            <p className={styles.statusText}>Aucune offre d'emploi trouvée.</p>
          ) : (
            <div className={styles.jobList}>
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.activeCard : ''}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <h5>{job.title}</h5>
                  <div className={styles.meta}>
                    <span><Briefcase size={12} /> {job.company}</span>
                    <span><MapPin size={12} /> {job.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Detail Panel */}
        <div className={styles.detailSection}>
          {selectedJob ? (
            <div className={styles.detailPanel}>
              <h4>Détails du poste</h4>
              <div className={styles.detailHeader}>
                <h3>{selectedJob.title}</h3>
                <p className={styles.detailCompany}>{selectedJob.company}</p>
                <p className={styles.detailLocation}>📍 {selectedJob.location}</p>
                {selectedJob.sourceUrl && (
                  <a 
                    href={selectedJob.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    Voir l'offre originale 🔗
                  </a>
                )}
              </div>
              <div className={styles.descriptionBox}>
                <h5>Description de l'offre :</h5>
                <p className={styles.descriptionText}>{selectedJob.description}</p>
              </div>
              <Button 
                onClick={() => onSelect(selectedJob.description)}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <Check size={16} style={{ marginRight: '8px' }} /> Sélectionner cette offre
              </Button>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <Eye size={48} className={styles.emptyIcon} />
              <p>Sélectionnez une offre d'emploi dans la liste pour voir ses détails.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
