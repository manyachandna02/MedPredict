// src/components/dashboard/HistoryTable.jsx
import { Clock, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import Badge from '../ui/Badge';
import styles from '../../styles/Dashboard.module.css';

const LEVEL_VARIANT = { Low: 'green', Medium: 'amber', High: 'red' };

const HistoryTable = ({ history }) => {
  if (!history?.length) {
    return (
      <div className={styles.historyPanel}>
        <div className={styles.historyHeader}>
          <div className={styles.historyTitle}>
            <Clock size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--slate-400)' }} />
            Prediction History
          </div>
        </div>
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
          No predictions yet. Run your first prediction above.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <div className={styles.historyTitle}>
          <Clock size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--slate-400)' }} />
          Prediction History
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
          {history.length} record{history.length !== 1 ? 's' : ''}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Disease</th>
            <th>Result</th>
            <th>Risk</th>
            <th>Level</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => {
            const Icon = row.risk < 35 ? TrendingDown : row.risk < 65 ? Minus : TrendingUp;
            const iconColor = row.risk < 35 ? 'var(--risk-low)' : row.risk < 65 ? 'var(--risk-medium)' : 'var(--risk-high)';
            return (
              <tr key={row.id}>
                <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{row.disease}</td>
                <td>{row.result}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={14} color={iconColor} />
                    <span style={{ fontWeight: 600, color: iconColor }}>{row.risk}%</span>
                  </span>
                </td>
                <td>
                  <Badge variant={LEVEL_VARIANT[row.level] || 'gray'}>
                    {row.level}
                  </Badge>
                </td>
                <td style={{ color: 'var(--slate-400)' }}>
                  {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
