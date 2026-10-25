import React from 'react';
import { ArrowRight, Activity, Microscope, Cpu, Layers } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onCompareClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onCompareClick }) => {
  return (
    <section id="overview" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-forest-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Research Narrative & CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Small Research/AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 shadow-subtle">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-semibold text-forest-900 tracking-wide">
                Deep Learning Dermoscopy Research
              </span>
              <span className="text-forest-400 text-xs">•</span>
              <span className="text-[11px] font-mono text-forest-700">
                ResNet50 / DenseNet121 / InceptionV3
              </span>
            </div>

            {/* Compelling Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12]">
                A closer look at{' '}
                <span className="relative inline-block text-forest-900">
                  skin lesion
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-3 text-emerald-400/50 -z-10"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,15 Q50,0 100,12" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>{' '}
                classification.
              </h1>
              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl font-normal">
                SKINDERMO is an academic AI research system designed to evaluate and compare three deep convolutional architectures for the automated differential classification of pigmented skin lesions across the seven standard HAM10000 diagnostic categories.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={onExploreClick}
                id="hero-explore-btn"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-forest-900 text-white font-semibold text-sm shadow-card hover:bg-forest-800 active:scale-[0.98] transition-all group border border-forest-700/60"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Launch Analysis Workspace</span>
                <ArrowRight className="w-4 h-4 text-forest-300 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                onClick={onCompareClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-charcoal-800 font-medium text-sm border border-charcoal-200/90 hover:bg-canvas-100 hover:border-charcoal-300 active:scale-[0.98] transition-all shadow-subtle"
              >
                <Layers className="w-4 h-4 text-forest-700" />
                <span>Review Model Architectures</span>
              </button>
            </div>

            {/* Research Metrics Strip */}
            <div className="pt-4 border-t border-charcoal-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-forest-950 font-mono">
                  3
                </div>
                <div className="text-xs text-charcoal-500 font-medium">Evaluated Models</div>
                <div className="text-[10px] text-charcoal-400">ResNet, DenseNet, Inception</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-forest-950 font-mono">
                  7
                </div>
                <div className="text-xs text-charcoal-500 font-medium">Diagnostic Classes</div>
                <div className="text-[10px] text-charcoal-400">Melanoma to Benign Nevi</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-forest-950 font-mono">
                  10,015
                </div>
                <div className="text-xs text-charcoal-500 font-medium">Benchmark Images</div>
                <div className="text-[10px] text-charcoal-400">HAM10000 Ground Truth</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-forest-950 font-mono">
                  224 / 299
                </div>
                <div className="text-xs text-charcoal-500 font-medium">Spatial Resolutions</div>
                <div className="text-[10px] text-charcoal-400">Native RGB Tensors</div>
              </div>
            </div>

          </div>

          {/* Right Column: Custom Dermoscopic AI Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Clinical Frame */}
              <div className="relative rounded-3xl bg-white p-4 sm:p-5 shadow-elevated border border-charcoal-200/90 overflow-hidden">
                
                {/* Header bar of visual viewport */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-charcoal-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-charcoal-800 font-semibold text-[11px] tracking-tight">
                      DERMOSCOPY_VIEWPORT // 0.85× POLARIZED
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-charcoal-400 bg-canvas-100 px-2 py-0.5 rounded">
                    FOV: 22.4 mm
                  </span>
                </div>

                {/* Simulated Dermoscopy Chamber Viewport */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#182320] to-[#0A1210] overflow-hidden flex items-center justify-center p-6 select-none shadow-inner">
                  
                  {/* Subtle dermoscopic lighting ring */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(40,109,83,0.18)_0%,_rgba(10,32,25,0.85)_70%,_rgba(5,15,12,0.98)_100%)] pointer-events-none" />
                  
                  {/* Optical grid coordinates */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  {/* Concentric Calibration Reticle Rings */}
                  <div className="absolute w-64 h-64 rounded-full border border-forest-500/25 animate-spin-slow pointer-events-none" />
                  <div className="absolute w-48 h-48 rounded-full border border-dashed border-emerald-400/30 pointer-events-none" />
                  <div className="absolute w-32 h-32 rounded-full border border-forest-400/40 pointer-events-none" />

                  {/* Precision Reticle Crosshairs */}
                  <div className="absolute inset-x-8 top-1/2 h-[1px] bg-emerald-400/25 pointer-events-none" />
                  <div className="absolute inset-y-8 left-1/2 w-[1px] bg-emerald-400/25 pointer-events-none" />

                  {/* Lesion Silhouette & Neural Feature Activation Contours */}
                  <div className="relative w-44 h-44 rounded-full flex items-center justify-center">
                    {/* Simulated lesion boundary with irregular pigment network */}
                    <div className="w-36 h-36 rounded-[44%_56%_62%_38%/48%_39%_61%_52%] bg-gradient-to-tr from-[#382a22] via-[#543b2f] to-[#2b1f1a] shadow-lg border border-amber-900/40 opacity-90 transition-transform duration-700 hover:scale-105">
                      {/* Internal pigment texture nodes */}
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#23150f] to-[#402a1e] opacity-80" />
                      <div className="absolute top-10 left-12 w-6 h-6 rounded-full bg-[#170e0a] opacity-90" />
                      
                      {/* Multi-scale neural attention overlay (cyan/mint) */}
                      <div className="absolute inset-2 rounded-full border border-emerald-400/40 opacity-70 animate-pulse-subtle" />
                    </div>

                    {/* Animated Scanning Beam */}
                    <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-line pointer-events-none" />
                  </div>

                  {/* Floating In-Viewport Telemetry Pins */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-emerald-300">
                    RESIDUAL_BLOCK_16
                  </div>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-emerald-300">
                    CONV_POOL: 7×7
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-forest-200">
                    CHANNELS: 2048
                  </div>
                </div>

                {/* Sub-viewport Live Architecture Badges */}
                <div className="mt-3.5 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-forest-700" />
                    <span className="font-medium text-charcoal-700 text-[11px]">Active Pipelines:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-forest-50 border border-forest-200 text-forest-800 font-mono text-[10px] font-medium">
                      ResNet50
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-medium">
                      DenseNet121
                    </span>
                    <span className="px-2 py-0.5 rounded bg-canvas-200 border border-charcoal-200 text-charcoal-700 font-mono text-[10px] font-medium">
                      InceptionV3
                    </span>
                  </div>
                </div>

              </div>

              {/* Refined Floating Overlay Card: Classification Target Notice */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-elevated border border-charcoal-200/90 items-center gap-3 max-w-xs">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Microscope className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-charcoal-900">Comparative Inference</div>
                  <div className="text-charcoal-500 text-[11px] leading-tight">
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
