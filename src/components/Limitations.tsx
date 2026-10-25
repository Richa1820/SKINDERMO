import React from 'react';
import { ShieldAlert, AlertTriangle, Scale, Camera, Globe2 } from 'lucide-react';
import { RESEARCH_DISCLAIMER_TEXT } from '../constants/models';
import { Badge } from './UI/Badge';

export const Limitations: React.FC = () => {
  const limitationsList = [
    {
      title: 'Class Distribution Imbalance',
      icon: <Scale className="w-5 h-5 text-forest-700" />,
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
      icon: <Camera className="w-5 h-5 text-forest-800" />,
      description:
        'Dermoscopic cameras, contact liquid immersion methods, and cross-polarized lens illumination create color calibration variances across institutions. Uncalibrated mobile phone camera photos will not yield reliable feature activations.',
    },
    {
      title: 'Demographic & Skin Phototype Bias',
      icon: <Globe2 className="w-5 h-5 text-forest-700" />,
      description:
        'Public dermoscopy archives predominantly feature fair skin types (Fitzpatrick types I–III from Australian and Austrian cohorts), limiting algorithmic generalization to higher melanin phototypes (Fitzpatrick IV–VI).',
    },
  ];

  return (
    <section id="limitations" className="py-16 sm:py-24 bg-white border-t border-charcoal-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Mandatory Academic Medical Disclaimer Box */}
        <div className="rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 p-6 sm:p-8 shadow-card mb-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-800">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                  Mandatory Academic Protocol & Disclaimer
                </span>
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">
                Non-Diagnostic Research Prototype
              </h3>
              <p className="text-base text-charcoal-800 font-medium leading-relaxed">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {limitationsList.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-canvas-50 border border-charcoal-200/80 hover:border-charcoal-300 transition-colors space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-charcoal-200 flex items-center justify-center shadow-subtle">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-charcoal-900">
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
