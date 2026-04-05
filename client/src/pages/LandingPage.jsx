// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import {
  Heart, Brain, Activity, Shield, BarChart2,
  Zap, ChevronRight, CheckCircle, Clock, Users, Award
} from 'lucide-react';
import Button from '../components/ui/Button';
import styles from '../styles/LandingPage.module.css';

const FEATURES = [
  { icon: Brain, color: '#3b82f6', bg: '#dbeafe', title: 'ML-Powered Analysis', desc: 'Trained on thousands of clinical records with >90% accuracy across stroke, diabetes, and cardiac risk models.' },
  { icon: Shield, color: '#10b981', bg: '#d1fae5', title: 'Clinically Grounded', desc: 'Input parameters sourced directly from established medical datasets used in real clinical research.' },
  { icon: BarChart2, color: '#f59e0b', bg: '#fef3c7', title: 'Actionable Reports', desc: 'Every prediction includes a risk score, visual meter, and personalized health recommendations you can download.' },
  { icon: Clock, color: '#8b5cf6', bg: '#ede9fe', title: 'Instant Results', desc: 'Submit your parameters and get a full risk assessment in under 2 seconds — no waiting, no queues.' },
  { icon: Users, color: '#ef4444', bg: '#fee2e2', title: 'Prediction History', desc: 'Track your assessments over time and monitor how risk levels change with lifestyle improvements.' },
  { icon: Award, color: '#0d7a6e', bg: '#d0f5f2', title: 'Transparent AI', desc: 'No black-box magic — each prediction tells you exactly which factors are contributing to your risk.' },
];

const DISEASES = [
  { icon: Brain, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', title: 'Stroke Risk', desc: 'Evaluates cardiovascular and lifestyle factors to estimate your stroke probability.', tags: ['Age', 'Hypertension', 'Glucose', 'BMI', 'Smoking'] },
  { icon: Activity, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', title: 'Diabetes', desc: 'Analyzes glucose levels, insulin response, and metabolic markers for diabetes prediction.', tags: ['Glucose', 'Insulin', 'BMI', 'Age', 'Pedigree'] },
  { icon: Heart, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', title: 'Heart Disease', desc: 'Assesses cardiac output, cholesterol, ECG data, and chest pain type for heart risk.', tags: ['Cholesterol', 'ECG', 'Heart Rate', 'Thal', 'ST'] },
];

const LandingPage = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <Heart size={16} color="white" />
          </div>
          MedPredict
        </div>
        <ul className={styles.navLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#diseases">Diseases</a></li>
        </ul>
        <div className={styles.navActions}>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>Sign In</Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('login')}>Get Started</Button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div>
          <div className={styles.heroBadge}>
            <Zap size={11} />
            AI-Powered Clinical Risk Assessment
          </div>
          <h1 className={styles.heroTitle}>
            Know Your Risk.<br />
            <span className={styles.heroTitleAccent}>Before It's a Crisis.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            MedPredict uses machine learning trained on clinical datasets to assess your
            risk for stroke, diabetes, and heart disease — instantly and accurately.
          </p>
          <div className={styles.heroCta}>
            <Button variant="primary" size="lg" onClick={() => onNavigate('login')}>
              Start Free Assessment
              <ChevronRight size={18} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </Button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>3</span>
              <span className={styles.heroStatLabel}>Diseases Covered</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>92%</span>
              <span className={styles.heroStatLabel}>Model Accuracy</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>&lt;2s</span>
              <span className={styles.heroStatLabel}>Prediction Time</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span className={styles.heroCardTitle}>Stroke Risk Assessment</span>
              <span className={styles.heroCardBadge}>Low Risk</span>
            </div>
            <div className={styles.heroRiskMeter}>
              <div className={styles.heroRiskLabel}>
                <span>Risk Score</span>
                <span className={styles.heroRiskValue}>22%</span>
              </div>
              <div className={styles.heroProgressBar}>
                <div className={styles.heroProgressFill} />
              </div>
            </div>
            <div className={styles.heroMetrics}>
              {[
                { value: '28.4', label: 'BMI' },
                { value: '98', label: 'Glucose' },
                { value: '120/80', label: 'BP' },
              ].map(({ value, label }) => (
                <div key={label} className={styles.heroMetric}>
                  <div className={styles.heroMetricValue}>{value}</div>
                  <div className={styles.heroMetricLabel}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.floatingBadge} ${styles.floatingBadge1}`}>
            <div className={styles.floatingIcon} style={{ background: '#d1fae5' }}>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#065f46' }}>No Diabetes Detected</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Confidence: 94%</div>
            </div>
          </div>

          <div className={`${styles.floatingBadge} ${styles.floatingBadge2}`}>
            <div className={styles.floatingIcon} style={{ background: '#dbeafe' }}>
              <Heart size={18} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1e3a5f' }}>Cardiac: Moderate</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Review recommended</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.featuresInner}>
          <div className={styles.sectionTag}><Zap size={12} /> Features</div>
          <h2 className={styles.sectionTitle}>Everything you need for health risk analysis</h2>
          <p className={styles.sectionSubtitle}>Built for clarity. Designed for trust. Powered by science.</p>
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIconWrap} style={{ background: bg }}>
                  <Icon size={22} color={color} />
                </div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howItWorks} id="how">
        <div className={styles.sectionTag}><Activity size={12} /> Process</div>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <p className={styles.sectionSubtitle}>Three simple steps from input to actionable insight.</p>
        <div className={styles.stepsGrid}>
          {[
            { n: '01', title: 'Enter Parameters', desc: 'Fill in your clinical values — glucose, BMI, blood pressure, and more. Use sample data to explore.' },
            { n: '02', title: 'ML Analysis', desc: 'Our models analyze your inputs against patterns from thousands of clinical records in real time.' },
            { n: '03', title: 'Get Your Report', desc: 'Receive a risk score, visual meter, and personalized recommendations you can download and share.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className={styles.step}>
              <div className={styles.stepNumber}>{n}</div>
              <div className={styles.stepTitle}>{title}</div>
              <p className={styles.stepDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DISEASES */}
      <section className={styles.diseases} id="diseases">
        <div className={styles.diseasesInner}>
          <div className={styles.sectionTag}><Heart size={12} /> Coverage</div>
          <h2 className={styles.sectionTitle}>Three models. One platform.</h2>
          <p className={styles.sectionSubtitle}>Each model trained on dedicated clinical datasets with domain-specific features.</p>
          <div className={styles.diseasesGrid}>
            {DISEASES.map(({ icon: Icon, color, bg, title, desc, tags }) => (
              <div key={title} className={styles.diseaseCard} onClick={() => onNavigate('login')}>
                <div className={styles.diseaseIconWrap} style={{ background: bg }}>
                  <Icon size={26} color={color} />
                </div>
                <div className={styles.diseaseTitle}>{title}</div>
                <div className={styles.diseaseDesc}>{desc}</div>
                <div className={styles.diseaseTags}>
                  {tags.map((t) => <span key={t} className={styles.diseaseTag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Take control of your health today.</h2>
          <p className={styles.ctaSubtitle}>Free, instant, and clinically-grounded risk assessments — no account required to explore.</p>
          <Button variant="primary" size="lg" onClick={() => onNavigate('login')}>
            Start Your Assessment
            <ChevronRight size={18} />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© {new Date().getFullYear()} MedPredict — For informational purposes only. Not a substitute for professional medical advice.</span>
          <span>Built with React · Flask · MongoDB</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
