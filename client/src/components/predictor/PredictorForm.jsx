// src/components/predictor/PredictorForm.jsx
import { useState, useCallback } from 'react';
import { AlertCircle, Zap, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import styles from '../../styles/Dashboard.module.css';

const validate = (fields, values) => {
  const errors = {};
  fields.forEach(({ items }) => {
    items.forEach(({ name, label, type, min, max }) => {
      const val = values[name];
      if (val === '' || val === undefined || val === null) {
        errors[name] = `${label} is required`;
      } else if (type === 'number') {
        const num = parseFloat(val);
        if (isNaN(num)) {
          errors[name] = `${label} must be a number`;
        } else if (min !== undefined && num < min) {
          errors[name] = `Min value is ${min}`;
        } else if (max !== undefined && num > max) {
          errors[name] = `Max value is ${max}`;
        }
      }
    });
  });
  return errors;
};

const PredictorForm = ({ disease, onSubmit, loading }) => {
  const [values, setValues]   = useState({});
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [touched]);

  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleAutofill = () => {
    setValues(disease.sampleData);
    setErrors({});
    setTouched({});
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
    setTouched({});
  };

  const handleSubmit = () => {
    const allTouched = {};
    disease.fields.forEach(({ items }) =>
      items.forEach(({ name }) => { allTouched[name] = true; })
    );
    setTouched(allTouched);

    const newErrors = validate(disease.fields, values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Build ordered payload exactly matching Flask's expected field order
      const ordered = {};
      disease.apiOrder.forEach((key) => {
        ordered[key] = values[key];
      });
      onSubmit(ordered);
    }
  };

  return (
    <>
      <div className={styles.formArea}>
        <div className={styles.formGrid}>
          {disease.fields.map(({ group, items }) => (
            <>
              <div key={group} className={styles.formSectionTitle}>{group}</div>
              {items.map(({ name, label, type, placeholder, options, optionLabels }) => (
                <div key={name} className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor={name}>
                    {label}
                  </label>

                  {type === 'select' ? (
                    <select
                      id={name}
                      className={`${styles.formInput} ${touched[name] && errors[name] ? styles.hasError : ''}`}
                      value={values[name] ?? ''}
                      onChange={(e) => handleChange(name, e.target.value)}
                      onBlur={() => handleBlur(name)}
                    >
                      <option value="">Select…</option>
                      {options.map((opt, i) => (
                        <option key={opt} value={opt}>
                          {optionLabels ? optionLabels[i] : opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={name}
                      type="number"
                      className={`${styles.formInput} ${touched[name] && errors[name] ? styles.hasError : ''}`}
                      placeholder={placeholder}
                      value={values[name] ?? ''}
                      onChange={(e) => handleChange(name, e.target.value)}
                      onBlur={() => handleBlur(name)}
                    />
                  )}

                  {touched[name] && errors[name] && (
                    <div className={styles.formErrorMsg}>
                      <AlertCircle size={12} />
                      {errors[name]}
                    </div>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RefreshCw size={14} /> Reset
        </Button>
        <Button variant="outline" size="sm" onClick={handleAutofill}>
          <Zap size={14} /> Sample Data
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Run Prediction
        </Button>
      </div>
    </>
  );
};

export default PredictorForm;
