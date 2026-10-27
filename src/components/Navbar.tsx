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
    <header className="sticky top-0 z-50 bg-canvas-50/95 backdrop-blur-md border-b border-charcoal-200 transition-all">
      {/* Top Academic Advisory Bar */}
      <div className="bg-canvas-100 text-charcoal-600 text-[11px] py-1.5 px-4 font-mono flex items-center justify-between border-b border-charcoal-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
            <span className="text-charcoal-700 tracking-tight">
              ACADEMIC RESEARCH PROTOTYPE • DERMOSCOPIC IMAGE CLASSIFICATION (HAM10000)
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-charcoal-500">
            <button
              onClick={onRefreshHealth}
              title="Click to re-ping FastAPI backend"
              className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.online ? 'bg-sage-600' : 'bg-amber-500'
                }`}
              />
              <span className="text-[10px]">
                API: {backendStatus.online ? 'Online (8000)' : 'Awaiting Server'}
              </span>
            </button>
            <span className="text-charcoal-300">|</span>
            <span className="text-charcoal-500 text-[10px]">Non-Diagnostic System</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#overview" className="focus:outline-none focus:ring-1 focus:ring-sage-500 rounded-md p-1 -m-1">
            <BrandLogo size="md" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-100 text-sage-900 font-semibold'
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-900 text-white text-xs font-semibold shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all border border-charcoal-800"
            >
              <Activity className="w-3.5 h-3.5 text-sage-400" />
              <span>Explore Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenWorkspace}
              className="px-3 py-1.5 rounded-md bg-charcoal-900 text-white text-xs font-medium"
            >
              Workspace
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-charcoal-700 hover:bg-canvas-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-charcoal-200 px-4 pt-3 pb-5 space-y-1.5 shadow-card">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-charcoal-800 hover:bg-canvas-100 hover:text-charcoal-900"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium"
            >
              <Activity className="w-4 h-4 text-sage-400" />
              <span>Launch Analysis Workspace</span>
            </button>
            <div className="flex items-center justify-between text-xs text-charcoal-500 px-2 py-1">
              <span>Backend Status:</span>
              <span className={backendStatus.online ? 'text-sage-700 font-medium' : 'text-amber-700 font-medium'}>
                {backendStatus.online ? 'Online' : 'Disconnected (Localhost:8000)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
