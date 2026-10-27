import React from 'react';
import { ArrowRight, Activity, Microscope, Cpu, Layers } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onCompareClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onCompareClick }) => {
  return (
    <section id="overview" className="relative pt-8 pb-14 lg:pt-12 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Research Narrative & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Research/AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sage-50 border border-sage-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-600"></span>
              <span className="text-xs font-semibold text-sage-900 tracking-tight">
                Deep Learning Dermoscopy Research
              </span>
              <span className="text-sage-300 text-xs">•</span>
              <span className="text-[11px] font-mono text-sage-700">
                ResNet50 / DenseNet121 / InceptionV3
              </span>
            </div>

            {/* Compelling Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12]">
                A closer look at{' '}
                <span className="text-sage-700">
                  skin lesion
                </span>{' '}
                classification.
              </h1>
              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl font-normal">
                SKINDERMO is an academic AI research system designed to evaluate and compare three deep convolutional architectures for the automated differential classification of pigmented skin lesions across the seven standard HAM10000 diagnostic categories.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={onExploreClick}
                id="hero-explore-btn"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white font-semibold text-xs shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all group border border-charcoal-800"
              >
                <Activity className="w-3.5 h-3.5 text-sage-400" />
                <span>Launch Analysis Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </button>

              <button
                onClick={onCompareClick}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-charcoal-800 font-medium text-xs border border-charcoal-200 hover:bg-canvas-100 active:scale-[0.99] transition-all shadow-subtle"
              >
                <Layers className="w-3.5 h-3.5 text-charcoal-600" />
                <span>Review Model Architectures</span>
              </button>
            </div>

            {/* Research Metrics Strip */}
            <div className="pt-6 border-t border-charcoal-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  3
                </div>
                <div className="text-xs text-charcoal-600 font-medium">Evaluated Models</div>
                <div className="text-[10px] text-charcoal-400">ResNet, DenseNet, Inception</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  7
                </div>
                <div className="text-xs text-charcoal-600 font-medium">Diagnostic Classes</div>
                <div className="text-[10px] text-charcoal-400">Melanoma to Benign Nevi</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  10,015
                </div>
                <div className="text-xs text-charcoal-600 font-medium">Benchmark Images</div>
                <div className="text-[10px] text-charcoal-400">HAM10000 Ground Truth</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  224 / 299
                </div>
                <div className="text-xs text-charcoal-600 font-medium">Spatial Resolutions</div>
                <div className="text-[10px] text-charcoal-400">Native RGB Tensors</div>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Medical Research Dermoscopy Panel */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Clinical Frame */}
              <div className="rounded-xl bg-white p-5 shadow-card border border-charcoal-200">
                
                {/* Header bar of visual viewport */}
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-charcoal-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sage-600" />
                    <span className="font-mono text-charcoal-700 font-semibold text-[11px] tracking-tight">
                      DERMOSCOPY_VIEWPORT // POLARIZED
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-charcoal-500 bg-canvas-100 px-2 py-0.5 rounded border border-charcoal-200">
                    FOV: 22.4 mm
                  </span>
                </div>

                {/* Simulated Dermoscopy Chamber Viewport */}
                <div className="relative aspect-square w-full rounded-lg bg-[#141d1a] overflow-hidden flex items-center justify-center p-6 select-none border border-charcoal-800">
                  
                  {/* Subtle reticle rings */}
                  <div className="absolute w-56 h-56 rounded-full border border-sage-500/20 pointer-events-none" />
                  <div className="absolute w-40 h-40 rounded-full border border-dashed border-sage-400/25 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full border border-sage-500/30 pointer-events-none" />

                  {/* Precision Reticle Crosshairs */}
                  <div className="absolute inset-x-8 top-1/2 h-[1px] bg-sage-400/20 pointer-events-none" />
                  <div className="absolute inset-y-8 left-1/2 w-[1px] bg-sage-400/20 pointer-events-none" />

                  {/* Lesion Morphology Silhouette */}
                  <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 rounded-[44%_56%_62%_38%/48%_39%_61%_52%] bg-gradient-to-tr from-[#2d211b] via-[#483328] to-[#251b16] border border-amber-950/50 shadow-md">
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#1a100c] to-[#362217] opacity-80" />
                      <div className="absolute top-9 left-10 w-5 h-5 rounded-full bg-[#120b08] opacity-90" />
                      <div className="absolute inset-2 rounded-full border border-sage-400/30" />
                    </div>
                  </div>

                  {/* Scientific Telemetry Badges */}
                  <div className="absolute top-3 left-3 bg-charcoal-900/80 px-2 py-0.5 rounded border border-charcoal-700 text-[10px] font-mono text-sage-300">
                    RESIDUAL_BLOCK_16
                  </div>

                  <div className="absolute bottom-3 right-3 bg-charcoal-900/80 px-2 py-0.5 rounded border border-charcoal-700 text-[10px] font-mono text-sage-300">
                    CONV_POOL: 7×7
                  </div>

                  <div className="absolute bottom-3 left-3 bg-charcoal-900/80 px-2 py-0.5 rounded border border-charcoal-700 text-[10px] font-mono text-charcoal-300">
                    CHANNELS: 2048
                  </div>
                </div>

                {/* Sub-viewport Active Architecture Indicators */}
                <div className="mt-3.5 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-charcoal-600" />
                    <span className="font-medium text-charcoal-600 text-[11px]">Active Pipelines:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-700 font-mono text-[10px] font-medium">
                      ResNet50
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sage-50 border border-sage-200 text-sage-800 font-mono text-[10px] font-medium">
                      DenseNet121
                    </span>
                    <span className="px-2 py-0.5 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-700 font-mono text-[10px] font-medium">
                      InceptionV3
                    </span>
                  </div>
                </div>

                {/* Refined Research Notice Strip */}
                <div className="mt-3.5 pt-3 border-t border-charcoal-100 flex items-center gap-2.5 text-xs text-charcoal-600">
                  <div className="w-7 h-7 rounded-md bg-sage-50 text-sage-700 border border-sage-200 flex items-center justify-center flex-shrink-0">
                    <Microscope className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-charcoal-900">Comparative Inference: </span>
                    Evaluating feature representations across 7 HAM10000 diagnostic categories.
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
