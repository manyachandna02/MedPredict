// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { Heart, Activity, Brain, BarChart2, TrendingDown, Bell } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import PredictorForm from '../components/predictor/PredictorForm';
import ResultCard from '../components/predictor/ResultCard';
import HistoryTable from '../components/dashboard/HistoryTable';
import Button from '../components/ui/Button';
import { DISEASES, MOCK_HISTORY } from '../data/diseases';
import styles from '../styles/Dashboard.module.css';

const DISEASE_KEYS = Object.keys(DISEASES);

const DISEASE_TAB_COLORS = {
  stroke:   { active: 'linear-gradient(135deg,#ef4444,#f97316)' },
  diabetes: { active: 'linear-gradient(135deg,#f59e0b,#10b981)' },
  heart:    { active: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
};

const DISEASE_ICONS = { stroke: Brain, diabetes: Activity, heart: Heart };

// ── Feature builders — one per disease, field names match diseases.js exactly ─
const buildFeatures = (disease, values) => {
  // Helper: select fields store '0' or '1' as strings — convert to number
  const num = (v) => {
    if (v === undefined || v === null || v === '') return NaN;
    return Number(v);
  };

  switch (disease) {
    // Order: age, hypertension, heart_disease, glucose, bmi
    case 'stroke':
      return [
        num(values.age),
        num(values.hypertension),   // '0' or '1'
        num(values.heart_disease),  // '0' or '1'
        num(values.glucose),        // field name is 'glucose' NOT 'avg_glucose_level'
        num(values.bmi),
      ];

    // Order: age, hypertension, heart_disease, bmi, hba1c, glucose
    case 'diabetes':
      return [
        num(values.age),
        num(values.hypertension),
        num(values.heart_disease),
        num(values.bmi),
        num(values.hba1c),
        num(values.glucose),
      ];

    // Order: age, sex, cp, trestbps, chol, thalach
    case 'heart':
      return [
        num(values.age),
        num(values.sex),      // '0' or '1'
        num(values.cp),       // '0','1','2','3'
        num(values.trestbps),
        num(values.chol),
        num(values.thalach),
      ];

    default:
      throw new Error(`Unknown disease: ${disease}`);
  }
};

// ── Stats summary row ─────────────────────────────────────────────────────────
const StatsRow = ({ history }) => {
  const total = history.length;
  const high  = history.filter((h) => h.level === 'High').length;
  const avg   = total
    ? Math.round(history.reduce((a, h) => a + h.risk, 0) / total)
    : 0;

  return (
    <div className={styles.statsRow}>
      {[
        { label: 'Total Assessments', value: total,    sub: 'All time',               icon: BarChart2,   color: '#3b82f6', bg: '#dbeafe' },
        { label: 'Avg Risk Score',    value: `${avg}%`, sub: 'Across all tests',       icon: TrendingDown, color: '#10b981', bg: '#d1fae5' },
        { label: 'High Risk Flags',   value: high,     sub: 'Require attention',       icon: Activity,    color: '#ef4444', bg: '#fee2e2' },
        { label: 'Models Available',  value: 3,        sub: 'Stroke, Diabetes, Heart', icon: Brain,       color: '#8b5cf6', bg: '#ede9fe' },
      ].map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>{label}</span>
            <div className={styles.statCardIcon} style={{ background: bg }}>
              <Icon size={16} color={color} />
            </div>
          </div>
          <div className={styles.statCardValue}>{value}</div>
          <div className={styles.statCardSub}>{sub}</div>
        </div>
      ))}
    </div>
  );
};

// ── Main dashboard component ──────────────────────────────────────────────────
const DashboardPage = ({ user, onLogout }) => {
  const [activePage,    setActivePage]    = useState('predictor');
  const [activeDisease, setActiveDisease] = useState('stroke');
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);
  const [history,       setHistory]       = useState(MOCK_HISTORY);

  const disease = DISEASES[activeDisease];

  // ── Disease tab switch ──────────────────────────────────────────────────────
  // FIXED: was defined outside the component, so setActiveDisease didn't exist
  const handleDiseaseChange = (d) => {
    setActiveDisease(d);
    setResult(null);
  };

  // ── Prediction handler ──────────────────────────────────────────────────────
  const handlePredict = async (values) => {
    setResult(null);
    setLoading(true);

    try {
      const features = buildFeatures(activeDisease, values);

      // Sanity check — catch NaN before sending to backend
      const nanIndex = features.findIndex((f) => isNaN(f));
      if (nanIndex !== -1) {
        const fieldName = DISEASES[activeDisease].apiOrder[nanIndex];
        throw new Error(`Invalid value for field "${fieldName}" — got NaN. Check your input.`);
      }

      console.log('Features sent to backend:', features);

      const res = await axios.post(
        `http://localhost:8000/api/${activeDisease}`,
        { features },
      );

      console.log('Backend response:', res.data);

      // Node backend returns: { status: 'success', data: { prediction, risk, riskPercent, ... } }
      const { prediction, risk } = res.data.data;
      const pct = Math.round(risk * 100);

      const RESULT_LABELS = {
        stroke:   { pos: 'Stroke Risk Detected',    neg: 'Low Stroke Risk' },
        diabetes: { pos: 'Diabetes Likely',          neg: 'No Diabetes Detected' },
        heart:    { pos: 'Cardiac Risk Identified',  neg: 'Heart Disease Unlikely' },
      };

      setResult({
        percentage: pct,
        positive:   prediction === 1,
        label:      prediction === 1
          ? RESULT_LABELS[activeDisease].pos
          : RESULT_LABELS[activeDisease].neg,
        description: prediction === 1
          ? 'Your parameters indicate elevated risk. Please consult a physician.'
          : 'Current parameters suggest low risk. Maintain healthy habits.',
      });

      // Prepend to history
      setHistory((prev) => [
        {
          id:      res.data.data.id,
          disease: disease.label,
          date:    res.data.data.createdAt,
          risk:    pct,
          level:   pct < 35 ? 'Low' : pct < 65 ? 'Medium' : 'High',
          result:  prediction === 1 ? 'Positive' : 'Negative',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Prediction error:', err);
      const msg = err.response?.data?.message || err.message || 'Error connecting to backend';
      alert(`Prediction failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.layout}>
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => { setActivePage(p); setResult(null); }}
        user={user}
        onLogout={onLogout}
      />

      <main className={styles.main}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div>
            <div className={styles.topbarTitle}>
              {activePage === 'predictor' && 'Risk Predictor'}
              {activePage === 'dashboard' && 'Overview'}
              {activePage === 'history'   && 'Prediction History'}
              {activePage === 'settings'  && 'Settings'}
            </div>
          </div>
          <div className={styles.topbarActions}>
            <Button variant="ghost" size="sm">
              <Bell size={16} />
            </Button>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--teal-500),var(--blue-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700, color: 'white', cursor: 'pointer',
              }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>

          {/* OVERVIEW */}
          {activePage === 'dashboard' && (
            <>
              <StatsRow history={history} />
              <div className={styles.historySection}>
                <HistoryTable history={history} />
              </div>
            </>
          )}

          {/* PREDICTOR */}
          {activePage === 'predictor' && (
            <>
              <StatsRow history={history} />

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>ML Risk Assessment</div>
                    <div className={styles.panelSubtitle}>
                      Select a disease model and enter patient parameters
                    </div>
                  </div>

                  <div className={styles.diseaseTabs}>
                    {DISEASE_KEYS.map((key) => {
                      const Icon     = DISEASE_ICONS[key];
                      const d        = DISEASES[key];
                      const isActive = activeDisease === key;
                      return (
                        <button
                          key={key}
                          className={`${styles.diseaseTab} ${isActive ? styles.activeTab : ''}`}
                          style={isActive ? { background: DISEASE_TAB_COLORS[key].active } : {}}
                          onClick={() => handleDiseaseChange(key)}
                        >
                          <Icon size={14} />
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loading ? (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <div className={styles.loadingText}>
                      Analyzing parameters with ML model…
                    </div>
                  </div>
                ) : (
                  <PredictorForm
                    key={activeDisease}
                    disease={disease}
                    onSubmit={handlePredict}
                    loading={loading}
                  />
                )}

                {result && !loading && (
                  <ResultCard result={result} disease={disease} />
                )}
              </div>
            </>
          )}

          {/* HISTORY */}
          {activePage === 'history' && (
            <>
              <StatsRow history={history} />
              <div className={styles.historySection}>
                <HistoryTable history={history} />
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activePage === 'settings' && (
            <div className={styles.panel} style={{ padding: '40px' }}>
              <div className={styles.panelTitle} style={{ marginBottom: '8px' }}>
                Account Settings
              </div>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '32px' }}>
                Manage your profile and application preferences.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '540px' }}>
                {[
                  { label: 'Full Name', value: user?.name  || '', type: 'text'  },
                  { label: 'Email',     value: user?.email || '', type: 'email' },
                ].map(({ label, value, type }) => (
                  <div key={label}>
                    <label className={styles.formLabel}>{label}</label>
                    <input
                      type={type}
                      defaultValue={value}
                      className={styles.formInput}
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <Button variant="primary" size="sm">Save Changes</Button>
                <Button variant="ghost"   size="sm" onClick={onLogout}>Sign Out</Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
