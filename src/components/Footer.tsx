import React from 'react';
import { BrandLogo } from './UI/BrandLogo';
import { ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { RESEARCH_DISCLAIMER_TEXT } from '../constants/models';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-charcoal-950 text-charcoal-300 border-t border-charcoal-800 pt-14 pb-10 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand and Mission */}
          <div className="md:col-span-4 space-y-4">
            <BrandLogo size="md" className="text-white" />
            <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed max-w-sm">
              SKINDERMO – A Novel AI-Based Skin Disease Detection System. An undergraduate academic mini-project that uses deep convolutional neural networks to classify dermoscopic skin lesion images into seven HAM10000 diagnostic categories.
            </p>
            <div className="flex items-center gap-2 text-xs text-charcoal-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>React + TypeScript + Vite + FastAPI + TensorFlow/Keras</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-400 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#workspace" className="hover:text-white transition-colors">
                  Prediction
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#technology" className="hover:text-white transition-colors">
                  Technology
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-400 font-semibold">
              Academic & Contact
            </h4>
            <div className="space-y-2.5 text-xs text-charcoal-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span>Department of Computer Science & Engineering</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span>skindermo.project@university.edu</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                <span>Academic Mini-Project – Final Year Engineering</span>
              </div>
            </div>
          </div>

          {/* Benchmark Reference */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-400 font-semibold">
              Dataset & Citation
            </h4>
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-charcoal-300 space-y-1 font-mono">
              <div className="text-charcoal-200 font-semibold">HAM10000 Dataset:</div>
              <p className="text-[11px] leading-relaxed text-charcoal-400">
                Tschandl, P., Rosendahl, C. & Kittler, H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Sci Data 5, 180161 (2018).
              </p>
            </div>
          </div>

        </div>

        {/* Mandatory Research Protocol Strip */}
        <div className="pt-6 border-t border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal-400 text-center md:text-left">
          <div className="flex items-center gap-2.5 max-w-2xl">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="text-[11px]">
              {RESEARCH_DISCLAIMER_TEXT}
            </span>
          </div>

          <div className="text-[11px] font-mono text-charcoal-500">
            © 2026 SKINDERMO Project • College Mini-Project
          </div>
        </div>

      </div>
    </footer>
  );
};