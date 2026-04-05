// src/components/ui/RiskMeter.jsx
import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/Dashboard.module.css';

const getRiskLevel = (pct) => {
  if (pct < 35) return { label: 'Low Risk', color: '#10b981', variant: 'low' };
  if (pct < 65) return { label: 'Moderate Risk', color: '#f59e0b', variant: 'medium' };
  return { label: 'High Risk', color: '#ef4444', variant: 'high' };
};

const RiskMeter = ({ percentage }) => {
  const [displayPct, setDisplayPct] = useState(0);
  const animRef = useRef(null);
  const { label, color } = getRiskLevel(percentage);

  useEffect(() => {
    let start = null;
    const duration = 1000;
    const target = Math.min(100, Math.max(0, percentage));

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(eased * target));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [percentage]);

  return (
    <div className={styles.riskMeter}>
      <div className={styles.riskMeterHeader}>
        <span style={{ fontWeight: 600, color, fontSize: '0.85rem' }}>{label}</span>
        <span style={{ fontWeight: 700, color, fontSize: '0.85rem' }}>{displayPct}%</span>
      </div>
      <div className={styles.riskMeterTrack}>
        <div
          className={styles.riskMeterFill}
          style={{
            width: `${displayPct}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
          }}
        />
      </div>
      <div className={styles.riskMeterLabels}>
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default RiskMeter;
export { getRiskLevel };
