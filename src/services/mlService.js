import axios from 'axios';

const ML_SERVICE_URL = process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:5001';

// Image preprocessing utilities
export const imageToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const canvasToBase64 = (canvas) => {
  return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
};

// ML Service API calls
export const mlService = {
  // Health check
  getStatus: () =>
    axios.get(`${ML_SERVICE_URL}/health`),

  getMLStatus: () =>
    axios.get(`${ML_SERVICE_URL}/ml-status`),

  // Detect bottles in image
  detectBottles: (imageBase64) =>
    axios.post(`${ML_SERVICE_URL}/detect-bottles`, {
      image: imageBase64
    }),

  // Assess bottle condition
  assessCondition: (imageBase64) =>
    axios.post(`${ML_SERVICE_URL}/assess-condition`, {
      image: imageBase64
    }),

  // Estimate bottle size
  estimateBottleSize: (imageBase64, bottleBox) =>
    axios.post(`${ML_SERVICE_URL}/estimate-bottle-size`, {
      image: imageBase64,
      bottle_box: bottleBox
    }),

  // Complete image analysis
  analyzeImage: (imageBase64) =>
    axios.post(`${ML_SERVICE_URL}/analyze-image`, {
      image: imageBase64
    })
};

// Utility functions for ML results
export const interpretCondition = (condition) => {
  const conditionMap = {
    'good': {
      emoji: '✓',
      color: '#10b981',
      message: 'Excellent condition',
      acceptance: 100
    },
    'minor_damage': {
      emoji: '⚠',
      color: '#f59e0b',
      message: 'Minor damage detected',
      acceptance: 70
    },
    'major_damage': {
      emoji: '✗',
      color: '#ef4444',
      message: 'Major damage detected',
      acceptance: 20
    },
    'unusable': {
      emoji: '✗',
      color: '#7f1d1d',
      message: 'Not suitable for reuse',
      acceptance: 0
    }
  };

  return conditionMap[condition] || { emoji: '?', color: '#gray', message: 'Unknown', acceptance: 50 };
};

export const getSizeConfidenceLabel = (confidence) => {
  if (confidence > 0.8) return 'Very High';
  if (confidence > 0.6) return 'High';
  if (confidence > 0.4) return 'Moderate';
  return 'Low - Verify Manually';
};
