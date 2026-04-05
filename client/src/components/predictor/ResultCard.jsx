// src/components/predictor/ResultCard.jsx
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Download } from 'lucide-react';
import RiskMeter, { getRiskLevel } from '../ui/RiskMeter';
import Button from '../ui/Button';
import { getAdvice } from '../../data/diseases';
import styles from '../../styles/Dashboard.module.css';

const ResultCard = ({ result, disease }) => {
  const { percentage, positive, label } = result;
  const { label: riskLabel, color, variant } = getRiskLevel(percentage);
  const advice = getAdvice(disease.id, variant);

  const badgeClass = {
    low:    styles.resultBadgeLow,
    medium: styles.resultBadgeMedium,
    high:   styles.resultBadgeHigh,
  }[variant];

  const Icon = variant === 'low' ? CheckCircle : variant === 'medium' ? AlertTriangle : XCircle;

  const handleDownload = () => {
    const content = [
      'MedPredict — Prediction Report',
      '================================',
      `Disease:     ${disease.label}`,
      `Result:      ${label}`,
      `Risk Level:  ${riskLabel} (${percentage}%)`,
      '',
      'Health Recommendations:',
      ...advice.map((a, i) => `  ${i + 1}. ${a}`),
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medpredict-${disease.id}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.resultSection}>
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div>
            <span className={`${styles.resultBadge} ${badgeClass}`}>
              <Icon size={13} />
              {riskLabel}
            </span>
            <div className={styles.resultTitle} style={{ marginTop: '12px' }}>
              {label}
            </div>
            <div className={styles.resultSubtitle}>
              Based on your {disease.label} input parameters
            </div>
          </div>
          <div className={styles.resultRisk}>
            <div className={styles.resultRiskValue} style={{ color }}>
              {percentage}%
            </div>
            <div className={styles.resultRiskLabel}>Risk Score</div>
          </div>
        </div>

        <RiskMeter percentage={percentage} />

        <div className={styles.adviceSection}>
          <div className={styles.adviceTitle}>
            <Lightbulb size={16} color="var(--teal-500)" />
            Health Recommendations
          </div>
          <ul className={styles.adviceList}>
            {advice.map((item, i) => (
              <li key={i} className={styles.adviceItem}>
                <span
                  className={styles.adviceDot}
                  style={{ background: color }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download size={14} />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
