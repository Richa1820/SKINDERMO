import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ModelCards } from './components/ModelCards';
import { Methodology } from './components/Methodology';
import { DatasetClasses } from './components/DatasetClasses';
import { AnalysisWorkspace } from './components/Workspace/AnalysisWorkspace';
import { Limitations } from './components/Limitations';
import { Footer } from './components/Footer';
import { ModelId, BackendStatus } from './types';
import { ApiService } from './services/api';

export const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelId>('inceptionv3');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    online: false,
    checkedAt: null,
    baseUrl: ApiService.getBaseUrl(),
  });
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);

  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    const status = await ApiService.checkHealth();
    setBackendStatus(status);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    // Initial health check
    checkBackendHealth();

    // Intersection observer to track active section for navbar
    const handleScroll = () => {
      const sections = ['overview', 'workspace', 'models', 'how-it-works', 'dataset', 'limitations'];
      const scrollY = window.scrollY;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToWorkspace = () => {
    const el = document.getElementById('workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToModels = () => {
    const el = document.getElementById('models');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectModelFromCard = (modelId: string) => {
    if (modelId === 'resnet50' || modelId === 'densenet121' || modelId === 'inceptionv3') {
      setSelectedModel(modelId as ModelId);
      scrollToWorkspace();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-50 selection:bg-sage-200 selection:text-charcoal-900">
      {/* Sticky Navigation */}
      <Navbar
        onOpenWorkspace={scrollToWorkspace}
        activeSection={activeSection}
        backendStatus={backendStatus}
        onRefreshHealth={checkBackendHealth}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onExploreClick={scrollToWorkspace}
          onCompareClick={scrollToModels}
        />

        {/* 2. Interactive Analysis Workspace */}
        <AnalysisWorkspace
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          backendStatus={backendStatus}
          onRefreshHealth={checkBackendHealth}
          isCheckingHealth={isCheckingHealth}
        />

        {/* 3. Research Models Comparison */}
        <ModelCards onSelectModelToAnalyze={handleSelectModelFromCard} />

        {/* 4. Methodology: Upload, Analyze, Review */}
        <Methodology />

        {/* 5. Seven Diagnostic Classes Reference */}
        <DatasetClasses />

        {/* 6. Research Limitations & Academic Disclaimer */}
        <Limitations />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
};

export default App;
