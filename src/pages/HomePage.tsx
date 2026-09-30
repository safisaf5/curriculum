import Hero from '../components/home/Hero';
import Identity from '../components/home/Identity';
import Proof from '../components/home/Proof';
import WhatIBuild from '../components/home/WhatIBuild';
import ProjectExplorer from '../components/home/ProjectExplorer';
import Timeline from '../components/home/Timeline';
import Experience from '../components/home/Experience';
import Education from '../components/home/Education';
import Skills from '../components/home/Skills';
import Languages from '../components/home/Languages';
import Services from '../components/home/Services';
import Media from '../components/home/Media';
import Philosophy from '../components/home/Philosophy';
import NotesTeaser from '../components/home/NotesTeaser';
import Contact from '../components/home/Contact';

/**
 * Home page narrative:
 * who (hero, identity) → proof (numbers, what I build, projects) →
 * how I got here (timeline, experience, education) → what I can do
 * (skills, languages, services) → how I communicate (media, philosophy) →
 * conversion (contact).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Identity />
      <Proof />
      <WhatIBuild />
      <ProjectExplorer />
      <Timeline />
      <Experience />
      <Education />
      <Skills />
      <Languages />
      <Services />
      <Media />
      <Philosophy />
      <NotesTeaser />
      <Contact />
    </>
  );
}
