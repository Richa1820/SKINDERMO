import React from 'react';
import { ShieldAlert, AlertTriangle, Scale, Camera, Globe2 } from 'lucide-react';
import { RESEARCH_DISCLAIMER_TEXT } from '../constants/models';
import { Badge } from './UI/Badge';

export const Limitations: React.FC = () => {
  const limitationsList = [
    {
      title: 'Class Distribution Imbalance',
      icon: <Scale className="w-5 h-5 text-sage-700" />,
      description:
        'Melanocytic nevi (nv) account for 67% of the reference HAM10000 benchmark, whereas rare classes such as dermatofibroma (df, 1.1%) and vascular lesions (vasc, 1.4%) have drastically limited sample sizes. Consequently, models may show high overall accuracy while exhibiting lower sensitivity on under-represented classes.',
    },
    {
      title: 'Per-Class Performance Variance',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      description:
        'Differential diagnosis between early-stage melanoma (mel) and atypical benign keratoses (bkl) or dysplastic nevi remains difficult even for high-capacity networks due to overlapping morphologic hallmarks and high intra-class variance.',
    },
    {
      title: 'Hardware & Sensor Domain Shift',
      icon: <Camera className="w-5 h-5 text-sage-700" />,
      description:
        'Dermoscopic cameras, contact liquid immersion methods, and cross-polarized lens illumination create color calibration variances across institutions. Uncalibrated mobile phone camera photos will not yield reliable feature activations.',
    },
    {
      title: 'Demographic & Skin Phototype Bias',
      icon: <Globe2 className="w-5 h-5 text-sage-700" />,
      description:
        'Public dermoscopy archives predominantly feature fair skin types (Fitzpatrick types I–III from Australian and Austrian cohorts), limiting algorithmic generalization to higher melanin phototypes (Fitzpatrick IV–VI).',
    },
    {
      title: 'Closed-Set Bounds & Unsupported Images (e.g. Ringworm)',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      description:
        'The models are strictly closed-set classifiers restricted to seven HAM10000 classes (akiec, bcc, bkl, df, mel, nv, vasc). When presented with unsupported conditions such as ringworm (tinea corporis), eczema, or rashes, softmax normalizes outputs to sum to 1.0, inevitably assigning the image to one of the seven classes. While low-confidence thresholding provides a helpful warning, confidence thresholds do not reliably detect all unsupported or out-of-distribution images.',
    },
  ];

  return (
    <section id="limitations" className="py-16 sm:py-24 bg-white border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Mandatory Academic Medical Disclaimer Box */}
        <div className="rounded-xl bg-canvas-50 border border-charcoal-200 p-6 sm:p-7 shadow-card mb-14">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-sage-100 text-sage-800 border border-sage-200 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-charcoal-700 bg-canvas-200 px-2 py-0.5 rounded border border-charcoal-300">
                  Mandatory Academic Protocol & Disclaimer
                </span>
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">
                Non-Diagnostic Research Prototype
              </h3>
              <p className="text-sm sm:text-base text-charcoal-800 font-medium leading-relaxed">
                "{RESEARCH_DISCLAIMER_TEXT}"
              </p>
              <p className="text-xs text-charcoal-600 leading-relaxed pt-1">
                The predictions, posterior probability distributions, and architectural metrics rendered by SKINDERMO represent experimental outputs of deep learning models under academic evaluation. They have not been clinically validated, FDA/CE certified, or approved for diagnostic screening. Any suspicious skin lesion must be evaluated in person by a board-certified dermatologist using full clinical history, dermatoscopy, and histopathology.
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <Badge variant="forest" size="md" className="mb-3">
            Algorithmic Limitations
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            Research constraints and methodological scope.
          </h2>
          <p className="mt-3 text-base text-charcoal-600 leading-relaxed">
            Honest reporting of failure modes, per-class sensitivity drops, and data limitations is essential for responsible artificial intelligence in healthcare research.
          </p>
        </div>

        {/* 4 Limitations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {limitationsList.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-canvas-50 border border-charcoal-200 hover:border-charcoal-300 transition-colors space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-charcoal-200 flex items-center justify-center text-sage-700 shadow-subtle">
                  {item.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-charcoal-900">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
