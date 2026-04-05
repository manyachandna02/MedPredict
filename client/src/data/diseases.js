// src/data/diseases.js
export const DISEASES = {
  stroke: {
    id: 'stroke',
    label: 'Stroke',
    color: '#ef4444',
    bgColor: '#fee2e2',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
    // API payload order: age, hypertension, heart_disease, glucose, bmi
    apiOrder: ['age', 'hypertension', 'heart_disease', 'glucose', 'bmi'],
    fields: [
      {
        group: 'Patient Details',
        items: [
          { name: 'age',          label: 'Age',                    type: 'number', placeholder: 'e.g. 45',   min: 1,   max: 120 },
          { name: 'hypertension', label: 'Hypertension',           type: 'select', options: ['0', '1'],      optionLabels: ['0 — No', '1 — Yes'] },
          { name: 'heart_disease',label: 'Heart Disease',          type: 'select', options: ['0', '1'],      optionLabels: ['0 — No', '1 — Yes'] },
          { name: 'glucose',      label: 'Avg. Glucose (mg/dL)',   type: 'number', placeholder: 'e.g. 106', min: 50,  max: 400 },
          { name: 'bmi',          label: 'BMI',                    type: 'number', placeholder: 'e.g. 28.7',min: 10,  max: 70  },
        ],
      },
    ],
    sampleData: {
      age: 67, hypertension: '1', heart_disease: '1', glucose: 228.69, bmi: 36.6,
    },
  },

  diabetes: {
    id: 'diabetes',
    label: 'Diabetes',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    gradientFrom: '#f59e0b',
    gradientTo: '#10b981',
    // API payload order: age, hypertension, heart_disease, bmi, hba1c, glucose
    apiOrder: ['age', 'hypertension', 'heart_disease', 'bmi', 'hba1c', 'glucose'],
    fields: [
      {
        group: 'Patient Details',
        items: [
          { name: 'age',          label: 'Age',              type: 'number', placeholder: 'e.g. 45',   min: 1,  max: 120 },
          { name: 'hypertension', label: 'Hypertension',     type: 'select', options: ['0', '1'],      optionLabels: ['0 — No', '1 — Yes'] },
          { name: 'heart_disease',label: 'Heart Disease',    type: 'select', options: ['0', '1'],      optionLabels: ['0 — No', '1 — Yes'] },
          { name: 'bmi',          label: 'BMI',              type: 'number', placeholder: 'e.g. 27.3', min: 10, max: 70  },
          { name: 'hba1c',        label: 'HbA1c Level (%)',  type: 'number', placeholder: 'e.g. 6.5',  min: 3,  max: 15  },
          { name: 'glucose',      label: 'Blood Glucose (mg/dL)', type: 'number', placeholder: 'e.g. 140', min: 50, max: 400 },
        ],
      },
    ],
    sampleData: {
      age: 50, hypertension: '1', heart_disease: '0', bmi: 33.6, hba1c: 7.2, glucose: 168,
    },
  },

  heart: {
    id: 'heart',
    label: 'Heart Disease',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    gradientFrom: '#3b82f6',
    gradientTo: '#8b5cf6',
    // API payload order: age, sex, cp, trestbps, chol, thalach
    apiOrder: ['age', 'sex', 'cp', 'trestbps', 'chol', 'thalach'],
    fields: [
      {
        group: 'Patient Details',
        items: [
          { name: 'age',     label: 'Age',                       type: 'number', placeholder: 'e.g. 54',  min: 1,   max: 120 },
          { name: 'sex',     label: 'Sex',                       type: 'select', options: ['0', '1'],     optionLabels: ['0 — Female', '1 — Male'] },
          { name: 'cp',      label: 'Chest Pain Type',           type: 'select', options: ['0', '1', '2', '3'], optionLabels: ['0 — Typical angina', '1 — Atypical angina', '2 — Non-anginal pain', '3 — Asymptomatic'] },
          { name: 'trestbps',label: 'Resting Blood Pressure (mm Hg)', type: 'number', placeholder: 'e.g. 130', min: 80, max: 250 },
          { name: 'chol',    label: 'Serum Cholesterol (mg/dL)', type: 'number', placeholder: 'e.g. 250', min: 100, max: 600 },
          { name: 'thalach', label: 'Max Heart Rate Achieved',   type: 'number', placeholder: 'e.g. 150', min: 60,  max: 250 },
        ],
      },
    ],
    sampleData: {
      age: 63, sex: '1', cp: '3', trestbps: 145, chol: 233, thalach: 150,
    },
  },
};

export const getAdvice = (disease, riskLevel) => {
  const advice = {
    stroke: {
      low: [
        'Maintain a healthy blood pressure through regular monitoring',
        'Stay physically active with at least 30 minutes of exercise daily',
        'Follow a heart-healthy diet rich in fruits and vegetables',
        'Avoid smoking and limit alcohol consumption',
      ],
      medium: [
        'Consult your doctor to manage blood pressure and glucose levels',
        'Reduce sodium intake and follow a Mediterranean-style diet',
        'Monitor your weight and maintain a healthy BMI',
        'Get regular cardiovascular check-ups every 6 months',
        'Consider antiplatelet therapy if recommended by your physician',
      ],
      high: [
        'Seek immediate medical evaluation from a neurologist',
        'Strictly control hypertension with prescribed medications',
        'Eliminate smoking — it significantly amplifies stroke risk',
        'Monitor for warning signs: sudden numbness, vision changes, or confusion',
        'Follow up with your cardiologist regularly and adhere to medications',
      ],
    },
    diabetes: {
      low: [
        'Maintain healthy blood glucose levels through diet and exercise',
        'Get annual fasting glucose tests as routine screening',
        'Stay physically active — aim for 150 minutes of moderate activity per week',
        'Limit refined carbohydrates and sugary beverages',
      ],
      medium: [
        'Schedule a glucose tolerance test with your physician',
        'Follow a low glycemic index diet and reduce processed foods',
        'Monitor your weight — 5–7% weight loss can significantly reduce risk',
        'Discuss metformin or lifestyle programs with your doctor',
        'Check blood glucose regularly at home',
      ],
      high: [
        'Consult an endocrinologist promptly for a comprehensive evaluation',
        'Begin or adjust medication as prescribed by your physician',
        'Monitor blood glucose multiple times daily',
        'Work with a registered dietitian to create a personalized meal plan',
        'Watch for complications: numbness, vision changes, or slow healing wounds',
      ],
    },
    heart: {
      low: [
        'Keep cholesterol and blood pressure within healthy ranges',
        'Exercise regularly — cardio activities strengthen the heart',
        'Eat a diet low in saturated fats and high in fiber',
        'Schedule annual check-ups with your primary care physician',
      ],
      medium: [
        'Consult a cardiologist for an echocardiogram or stress test',
        'Start a medically supervised exercise program',
        'Manage stress through mindfulness, yoga, or therapy',
        'Consider statin therapy if cholesterol is elevated',
        'Quit smoking if you currently smoke — it is the single most impactful change',
      ],
      high: [
        'Seek urgent cardiology consultation immediately',
        'Undergo a full cardiac workup including ECG and echocardiogram',
        'Strictly adhere to prescribed cardiac medications',
        'Follow a cardiac rehabilitation program',
        'Know the signs of a heart attack: chest pain, shortness of breath, arm pain',
      ],
    },
  };

  return advice[disease]?.[riskLevel] ?? advice[disease]?.low ?? [];
};

export const MOCK_HISTORY = [
  { id: 1, disease: 'Diabetes', date: '2024-12-15', risk: 18, level: 'Low', result: 'No Diabetes' },
  { id: 2, disease: 'Heart Disease', date: '2024-11-28', risk: 67, level: 'High', result: 'At Risk' },
  { id: 3, disease: 'Stroke', date: '2024-11-10', risk: 34, level: 'Medium', result: 'Moderate Risk' },
  { id: 4, disease: 'Diabetes', date: '2024-10-05', risk: 12, level: 'Low', result: 'No Diabetes' },
];

