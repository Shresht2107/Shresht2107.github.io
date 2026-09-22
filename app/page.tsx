import { MotionProvider } from '@/components/MotionProvider';
import { StackProvider } from '@/components/StackProvider';
import { Intro } from '@/components/Intro';
import { NodeField } from '@/components/NodeField';
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { TraceRail } from '@/components/TraceRail';
import { AboutSection } from '@/components/AboutSection';
import { InternshipSection } from '@/components/InternshipSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { StackSection } from '@/components/StackSection';
import { NowSection } from '@/components/NowSection';
import { ContactSection } from '@/components/ContactSection';

export default function Home() {
  return (
    <MotionProvider>
      <StackProvider>
        <div className="page">
          <Intro />
          <NodeField />
          <Nav />
          <Hero />

          {/* The trace rail measures against this wrapper and the sections in it. */}
          <div id="sections" style={{ position: 'relative' }}>
            <TraceRail />
            <AboutSection />
            <InternshipSection />
            <ProjectsSection />
            <StackSection />
            <NowSection />
            <ContactSection />
          </div>
        </div>
      </StackProvider>
    </MotionProvider>
  );
}
