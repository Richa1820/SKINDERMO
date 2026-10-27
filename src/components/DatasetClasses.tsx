import React, { useState } from 'react';
import { LESION_CLASSES, ORDERED_CLASS_KEYS } from '../constants/models';
import { LesionClassKey } from '../types';
import { Badge } from './UI/Badge';
import { Info, AlertTriangle, Tag } from 'lucide-react';

export const DatasetClasses: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<LesionClassKey>('mel');

  const selectedClass = LESION_CLASSES[selectedKey];

  return (
    <section id="dataset" className="py-16 sm:py-24 bg-canvas-50 border-t border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <Badge variant="forest" size="md" className="mb-3">
            HAM10000 Diagnostic Benchmark
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            Seven target dermatological classes.
          </h2>
          <p className="mt-3 text-base text-charcoal-600 leading-relaxed">
            The models are trained and evaluated on the ground-truth HAM10000 ("Human Against Machine with 10,000 training images") benchmark dataset, representing the spectrum of pigmented skin lesions encountered in clinical dermatology.
          </p>
        </div>

        {/* Classes Selector Grid & Detailed Inspection Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Class Selector List (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-charcoal-500 px-1 mb-2">
              Select class to inspect clinical taxonomy:
            </div>

            {ORDERED_CLASS_KEYS.map((key) => {
              const cls = LESION_CLASSES[key];
              const isSelected = selectedKey === key;
              const isMalignant = cls.clinicalCategory === 'Malignant';
              const isPremalignant = cls.clinicalCategory === 'Premalignant / CIS';

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-sage-600 shadow-card ring-1 ring-sage-600'
                      : 'bg-white hover:bg-canvas-100 border-charcoal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-charcoal-900 text-white'
                          : 'bg-canvas-200 text-charcoal-700'
                      }`}
                    >
                      {cls.code}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-charcoal-900">
                        {cls.fullName}
                      </div>
                      <div className="text-[11px] text-charcoal-500">
                        Prevalence in HAM10000: <span className="font-mono font-medium text-charcoal-800">{cls.ham10000Frequency}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      isMalignant
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isPremalignant
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-sage-50 text-sage-800 border-sage-200'
                    }`}
                  >
                    {cls.clinicalCategory}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Card (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-7 border border-charcoal-200 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-charcoal-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold px-3 py-1 bg-charcoal-900 text-white rounded-md">
                  {selectedClass.code}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-charcoal-900">
                    {selectedClass.fullName}
                  </h3>
                  <div className="text-xs text-charcoal-500 font-mono">
                    Category: {selectedClass.clinicalCategory} • Risk: {selectedClass.severityTag}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-charcoal-400 font-mono">Dataset Frequency</div>
                <div className="text-2xl font-bold text-charcoal-900 font-mono">
                  {selectedClass.ham10000Frequency}
                </div>
              </div>
            </div>

            {/* Description & Clinical Context */}
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-500 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sage-700" />
                  Clinical Pathology Overview
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                  {selectedClass.description}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-canvas-50 border border-charcoal-200 text-xs">
                <span className="font-semibold text-charcoal-900 block mb-1">
                  Histopathological Confirmation:
                </span>
                <span className="text-charcoal-600 italic">
                  {selectedClass.histopathology}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-500 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-sage-700" />
                  Key Dermoscopic Hallmarks & Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedClass.visualHallmarks.map((hallmark, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-2.5 rounded-md bg-sage-50 border border-sage-200 text-xs text-sage-900 font-medium"
                    >
                      {hallmark}
                    </div>
                  ))}
                </div>
              </div>

              {/* Class Imbalance Advisory */}
              {selectedClass.key === 'nv' ? (
                <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Severe Dataset Imbalance Notice: </span>
                    Melanocytic Nevus (nv) comprises 67.0% of all training samples. Deep models can develop a high prior bias toward this class without focal loss or class-weighted training.
                  </div>
                </div>
              ) : selectedClass.key === 'df' || selectedClass.key === 'vasc' ? (
                <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Low Sample Support Notice: </span>
                    This class represents only ~1% of the dataset, posing few-shot generalization challenges for deep convolutional layers.
                  </div>
                </div>
              ) : null}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
