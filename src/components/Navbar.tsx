import React, { useState } from 'react';
import { BrandLogo } from './UI/BrandLogo';
import { Activity, Menu, X, ArrowUpRight } from 'lucide-react';
import { BackendStatus } from '../types';

interface NavbarProps {
  onOpenWorkspace: () => void;
  activeSection: string;
  backendStatus: BackendStatus;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWorkspace,
  activeSection,
  backendStatus,
  onRefreshHealth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Models', href: '#models' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Dataset & Classes', href: '#dataset' },
    { label: 'Limitations', href: '#limitations' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-charcoal-200/60 transition-all">
      {/* Top Academic Advisory Bar */}
      <div className="bg-forest-950 text-forest-100 text-[11px] py-1.5 px-4 font-mono flex items-center justify-between border-b border-forest-900/50">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-forest-200">
              ACADEMIC RESEARCH PROTOTYPE • DERMOSCOPIC IMAGE CLASSIFICATION (HAM10000)
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-forest-300">
            <button
              onClick={onRefreshHealth}
              title="Click to re-ping FastAPI backend"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[10px]">
                API: {backendStatus.online ? 'Online (8000)' : 'Awaiting Server'}
              </span>
            </button>
            <span className="text-forest-700">|</span>
            <span className="text-forest-400 text-[10px]">Non-Diagnostic System</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#overview" className="focus:outline-none focus:ring-2 focus:ring-forest-500 rounded-lg p-1 -m-1">
            <BrandLogo size="md" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-charcoal-200/80 shadow-subtle">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest-900 text-white shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-canvas-100'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA Button and Status */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenWorkspace}
              id="nav-explore-analysis-btn"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold shadow-card hover:bg-forest-800 active:scale-[0.98] transition-all overflow-hidden border border-forest-700/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
              <span>Explore Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-forest-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenWorkspace}
              className="px-3 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-medium"
            >
              Workspace
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-700 hover:bg-canvas-200 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-charcoal-200 px-4 pt-3 pb-6 space-y-2 shadow-elevated">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-forest-50 hover:text-forest-900"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-charcoal-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWorkspace();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-900 text-white text-sm font-medium"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Launch Analysis Workspace</span>
            </button>
            <div className="flex items-center justify-between text-xs text-charcoal-500 px-2 py-1">
              <span>Backend Status:</span>
              <span className={backendStatus.online ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                {backendStatus.online ? 'Online' : 'Disconnected (Localhost:8000)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
