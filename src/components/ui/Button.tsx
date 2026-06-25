import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ children, variant = 'primary', isLoading, className = '', ...props }: ButtonProps) {
  const baseClass = `${styles.btn} ${styles[variant]} ${className}`;
  
  return (
    <button className={baseClass} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className={styles.loader}>Chargement...</span> : children}
    </button>
  );
}
