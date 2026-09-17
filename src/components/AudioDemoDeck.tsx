import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@heroui/react';
import { useClearbox } from '../context/ClearboxContext';
import { audioEngine } from '../services/audioEngine';

interface DemoCard {
  id: string;
  preset: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

const demos: DemoCard[] = [
  {
    id: 'comm_tactical',
    preset: 'comm_tactical',
    title: 'Tactical Officer Speech',
    subtitle: 'Human Voice + Squelch & Static',
    icon: '🗣️',
    description: 'Real human person communicating over radio channel layered with harsh static noise and squelch beeps.',
  },
  {
    id: 'comm_harsh',
    preset: 'comm_harsh',
    title: 'Heavy Interference Comm',
    subtitle: 'Person Voice + Extreme Hiss & Hum',
    icon: '📡',
    description: 'Speech signal buried under 50Hz mains electrical hum and heavy high-frequency radio channel hiss.',
  },
  {
    id: 'comm_pilot',
    preset: 'comm_pilot',
    title: 'Air Control Pilot Speech',
    subtitle: 'Pilot Transmission + Roger Beeps',
    icon: '👨‍✈️',
    description: 'Air defense pilot voice transmission with mic clicks, roger beeps, and channel distortion.',
  },
];

function WaveformBar({ index, isPlaying, filterOn }: { index: number; isPlaying: boolean; filterOn: boolean }) {
  const delay = `${index * 0.05}s`;

  if (!isPlaying) {
    return (
      <div
        className="w-[3px] rounded-full bg-cb-border/40 transition-all duration-500"
        style={{ height: '20%' }}
      />
    );
  }

  return (
    <div
      className={`w-[3px] rounded-full transition-colors duration-500 ${
        filterOn
          ? 'bg-gradient-to-t from-cb-green/60 to-cb-cyan wave-bar-clean'
          : 'bg-gradient-to-t from-cb-red/80 to-cb-amber wave-bar-chaotic'
      }`}
      style={{
        animationDelay: delay,
        height: filterOn ? '40%' : '75%',
      }}
    />
  );
}

function Waveform({ isPlaying, filterOn }: { isPlaying: boolean; filterOn: boolean }) {
  return (
    <div className="h-20 flex items-end justify-center gap-[2px] px-2 relative overflow-hidden rounded-lg bg-cb-black/50 border border-cb-border/30">
      <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-px bg-cb-border/20 w-full" />
        ))}
      </div>

      {Array.from({ length: 36 }).map((_, i) => (
        <WaveformBar key={i} index={i} isPlaying={isPlaying} filterOn={filterOn} />
      ))}

      <div className="absolute bottom-1 right-2">
        <span className={`text-[9px] font-mono font-bold tracking-wider ${filterOn ? 'text-cb-green' : 'text-cb-red'}`}>
          {isPlaying ? (filterOn ? 'DSP AI CLEAN (HD VOICE)' : 'RAW NOISY SIGNAL') : 'IDLE'}
        </span>
      </div>
    </div>
  );
}

function DemoCardComponent({ demo }: { demo: DemoCard }) {
  const { addTerminalLog } = useClearbox();
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterOn, setFilterOn] = useState(audioEngine.isFilterOn());

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      audioEngine.stopIncomingSignal();
      setIsPlaying(false);
      addTerminalLog(`Demo stopped: ${demo.title}`, 'info');
    } else {
      await audioEngine.playIncomingSignal(demo.preset);
      setIsPlaying(true);
      addTerminalLog(`Playing voice demo: ${demo.title} [DSP: ${audioEngine.isFilterOn() ? 'ON' : 'OFF'}]`, 'tx');
    }
  }, [isPlaying, demo, addTerminalLog]);

  const handleFilterToggle = useCallback(
    (checked: boolean) => {
      setFilterOn(checked);
      audioEngine.setFilterActive(checked);
      addTerminalLog(`CLEARBOX DSP AI CLEAN: ${checked ? 'ENABLED (-34.2dB Cut)' : 'BYPASS'}`, checked ? 'success' : 'info');
    },
    [addTerminalLog]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(audioEngine.isSignalActive() && audioEngine.getSignalPreset() === demo.preset);
      setFilterOn(audioEngine.isFilterOn());
    }, 200);
    return () => clearInterval(interval);
  }, [demo.preset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-panel rounded-2xl p-5 transition-all duration-500 border ${
        isPlaying ? 'ring-1 ring-cb-olive-bright/40 border-cb-olive/50 shadow-xl shadow-cb-olive/10' : 'border-cb-border/40'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{demo.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-cb-white tracking-wide">{demo.title}</h3>
            <p className="text-[11px] font-mono text-cb-muted">{demo.subtitle}</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${isPlaying ? 'bg-cb-red animate-pulse' : 'bg-cb-muted/30'}`} />
      </div>

      <p className="text-xs text-cb-text-dim mb-4 leading-relaxed">{demo.description}</p>

      <div className="mb-4">
        <Waveform isPlaying={isPlaying} filterOn={filterOn} />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePlay}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 ${
            isPlaying
              ? 'bg-cb-red/20 text-cb-red border border-cb-red/40 hover:bg-cb-red/30'
              : 'bg-gradient-to-r from-cb-olive to-cb-olive-bright text-white hover:brightness-110 shadow-lg shadow-cb-olive/20'
          }`}
        >
          {isPlaying ? '■ STOP SPEECH' : '▶ PLAY VOICE DEMO'}
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono tracking-wider ${filterOn ? 'text-cb-green font-bold' : 'text-cb-muted'}`}>
            DSP CLEAN
          </span>
          <Switch
            size="sm"
            isSelected={filterOn}
            onChange={handleFilterToggle}
            className={filterOn ? 'data-[selected]:bg-cb-green' : ''}
            aria-label={`DSP AI CLEAN for ${demo.title}`}
          />
          <span className={`text-[10px] font-mono font-bold tracking-wider ${filterOn ? 'text-cb-green' : 'text-cb-red'}`}>
            {filterOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AudioDemoDeck() {
  return (
    <section id="demos" className="py-20 relative">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] text-cb-olive-bright uppercase">Radio Speech & DSP</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-cb-white mt-3 tracking-tight">
            TACTICAL SPEECH DEMONSTRATION DECK
          </h2>
          <p className="text-cb-text-dim mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Listen to a real person communicating over tactical radio. Toggle <strong>DSP AI CLEAN</strong> on any card to hear background static silenced instantly, revealing HD clear speech.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <DemoCardComponent key={demo.id} demo={demo} />
          ))}
        </div>
      </div>
    </section>
  );
}
