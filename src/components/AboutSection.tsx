import React from 'react';
import {
  AlertCircle,
  Target,
  Database,
  Layers,
  CheckCircle2,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from './UI/Badge';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-t border-charcoal-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <Badge variant="forest" size="md" className="mb-3">
            Academic Project Synopsis
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            About the SKINDERMO Research Framework.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-charcoal-600 leading-relaxed">
            SKINDERMO (A Novel AI-Based Skin Disease Detection System) is an undergraduate academic mini-project developed to investigate the clinical efficacy of deep convolutional neural networks in classifying pigmented skin lesions.
          </p>
        </div>

        {/* 1. Problem Statement & Objectives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Problem Statement Card */}
          <div className="rounded-2xl bg-canvas-50 p-6 sm:p-8 border border-charcoal-200 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-5 shadow-subtle">
                <AlertCircle className="w-5 h-5 text-teal-700" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block mb-1">
                Clinical Context & Urgency
              </span>
              <h3 className="text-xl font-bold text-charcoal-900 mb-3">
                Problem Statement
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed space-y-3">
                Skin cancer represents one of the fastest-growing malignancies worldwide, with malignant melanoma causing the vast majority of skin cancer deaths despite being highly curable when excised in early stages. 
              </p>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mt-3">
                However, early clinical diagnosis by visual inspection or standard dermoscopy requires extensive specialized dermatological training and exhibits notable inter-observer variability. Dermatologists face considerable challenges differentiating early-stage malignant melanoma (MEL) and basal cell carcinoma (BCC) from common benign melanocytic nevi (NV) or seborrheic keratoses (BKL).
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-charcoal-200 text-xs text-charcoal-500 font-mono">
              Key Goal: Computer-Aided Diagnostic (CAD) differential screening assistance.
            </div>
          </div>

          {/* Objectives Card */}
          <div className="rounded-2xl bg-canvas-50 p-6 sm:p-8 border border-charcoal-200 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-5 shadow-subtle">
                <Target className="w-5 h-5 text-teal-700" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block mb-1">
                Research Scope & Milestones
              </span>
              <h3 className="text-xl font-bold text-charcoal-900 mb-3">
                Project Objectives
              </h3>
              
              <ul className="space-y-3 text-xs sm:text-sm text-charcoal-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Class CNN Classification:</strong> Train deep convolutional backbones to categorize dermoscopic photographs across all seven HAM10000 diagnostic classes.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Architectural Benchmarking:</strong> Conduct a rigorous comparative study between three distinct topological paradigms: ResNet-50, DenseNet-121, and Inception-V3.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Empirical Evaluation:</strong> Establish honest, reproducible validation metrics (accuracy, weighted F1, macro recall) on held-out test splits without synthetic or unverified claims.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Clinical-Grade Interface:</strong> Construct a modern, intuitive web application for instant inference, model switching, and probability breakdown inspection.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-charcoal-200 text-xs text-charcoal-500 font-mono">
              Academic mini-project implementation using Python, FastAPI, TensorFlow/Keras & React.
            </div>
          </div>

        </div>

        {/* 2. HAM10000 Dataset Synopsis */}
        <div className="rounded-2xl bg-white border border-charcoal-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 block mb-1">
                Benchmark Training Corpus
              </span>
              <h3 className="text-2xl font-bold text-charcoal-900">
                The HAM10000 Dermoscopic Dataset
              </h3>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 self-start sm:self-auto font-semibold">
              10,015 Dermatological Images
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Multi-Source Acquisition</span>
              </h4>
              <p>
                The HAM10000 ("Human Against Machine with 10,000 training images") dataset was collected by the Medical University of Vienna and the skin cancer practice of Cliff Rosendahl in Queensland, Australia, capturing cases across different populations and acquisition modalities.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                <span>Ground-Truth Verification</span>
              </h4>
              <p>
                More than 50% of lesions in the dataset are confirmed via formal histopathology (the clinical gold standard), while the remainder are verified through expert consensus or expert follow-up monitoring.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-charcoal-900 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Real-World Class Imbalance</span>
              </h4>
              <p>
                The dataset mirrors real clinical distribution where benign melanocytic nevi (NV) constitute 67.0% (6,705 images), while rare conditions like dermatofibroma (DF) account for only 1.1% (115 images), necessitating careful evaluation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
