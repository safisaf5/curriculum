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
import { HydrateOnVisible as Defer } from '../components/layout/HydrateOnVisible';

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
      {/* Below the fold: server HTML first, React attaches when it comes near */}
      <Defer id="about"><Identity /></Defer>
      <Defer id="proof"><Proof /></Defer>
      <Defer id="build"><WhatIBuild /></Defer>
      <Defer id="projects"><ProjectExplorer /></Defer>
      <Defer id="timeline"><Timeline /></Defer>
      <Defer id="experience"><Experience /></Defer>
      <Defer id="education"><Education /></Defer>
      <Defer id="skills"><Skills /></Defer>
      <Defer id="languages"><Languages /></Defer>
      <Defer id="services"><Services /></Defer>
      <Defer id="media"><Media /></Defer>
      <Defer id="philosophy"><Philosophy /></Defer>
      <Defer id="notes"><NotesTeaser /></Defer>
      <Defer id="contact"><Contact /></Defer>
    </>
  );
}
