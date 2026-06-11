import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Hero from './components/sections/Home';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import Contact from './components/sections/Contact';

// Route-level code splitting — keeps these out of the initial bundle
const CardPage = lazy(() => import('./pages/CardPage'));
const CVPage = lazy(() => import('./pages/CVPage'));

const SECTIONS = ['home', 'about', 'services', 'projects', 'experience', 'skills', 'contact'];

function MainSite() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of SECTIONS) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <ScrollProgress />
      <Navigation activeSection={activeSection} onSectionChange={scrollToSection} />
      <main>
        <Hero onNavigate={scrollToSection} />
        <About />
        <Services onNavigate={scrollToSection} />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer onNavigate={scrollToSection} />
      <BackToTop />
    </div>
  );
}

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<MainSite />} />
              <Route path="/cv" element={<CVPage />} />
              <Route path="/card" element={<CardPage />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
