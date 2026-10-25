import React from 'react';
import { BrandLogo } from './UI/BrandLogo';
import { ShieldCheck } from 'lucide-react';
import { RESEARCH_DISCLAIMER_TEXT } from '../constants/models';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-forest-950 text-forest-200 border-t border-forest-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand and Mission */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo size="lg" className="text-white" />
            <p className="text-xs sm:text-sm text-forest-300 leading-relaxed max-w-sm">
              SKINDERMO is an academic skin lesion classification research prototype comparing ResNet50, DenseNet121, and InceptionV3 deep convolutional networks on the HAM10000 dermatological benchmark.
            </p>
            <div className="flex items-center gap-2 text-xs text-forest-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>FastAPI + Keras .keras Weight Pipelines</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-forest-400 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-forest-300">
              <li>
                <a href="#overview" className="hover:text-white transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  Deep Models
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Methodology
                </a>
              </li>
              <li>
                <a href="#dataset" className="hover:text-white transition-colors">
                  Diagnostic Classes
                </a>
              </li>
              <li>
                <a href="#limitations" className="hover:text-white transition-colors">
                  Research Limitations
                </a>
              </li>
            </ul>
          </div>

          {/* Benchmark Reference */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-forest-400 font-semibold">
              Research & Benchmark Citation
            </h4>
            <div className="p-3.5 rounded-xl bg-forest-900/60 border border-forest-800 text-xs text-forest-300 space-y-1.5 font-mono">
              <div className="text-white font-medium">HAM10000 Dataset:</div>
              <p className="text-[11px] leading-relaxed text-forest-300">
                Tschandl, P., Rosendahl, C. & Kittler, H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Sci Data 5, 180161 (2018).
              </p>
            </div>
          </div>

        </div>

        {/* Mandatory Research Protocol Strip */}
        <div className="pt-8 border-t border-forest-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-forest-400 text-center md:text-left">
          <div className="flex items-center gap-2 max-w-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px]">
              {RESEARCH_DISCLAIMER_TEXT}
            </span>
          </div>

          <div className="text-[11px] font-mono text-forest-500">
            College Research Project • Final Year Engineering
          </div>
        </div>

      </div>
    </footer>
  );
};
