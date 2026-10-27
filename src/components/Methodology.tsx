import React from 'react';
import { UploadCloud, Cpu, BarChart3, CheckCircle } from 'lucide-react';
import { Badge } from './UI/Badge';

export const Methodology: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload Dermoscopic Image',
      subtitle: 'Standardized Ingestion & Format Validation',
      icon: <UploadCloud className="w-6 h-6 text-sage-700" />,
      description:
        'Upload high-magnification polarized or contact dermoscopy photographs in JPG, JPEG, or PNG format. The system computes image metadata, preserves native aspect ratio, and performs resolution validation.',
      technicalDetails: [
        'Supported extensions: .jpg, .jpeg, .png',
        'Automatic client-side dimension & file size inspection',
        'Prepares standardized RGB 3-channel input tensor',
      ],
    },
    {
      number: '02',
      title: 'Analyze via Deep CNN',
      subtitle: 'Neural Feature Extraction & Forward Pass',
      icon: <Cpu className="w-6 h-6 text-sage-700" />,
      description:
        'The selected neural architecture (ResNet-50, DenseNet-121, or Inception-V3) extracts hierarchical spatial features—from localized pigment networks to asymmetric peripheral borders—through convolutional layers.',
      technicalDetails: [
        'Native spatial scaling: 224×224 (ResNet/DenseNet) or 299×299 (Inception)',
        'Global Average Pooling compresses spatial representation maps',
        'Softmax activation calculates posterior class distribution vector',
      ],
    },
    {
      number: '03',
      title: 'Review Probability Vector',
      subtitle: '7-Class Differential Distribution Assessment',
      icon: <BarChart3 className="w-6 h-6 text-sage-700" />,
      description:
        'Examine the model’s estimated score across all seven HAM10000 diagnostic categories. Review the top predicted class, comparative margins against other classes, and academic research limitations.',
      technicalDetails: [
        'Complete probability distribution for all 7 classes',
        'Clear distinction between model score and clinical diagnosis',
        'Transparent logging of inference execution latency and model weights',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="forest" size="md" className="mb-3">
            Inference Pipeline
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            How the classification pipeline works.
          </h2>
          <p className="mt-3 text-base text-charcoal-600">
            From raw dermoscopic photograph ingestion to neural feature extraction and differential probability assessment.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl bg-canvas-50 p-6 sm:p-7 border border-charcoal-200 shadow-card flex flex-col justify-between"
            >
              {/* Step Number & Icon */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-2xl font-bold text-charcoal-300">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-white border border-charcoal-200 flex items-center justify-center text-sage-700 shadow-subtle">
                    {step.icon}
                  </div>
                </div>

                <div className="mb-3.5">
                  <span className="text-[11px] font-mono text-sage-800 font-semibold uppercase tracking-wider block">
                    {step.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-charcoal-900 mt-1">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-5">
                  {step.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="pt-4 border-t border-charcoal-200 space-y-2">
                {step.technicalDetails.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2 text-xs text-charcoal-600">
                    <CheckCircle className="w-3.5 h-3.5 text-sage-600 flex-shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
