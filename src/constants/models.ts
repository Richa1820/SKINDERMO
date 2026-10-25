import { ModelInfo, LesionClassInfo, LesionClassKey } from '../types';

export const EVALUATED_MODELS: Record<string, ModelInfo> = {
  resnet50: {
    id: 'resnet50',
    name: 'ResNet-50',
    badge: 'Residual Network',
    filename: 'resnet50_best.keras',
    architecture: 'Deep Residual Learning (He et al.)',
    inputResolution: '224 × 224 × 3',
    parameters: '25.6M',
    depth: '50 layers',
    description:
      'Employs identity shortcut connections to solve vanishing gradients, preserving spatial lesion edge cues throughout 16 residual bottleneck blocks.',
    keyFeature: 'Residual identity mapping prevents degradation in deep feature spaces.',
    gradientFlow: 'Additive residual skips enable uninhibited backpropagation.',
    academicCitation: 'He, K. et al. (CVPR 2016) Deep Residual Learning for Image Recognition.',
  },
  densenet121: {
    id: 'densenet121',
    name: 'DenseNet-121',
    badge: 'Densely Connected',
    filename: 'densenet121_best.keras',
    architecture: 'Dense Convolutional Network (Huang et al.)',
    inputResolution: '224 × 224 × 3',
    parameters: '8.1M',
    depth: '121 layers',
    description:
      'Connects all layers directly to all downstream layers, encouraging substantial feature reuse and gradient flow across fine dermoscopic pigment reticula.',
    keyFeature: 'Maximum feature reuse with compact parameter footprint and narrow transition blocks.',
    gradientFlow: 'Concatenative layer skips yield composite multi-scale dermoscopy features.',
    academicCitation: 'Huang, G. et al. (CVPR 2017) Densely Connected Convolutional Networks.',
  },
  inceptionv3: {
    id: 'inceptionv3',
    name: 'Inception-V3',
    badge: 'Multi-Scale Factorized',
    filename: 'inceptionv3_best.keras',
    architecture: 'Factorized Inception Network (Szegedy et al.)',
    inputResolution: '299 × 299 × 3',
    parameters: '23.8M',
    depth: '48 layers',
    description:
      'Employs asymmetric 1×7 and 7×1 factorized convolutions and grid reduction modules to process multi-scale lesion attributes simultaneously at higher resolution.',
    keyFeature: 'Higher native spatial resolution (299×299) with multi-scale parallel receptive fields.',
    gradientFlow: 'Auxiliary classification branches and factorization reduce representational bottlenecks.',
    academicCitation: 'Szegedy, C. et al. (CVPR 2016) Rethinking the Inception Architecture for Computer Vision.',
  },
};

export const ORDERED_MODEL_KEYS = ['resnet50', 'densenet121', 'inceptionv3'] as const;

// HAM10000 7 Diagnostic Classes in exact dataset order
export const LESION_CLASSES: Record<LesionClassKey, LesionClassInfo> = {
  akiec: {
    key: 'akiec',
    code: 'akiec',
    fullName: 'Actinic Keratosis & Intraepithelial Carcinoma',
    clinicalCategory: 'Premalignant / CIS',
    severityTag: 'Moderate Risk',
    ham10000Frequency: '3.3%',
    description:
      'UV-induced keratinocytic neoplasms encompassing actinic keratoses and squamous cell carcinoma in situ (Bowen’s disease).',
    histopathology: 'Atypical keratinocytes confined to the epidermis with parakeratosis and solar elastosis.',
    visualHallmarks: ['Strawberry pattern', 'Erythematous pseudonetwork', 'Superficial scaling & rosettes'],
  },
  bcc: {
    key: 'bcc',
    code: 'bcc',
    fullName: 'Basal Cell Carcinoma',
    clinicalCategory: 'Malignant',
    severityTag: 'High Risk',
    ham10000Frequency: '5.1%',
    description:
      'Common non-melanoma skin cancer arising from the basal layer of the epidermis, locally invasive with low metastasis risk.',
    histopathology: 'Nests of basaloid cells with peripheral palisading and peritumoral stromal clefting.',
    visualHallmarks: ['Arborizing (tree-like) telangiectasias', 'Spoke-wheel areas', 'Ulceration & blue-gray ovoid nests'],
  },
  bkl: {
    key: 'bkl',
    code: 'bkl',
    fullName: 'Benign Keratosis-like Lesions',
    clinicalCategory: 'Benign',
    severityTag: 'Low Risk / Benign',
    ham10000Frequency: '11.0%',
    description:
      'Benign epithelial lesions encompassing seborrheic keratoses, solar lentigines, and lichen planus-like keratoses (LPLK).',
    histopathology: 'Hyperkeratosis, acanthosis, papillomatosis, and pseudohorn cysts.',
    visualHallmarks: ['Milky cysts & comedo-like openings', 'Brain-like (cerebriform) gyri', 'Fingerprint pattern'],
  },
  df: {
    key: 'df',
    code: 'df',
    fullName: 'Dermatofibroma',
    clinicalCategory: 'Benign',
    severityTag: 'Low Risk / Benign',
    ham10000Frequency: '1.1%',
    description:
      'Common benign cutaneous fibrohistiocytic lesion typically appearing on lower extremities, often linked to minor trauma.',
    histopathology: 'Ill-defined dermal proliferation of spindle cells surrounding thickened collagen bundles.',
    visualHallmarks: ['Central white scar-like patch', 'Delicate peripheral pigment network', 'Pinch sign positivity'],
  },
  mel: {
    key: 'mel',
    code: 'mel',
    fullName: 'Melanoma',
    clinicalCategory: 'Malignant',
    severityTag: 'High Risk',
    ham10000Frequency: '11.1%',
    description:
      'Aggressive malignancy arising from transformed melanocytes. High potential for metastasis if not excised in early stage.',
    histopathology: 'Atypical melanocytes arranged in disordered clusters with pagetoid scatter across epidermis.',
    visualHallmarks: ['Atypical pigment network', 'Irregular dots & globules', 'Blue-white veil & regression structures'],
  },
  nv: {
    key: 'nv',
    code: 'nv',
    fullName: 'Melanocytic Nevus',
    clinicalCategory: 'Benign',
    severityTag: 'Low Risk / Benign',
    ham10000Frequency: '67.0%',
    description:
      'Benign proliferation of melanocytes (moles). Represents the dominant majority class in common dermatological datasets.',
    histopathology: 'Well-circumscribed nests of uniform melanocytes exhibiting maturation toward the deep dermis.',
    visualHallmarks: ['Regular, symmetric pigment network', 'Homogeneous pigmentation', 'Peripheral globular ring (growing)'],
  },
  vasc: {
    key: 'vasc',
    code: 'vasc',
    fullName: 'Vascular Lesion',
    clinicalCategory: 'Benign',
    severityTag: 'Low Risk / Benign',
    ham10000Frequency: '1.4%',
    description:
      'Benign vascular proliferations and ectasias including cherry angiomas, angiokeratomas, and pyogenic granulomas.',
    histopathology: 'Proliferation of blood-filled vascular channels lined by benign endothelial cells.',
    visualHallmarks: ['Red, purple, or blue-black lacunae / lagunes', 'Whitish fibrous septa between vessels', 'Absence of pigment network'],
  },
};

export const ORDERED_CLASS_KEYS: LesionClassKey[] = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc'];

export const RESEARCH_DISCLAIMER_TEXT =
  'SKINDERMO is an academic research prototype for skin-lesion image classification. It is not a medical diagnostic system and must not be used to make diagnosis or treatment decisions.';
