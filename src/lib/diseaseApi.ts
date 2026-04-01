import { DiagnosisResult } from '@/components/DiagnosisResultCard';

// Disease information database
const diseaseInfo: Record<string, Omit<DiagnosisResult, 'disease' | 'confidence' | 'severity'>> = {
  'Anthracnose': {
    description: 'Anthracnose is a fungal disease caused by Colletotrichum gloeosporioides. It affects leaves, flowers, and fruits, causing dark, sunken lesions that can lead to significant crop losses during humid conditions.',
    treatment: [
      'Apply copper-based fungicides (Bordeaux mixture 1%)',
      'Spray Carbendazim (0.1%) or Mancozeb (0.25%)',
      'Remove and destroy infected plant parts',
      'Apply systemic fungicides during flowering'
    ],
    prevention: [
      'Ensure proper spacing between trees for air circulation',
      'Avoid overhead irrigation',
      'Apply preventive fungicide sprays before monsoon',
      'Maintain orchard hygiene by removing fallen debris'
    ]
  },
  'Bacterial Canker': {
    description: 'Bacterial canker is caused by Xanthomonas campestris pv. mangiferaeindicae. It produces raised, corky lesions on leaves, stems, and fruits with characteristic oozing of gummy substances during humid weather.',
    treatment: [
      'Prune and destroy infected branches',
      'Apply Streptocycline (500 ppm) spray',
      'Use copper oxychloride (0.3%) sprays',
      'Apply bactericides at 15-day intervals'
    ],
    prevention: [
      'Use disease-free planting material',
      'Avoid injuries during harvesting',
      'Disinfect pruning tools between trees',
      'Improve drainage in the orchard'
    ]
  },
  'Cutting Weevil': {
    description: 'Cutting weevil (Deporaus marginatus) is an insect pest that cuts young shoots and leaves, causing them to droop and dry. Adults make characteristic curved cuts on tender shoots.',
    treatment: [
      'Spray Carbaryl (0.2%) or Quinalphos (0.05%)',
      'Collect and destroy fallen shoot cuttings',
      'Apply systemic insecticides during new flush',
      'Use sticky traps around the tree base'
    ],
    prevention: [
      'Remove and destroy fallen shoot pieces regularly',
      'Maintain clean orchard floor',
      'Apply soil drenching insecticides',
      'Monitor for adult weevils during flush periods'
    ]
  },
  'Die Back': {
    description: 'Die back disease is caused by Lasiodiplodia theobromae fungus. It causes progressive drying and death of twigs from tip downwards, with characteristic brown discoloration of vascular tissues.',
    treatment: [
      'Prune affected branches 15cm below visible symptoms',
      'Apply copper fungicide paste on cut ends',
      'Spray Carbendazim (0.1%) on affected areas',
      'Apply wound dressing after pruning'
    ],
    prevention: [
      'Avoid water stress during critical periods',
      'Ensure proper nutrition with balanced fertilizers',
      'Protect trees from sunburn and mechanical injuries',
      'Improve soil drainage'
    ]
  },
  'Gall Midge': {
    description: 'Gall midge (Procontarinia matteiana) is a serious pest causing gall formation on leaves, flowers, and young fruits. Infested parts become distorted and eventually drop off.',
    treatment: [
      'Spray Dimethoate (0.03%) or Monocrotophos (0.04%)',
      'Apply neem-based insecticides',
      'Use pheromone traps for monitoring',
      'Remove and destroy infested plant parts'
    ],
    prevention: [
      'Deep ploughing to destroy pupae in soil',
      'Apply soil treatment before monsoon',
      'Remove alternate host plants near orchard',
      'Maintain proper spacing for ventilation'
    ]
  },
  'Healthy': {
    description: 'The mango leaf appears healthy with no visible signs of disease or pest damage. The leaf shows normal green coloration, proper texture, and healthy vascular structure.',
    treatment: [],
    prevention: [
      'Continue regular monitoring for early detection',
      'Maintain balanced nutrition program',
      'Follow integrated pest management practices',
      'Ensure proper irrigation and drainage'
    ]
  },
  'Powdery Mildew': {
    description: 'Powdery mildew is caused by Oidium mangiferae fungus. It produces white powdery growth on leaves, flowers, and young fruits, severely affecting fruit set and quality.',
    treatment: [
      'Spray wettable Sulphur (0.2%) or Karathane (0.1%)',
      'Apply Tridemorph (0.1%) during flowering',
      'Use systemic fungicides like Hexaconazole (0.1%)',
      'Repeat sprays at 10-15 day intervals'
    ],
    prevention: [
      'Avoid dense planting and ensure ventilation',
      'Remove and destroy infected flowers',
      'Apply preventive sprays before flowering',
      'Maintain proper tree nutrition'
    ]
  },
  'Sooty Mould': {
    description: 'Sooty mould is a black fungal growth that develops on honeydew secreted by sap-sucking insects like hoppers and scale insects. It blocks sunlight and reduces photosynthesis.',
    treatment: [
      'Control the underlying insect pest first',
      'Spray Monocrotophos (0.04%) for hoppers',
      'Wash leaves with water or starch solution',
      'Apply neem oil spray (2%) for insect control'
    ],
    prevention: [
      'Monitor and control hopper populations',
      'Maintain ant populations that prey on hoppers',
      'Ensure proper tree spacing for air circulation',
      'Apply systemic insecticides prophylactically'
    ]
  }
};

// Real API call to your Python backend (Flask/FastAPI)
export const analyzeImage = async (file: File): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREDICT}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Get additional info from our local database
  const info = diseaseInfo[data.disease] || diseaseInfo['Healthy'];
  
  return {
    disease: data.disease,
    confidence: Number(data.confidence) || 0.75,     // make sure it's a number
    severity: data.severity || 'medium',             // fallback
    ...info
  };
};

// API configuration for connecting to Python backend
export const API_CONFIG = {
  // Change this to your Flask/FastAPI server URL
  BASE_URL: 'http://192.168.0.26:5000',
  ENDPOINTS: {
    PREDICT: '/predict',
    HEALTH: '/health'
  }
};

// Real API call function (for when Python backend is running)
export const analyzeImageWithAPI = async (file: File): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREDICT}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }
  
  const data = await response.json();
  
  // Map API response to DiagnosisResult format
  const info = diseaseInfo[data.disease] || diseaseInfo['Healthy'];
  
  return {
    disease: data.disease,
    confidence: data.confidence,
    severity: data.severity || 'medium',
    ...info
  };
};
