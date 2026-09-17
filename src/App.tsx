import { useState } from 'react';
import { ClearboxProvider } from './context/ClearboxContext';
import Header from './components/Header';
import PreloaderOverlay from './components/PreloaderOverlay';
import ClearboxInteractiveStage from './components/ClearboxInteractiveStage';
import PipelineVisualizer from './components/PipelineVisualizer';
import AudioDemoDeck from './components/AudioDemoDeck';
import HardwareRoutingLab from './components/HardwareRoutingLab';
import SpecsDatagrid from './components/SpecsDatagrid';
import Footer from './components/Footer';

function SectionDivider() {
  return <div className="section-divider mx-auto max-w-4xl" />;
}

export default function App() {
  const [isPreloaded, setIsPreloaded] = useState(false);

  return (
    <ClearboxProvider>
      <div className="min-h-screen bg-cb-black text-cb-text relative noise-overlay">
        {!isPreloaded && (
          <PreloaderOverlay onComplete={() => setIsPreloaded(true)} />
        )}
        
        <Header />
        <main className="relative z-10 pt-16">
          <ClearboxInteractiveStage />
          <SectionDivider />
          <PipelineVisualizer />
          <SectionDivider />
          <AudioDemoDeck />
          <SectionDivider />
          <HardwareRoutingLab />
          <SectionDivider />
          <SpecsDatagrid />
        </main>
        <Footer />
      </div>
    </ClearboxProvider>
  );
}
