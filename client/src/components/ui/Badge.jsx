// src/components/ui/Badge.jsx
import styles from '../../styles/Components.module.css';

const VARIANT_MAP = {
  teal:  styles.badgeTeal,
  blue:  styles.badgeBlue,
  green: styles.badgeGreen,
  amber: styles.badgeAmber,
  red:   styles.badgeRed,
  gray:  styles.badgeGray,
};

const Badge = ({ children, variant = 'teal', icon, className = '' }) => {
  return (
    <span className={`${styles.badge} ${VARIANT_MAP[variant] || ''} ${className}`}>
      {icon && icon}
      {children}
    </span>
  );
};

export default Badge;
