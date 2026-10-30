import React from 'react';
import {
  ArrowRight,
  Activity,
  Microscope,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
  onExploreTechClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStartedClick, onExploreTechClick }) => {
  return (
    <section id="home" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Background soft subtle medical ambient glow */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 -z-10 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Research Narrative & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Research/AI Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-teal-900 tracking-tight">
                Academic Mini-Project • Deep Learning
              </span>
              <span className="text-teal-300 text-xs">•</span>
              <span className="text-[11px] font-mono text-teal-800">
                ResNet50 / DenseNet121 / InceptionV3
              </span>
            </div>

            {/* Required Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12]">
                AI-Powered <br className="hidden sm:inline" />
                <span className="text-teal-700 underline decoration-teal-300/60 decoration-wavy decoration-2">
                  Skin Lesion Analysis
                </span>
              </h1>
              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl font-normal">
                SKINDERMO is a medical deep learning research framework that classifies dermoscopic skin lesion images into seven diagnostic categories using transfer learning across three convolutional neural architectures: <strong>ResNet50</strong>, <strong>DenseNet121</strong>, and <strong>InceptionV3</strong>.
              </p>
            </div>

            {/* Action Buttons: "Get Started" and "Explore Technology" */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={onGetStartedClick}
                id="hero-get-started-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold text-sm shadow-card hover:bg-teal-800 active:scale-[0.99] transition-all group border border-teal-800"
              >
                <Activity className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition-transform" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreTechClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-charcoal-800 font-semibold text-sm border border-charcoal-200 hover:bg-canvas-100 active:scale-[0.99] transition-all shadow-subtle"
              >
                <Layers className="w-4 h-4 text-charcoal-600" />
                <span>Explore Architecture & Synopsis</span>
              </button>
            </div>

            {/* Research Metrics Strip */}
            <div className="pt-6 border-t border-charcoal-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  3
                </div>
                <div className="text-xs text-charcoal-700 font-semibold">CNN Architectures</div>
                <div className="text-[10px] text-charcoal-500">ResNet, DenseNet, Inception</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  7
                </div>
                <div className="text-xs text-charcoal-700 font-semibold">Diagnostic Classes</div>
                <div className="text-[10px] text-charcoal-500">MEL, NV, BCC, BKL, +3 more</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  10,015
                </div>
                <div className="text-xs text-charcoal-700 font-semibold">HAM10000 Images</div>
                <div className="text-[10px] text-charcoal-500">Dermoscopic Ground Truth</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-charcoal-900 font-mono">
                  67.58%
                </div>
                <div className="text-xs text-charcoal-700 font-semibold">Best Model Val Acc</div>
                <div className="text-[10px] text-charcoal-500">ResNet-50 Benchmark</div>
              </div>
            </div>

          </div>

          {/* Right Column: Medical-AI Illustration / Telemetry Viewport */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md lg:max-w-none">
              
              {/* Clinical Frame */}
              <div className="rounded-2xl bg-white p-5 shadow-card border border-charcoal-200/90 relative">
                
                {/* Header bar of visual viewport */}
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-charcoal-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                    <span className="font-mono text-charcoal-800 font-bold text-[11px] tracking-tight">
                      DERMOSCOPY_VIEWPORT // POLARIZED
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    HAM10000 Ground Truth
                  </span>
                </div>

                {/* Simulated Dermoscopy Chamber Viewport */}
                <div className="relative aspect-square w-full rounded-xl bg-[#101815] overflow-hidden flex items-center justify-center p-6 select-none border border-charcoal-800">
                  
                  {/* Subtle reticle rings */}
                  <div className="absolute w-60 h-60 rounded-full border border-teal-500/20 pointer-events-none" />
                  <div className="absolute w-44 h-44 rounded-full border border-dashed border-teal-400/25 pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full border border-teal-500/35 pointer-events-none" />

                  {/* Precision Reticle Crosshairs */}
                  <div className="absolute inset-x-8 top-1/2 h-[1px] bg-teal-400/20 pointer-events-none" />
                  <div className="absolute inset-y-8 left-1/2 w-[1px] bg-teal-400/20 pointer-events-none" />

                  {/* Lesion Morphology Silhouette */}
                  <div className="relative w-44 h-44 rounded-full flex items-center justify-center">
                    <div className="w-36 h-36 rounded-[44%_56%_62%_38%/48%_39%_61%_52%] bg-gradient-to-tr from-[#2a1d17] via-[#4d3427] to-[#201511] border border-amber-950/50 shadow-inner">
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#180e0a] to-[#3a2318] opacity-80" />
                      <div className="absolute top-9 left-11 w-6 h-6 rounded-full bg-[#0d0705] opacity-90" />
                      <div className="absolute inset-2 rounded-full border border-teal-400/30" />
                    </div>
                  </div>

                  {/* Scientific Telemetry Badges */}
                  <div className="absolute top-3 left-3 bg-charcoal-900/90 px-2.5 py-1 rounded-md border border-charcoal-700 text-[10px] font-mono text-teal-300">
                    RESIDUAL_BLOCK_16
                  </div>

                  <div className="absolute bottom-3 right-3 bg-charcoal-900/90 px-2.5 py-1 rounded-md border border-charcoal-700 text-[10px] font-mono text-teal-300">
                    CONV_POOL: 7×7
                  </div>

                  <div className="absolute bottom-3 left-3 bg-charcoal-900/90 px-2.5 py-1 rounded-md border border-charcoal-700 text-[10px] font-mono text-charcoal-300">
                    7 CLASSES // SOFTMAX
                  </div>
                </div>

                {/* Sub-viewport Active Architecture Indicators */}
                <div className="mt-4 pt-3.5 border-t border-charcoal-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-teal-700" />
                    <span className="font-semibold text-charcoal-700 text-[11px]">Architectures:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-900 font-mono text-[10px] font-semibold">
                      ResNet-50
                    </span>
                    <span className="px-2 py-0.5 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-700 font-mono text-[10px] font-medium">
                      DenseNet-121
                    </span>
                    <span className="px-2 py-0.5 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-700 font-mono text-[10px] font-medium">
                      Inception-V3
                    </span>
                  </div>
                </div>

                {/* Comparative Research Notice */}
                <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2.5 text-xs text-charcoal-600">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center flex-shrink-0">
                    <Microscope className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-charcoal-900">Multi-Model Comparative Inference: </span>
                    Evaluating feature representations across all 7 HAM10000 diagnostic categories.
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