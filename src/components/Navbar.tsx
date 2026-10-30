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
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Technology', href: '#technology' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-200 transition-all shadow-subtle">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="focus:outline-none focus:ring-1 focus:ring-teal-500 rounded-md p-1 -m-1">
            <BrandLogo size="md" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-semibold'
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
            {/* API Status indicator */}
            <button
              onClick={onRefreshHealth}
              title="Click to re-ping FastAPI backend"
              className="flex items-center gap-1.5 hover:text-charcoal-900 transition-colors text-xs text-charcoal-500"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus.online ? 'bg-teal-600 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-mono text-[11px]">
                {backendStatus.online ? 'API Online' : 'API Offline'}
              </span>
            </button>

            <button
              onClick={onOpenWorkspace}
              id="nav-get-started-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold shadow-subtle hover:bg-teal-800 active:scale-[0.99] transition-all border border-teal-800"
            >
              <Activity className="w-3.5 h-3.5 text-teal-200" />
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-teal-300" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenWorkspace}
              className="px-3.5 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold"
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-700 hover:bg-canvas-100 focus:outline-none"
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
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-canvas-100 hover:text-charcoal-900"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
            >
              <Activity className="w-4 h-4 text-teal-200" />
              <span>Get Started – Prediction</span>
            </button>
            <div className="flex items-center justify-between text-xs text-charcoal-500 px-2 py-1 font-mono">
              <span>Backend API:</span>
              <span className={backendStatus.online ? 'text-teal-700 font-medium' : 'text-amber-700 font-medium'}>
                {backendStatus.online ? 'Online (Port 8000)' : 'Offline – Start uvicorn'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};