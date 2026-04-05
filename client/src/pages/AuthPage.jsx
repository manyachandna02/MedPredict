// src/pages/AuthPage.jsx
import { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff, User, CheckCircle, Shield, Zap, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import styles from '../styles/AuthPage.module.css';

const FEATURES = [
  { icon: Shield, text: 'Clinically-grounded ML models' },
  { icon: Zap,    text: 'Instant risk assessments' },
  { icon: CheckCircle, text: 'Stroke, Diabetes & Heart Disease' },
];

const AuthPage = ({ onSuccess }) => {
  const [mode, setMode]           = useState('login'); // 'login' | 'signup'
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess({ name: form.name || 'User', email: form.email });
  };

  return (
    <div className={styles.page}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        <a href="/" className={styles.leftLogo}>
          <span className={styles.leftLogoIcon}>
            <Heart size={18} color="white" />
          </span>
          MedPredict
        </a>

        <div className={styles.leftContent}>
          <h1 className={styles.leftTitle}>
            Health insights,<br />
            <span className={styles.leftTitleAccent}>powered by AI.</span>
          </h1>
          <p className={styles.leftDesc}>
            Sign in to access instant ML-powered risk assessments for stroke,
            diabetes, and heart disease — backed by clinical datasets.
          </p>
          <div className={styles.leftFeatures}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className={styles.leftFeature}>
                <div className={styles.leftFeatureIcon}>
                  <Icon size={15} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.leftFooter}>
          For informational use only — not a substitute for medical advice.
        </div>
      </div>

      {/* RIGHT PANEL — FORM */}
      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className={styles.formSubtitle}>
              {mode === 'login'
                ? 'Enter your credentials to access the dashboard'
                : 'Start your free health assessment today'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className={styles.tabRow}>
            <div className={`${styles.tab} ${mode === 'login'  ? styles.active : ''}`} onClick={() => { setMode('login');  setErrors({}); }}>Sign In</div>
            <div className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`} onClick={() => { setMode('signup'); setErrors({}); }}>Sign Up</div>
          </div>

          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="name">Full Name</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><User size={16} /></span>
                <input
                  id="name"
                  type="text"
                  className={`${styles.formInput} ${errors.name ? styles.error : ''}`}
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              {errors.name && <div className={styles.errorMsg}><AlertCircle size={12} />{errors.name}</div>}
            </div>
          )}

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><Mail size={16} /></span>
              <input
                id="email"
                type="email"
                className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            {errors.email && <div className={styles.errorMsg}><AlertCircle size={12} />{errors.email}</div>}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.formLabel} htmlFor="password">Password</label>
              {mode === 'login' && (
                <span className={styles.forgotLink}>Forgot password?</span>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><Lock size={16} /></span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button
                className={styles.passwordToggle}
                onClick={() => setShowPass((p) => !p)}
                type="button"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <div className={styles.errorMsg}><AlertCircle size={12} />{errors.password}</div>}
          </div>

          <div className={styles.submitBtn}>
            <Button variant="primary" full loading={loading} onClick={handleSubmit}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </div>

          <div className={styles.divider}><span>or</span></div>

          <div className={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              className={styles.switchLink}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
