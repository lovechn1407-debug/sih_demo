import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../services/audioEngine';

export default function PreloaderOverlay({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing ESP32-S3 Dual-Core DSP Engine...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const startPreload = async () => {
      // Image preloading
      const img = new Image();
      img.src = '/clearbox-device.jpg';

      // Audio preloading
      await audioEngine.preloadAllAssets((pct, text) => {
        if (!mounted) return;
        setProgress(pct);
        setStatusText(text);
      });

      if (mounted) {
        setProgress(100);
        setStatusText('ALL AUDIO ASSETS PRE-BUFFERED IN MEMORY (ZERO LATENCY READY)');
        setIsReady(true);
      }
    };

    startPreload();

    return () => {
      mounted = false;
    };
  }, []);

  const handleEnter = async () => {
    await audioEngine.initAudioContext();
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 bg-[#06080c] flex items-center justify-center p-4 overflow-hidden select-none"
      >
        {/* Background Radar & Tactical Grid */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-cb-olive/20 animate-spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-cb-cyan/20 pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full glass-strong rounded-3xl p-8 border-2 border-cb-olive/30 shadow-2xl text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-cb-olive/40 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-cb-green animate-pulse-green" />
            <span className="text-xs font-mono tracking-widest text-cb-olive-bright uppercase">
              DRDO SIH26052 — System Boot
            </span>
          </div>

          <h1 className="text-4xl font-black font-mono tracking-tight text-cb-white mb-1">
            CLEARBOX TACTICAL ANC
          </h1>
          <p className="text-xs font-mono text-cb-muted tracking-wider mb-8">
            DUAL-CHANNEL REAL-TIME AUDIO BUFFERING
          </p>

          {/* Progress Bar Container */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-cb-muted uppercase">AUDIO BUFFER STATUS</span>
              <span className="text-cb-olive-bright font-bold">{progress}%</span>
            </div>

            <div className="h-4 w-full bg-[#0a0e17] rounded-full p-1 border border-cb-border/80 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cb-olive via-cb-olive-bright to-cb-cyan shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Dynamic Status Log */}
          <div className="h-12 flex items-center justify-center px-4 rounded-xl bg-[#0a0e17] border border-cb-border/50 text-[11px] font-mono text-cb-cyan mb-8 leading-snug">
            {statusText}
          </div>

          {/* Enter Workstation Action Button */}
          <button
            onClick={handleEnter}
            disabled={!isReady}
            className={`w-full py-4 rounded-2xl font-mono text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 ${
              isReady
                ? 'bg-gradient-to-r from-cb-olive via-cb-olive-bright to-emerald-400 text-white hover:brightness-110 shadow-cb-olive/40 cursor-pointer border border-cb-olive-bright/50'
                : 'bg-cb-charcoal text-cb-muted border border-cb-border/50 opacity-60 cursor-not-allowed'
            }`}
          >
            <span>{isReady ? '⚡ ENTER TACTICAL WORKSTATION' : '⏳ BUFFERING AUDIO ASSETS...'}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
