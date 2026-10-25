import React from 'react';
import { EVALUATED_MODELS, ORDERED_MODEL_KEYS } from '../constants/models';
import { Box, GitBranch, Layers, CheckCircle2, FileCode, ArrowRight } from 'lucide-react';
import { Badge } from './UI/Badge';

interface ModelCardsProps {
  onSelectModelToAnalyze?: (modelKey: string) => void;
}

export const ModelCards: React.FC<ModelCardsProps> = ({ onSelectModelToAnalyze }) => {
  return (
    <section id="models" className="py-16 sm:py-20 bg-canvas-100 border-y border-charcoal-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Badge variant="forest" size="md" className="mb-3">
            Comparative Neural Architectures
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
            Three distinct deep learning backbones.
          </h2>
          <p className="mt-3 text-base text-charcoal-600 leading-relaxed">
            SKINDERMO rigorously evaluates three distinct topological paradigms in computer vision to assess how residual shortcuts, dense feature reuse, and factorized multi-scale convolutions capture complex dermatological textures.
          </p>
        </div>

        {/* 3 Model Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ORDERED_MODEL_KEYS.map((key) => {
            const model = EVALUATED_MODELS[key];
            const isDenseNet = key === 'densenet121';
            const isInception = key === 'inceptionv3';

            return (
              <div
                key={model.id}
                className="relative rounded-2xl bg-white border border-charcoal-200/90 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top architectural accent strip */}
                <div
                  className={`h-1.5 w-full ${
                    isDenseNet
                      ? 'bg-gradient-to-r from-emerald-500 to-forest-600'
                      : isInception
                      ? 'bg-gradient-to-r from-forest-700 to-charcoal-800'
                      : 'bg-gradient-to-r from-forest-900 to-emerald-600'
                  }`}
                />

                <div className="p-6 sm:p-7 space-y-5 flex-1">
                  {/* Card Header & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200/70">
                        {model.badge}
                      </span>
                      <h3 className="text-2xl font-bold text-charcoal-900 mt-2">
                        {model.name}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-canvas-100 flex items-center justify-center text-forest-900 border border-charcoal-200 group-hover:bg-forest-900 group-hover:text-emerald-400 transition-colors">
                      {isDenseNet ? (
                        <GitBranch className="w-5 h-5" />
                      ) : isInception ? (
                        <Layers className="w-5 h-5" />
                      ) : (
                        <Box className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Weight File Binding Indicator */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-canvas-50 border border-charcoal-200/70 font-mono text-xs text-charcoal-700">
                    <FileCode className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-charcoal-400">Target File:</span>
                    <span className="font-semibold text-charcoal-900 break-all">
                      {model.filename}
                    </span>
                  </div>

                  {/* Narrative Description */}
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {model.description}
                  </p>

                  {/* Architecture Specification List */}
                  <div className="space-y-2.5 pt-2 border-t border-charcoal-100 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-charcoal-50">
                      <span className="text-charcoal-500">Input Resolution</span>
                      <span className="font-mono font-semibold text-charcoal-800">
                        {model.inputResolution}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-charcoal-50">
                      <span className="text-charcoal-500">Parameter Count</span>
                      <span className="font-mono font-semibold text-charcoal-800">
                        {model.parameters}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-charcoal-50">
                      <span className="text-charcoal-500">Network Depth</span>
                      <span className="font-mono font-semibold text-charcoal-800">
                        {model.depth}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-charcoal-500">Gradient Propagation</span>
                      <span className="font-semibold text-forest-800 text-right">
                        {isDenseNet ? 'Concatenative' : isInception ? 'Auxiliary Factor' : 'Residual Skips'}
                      </span>
                    </div>
                  </div>

                  {/* Key Feature Box */}
                  <div className="p-3 rounded-xl bg-forest-50/60 border border-forest-100 text-xs text-forest-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{model.keyFeature}</span>
                  </div>
                </div>

                {/* Card Footer: Academic Citation and Action */}
                <div className="p-6 pt-0 bg-white">
                  <div className="text-[11px] text-charcoal-400 border-t border-charcoal-100 pt-3 italic">
                    {model.academicCitation}
                  </div>

                  {onSelectModelToAnalyze && (
                    <button
                      onClick={() => onSelectModelToAnalyze(model.id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-forest-900 bg-canvas-100 hover:bg-forest-900 hover:text-white transition-all border border-charcoal-200 hover:border-forest-900"
                    >
                      <span>Analyze with {model.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
