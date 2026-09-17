import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cb-olive/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cb-cyan/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-cb-olive-bright animate-pulse-green" />
              <span className="text-xs font-mono tracking-[0.2em] text-cb-olive-bright uppercase">
                Defence Research & Development Organisation
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-cb-white leading-none tracking-tight mb-2">
              CLEARBOX
            </h1>
            <h2 className="text-xl sm:text-2xl font-mono font-light text-cb-olive-bright tracking-wider mb-6">
              TACTICAL ANC
            </h2>

            <p className="text-cb-text-dim text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              An AI-powered active noise cancellation module for military-grade communication systems. 
              Real-time noise suppression across stationary, non-stationary, and impulsive battlefield acoustics using 
              <span className="text-cb-cyan font-medium"> RNNoise</span> and 
              <span className="text-cb-cyan font-medium"> FxLMS</span> algorithms running on dual-core 
              <span className="text-cb-amber font-medium"> ESP32-S3</span>.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#pipeline"
                className="px-6 py-3 bg-gradient-to-r from-cb-olive to-cb-olive-bright text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all duration-300 shadow-lg shadow-cb-olive/20"
              >
                Explore Pipeline →
              </a>
              <a
                href="#demos"
                className="px-6 py-3 glass text-cb-text text-sm font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Audio Demos
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: '< 10ms', label: 'Latency' },
                { value: '48kHz', label: 'Sample Rate' },
                { value: '~30dB', label: 'Noise Reduction' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold font-mono text-cb-white">{stat.value}</div>
                  <div className="text-xs text-cb-muted font-mono tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Device Image + Floating Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            {/* Device Container */}
            <div className="relative rounded-2xl overflow-hidden glass-strong p-2">
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cb-charcoal to-cb-black aspect-square flex items-center justify-center">
                {/* Placeholder device visualization */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <div className="relative">
                    {/* Device body */}
                    <div className="w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl shadow-2xl border border-white/5 flex flex-col items-center justify-center relative">
                      {/* PTT Button */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#333] to-[#1a1a1a] border-2 border-[#3a3a3a] shadow-inner flex items-center justify-center mb-4 relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#222] to-[#0a0a0a]" />
                        </div>
                      </div>
                      
                      {/* PTT Label */}
                      <span className="font-mono text-sm text-cb-muted tracking-[0.3em]">PTT</span>
                      
                      {/* Status LED */}
                      <div className="w-4 h-1 rounded-full bg-cb-blue mt-2 glow-cyan" />
                      
                      {/* Brand */}
                      <span className="font-mono text-xs text-cb-muted tracking-[0.4em] mt-4 font-semibold">CLEARBOX</span>
                    </div>
                  </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-cb-olive-bright/40" />
                <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-cb-olive-bright/40" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-cb-olive-bright/40" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-cb-olive-bright/40" />
              </div>
            </div>

            {/* Floating Hardware Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -left-4 sm:-left-8 glass-panel rounded-xl p-4 max-w-[220px]"
            >
              <div className="text-xs font-mono text-cb-olive-bright tracking-wider mb-3 flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                PHYSICAL I/O
              </div>
              <div className="space-y-2">
                {[
                  { icon: '⇄', label: 'Slider Switch', desc: 'ANC ON/OFF' },
                  { icon: '◉', label: 'Tactile PTT', desc: 'Push-to-Talk' },
                  { icon: '🎧', label: 'Headset I/O', desc: '3.5mm Jack' },
                  { icon: '📡', label: 'Radio I/O', desc: '3.5mm Jack' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center">{item.icon}</span>
                    <div>
                      <div className="text-cb-white font-medium">{item.label}</div>
                      <div className="text-cb-muted text-[10px]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating Status Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-4 -right-4 sm:-right-6 glass-panel rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cb-green animate-pulse-green" />
                <span className="text-[10px] font-mono text-cb-green tracking-wider">SYSTEM READY</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-[10px] font-mono text-cb-muted">
                  CORE 0: <span className="text-cb-cyan">AUDIO</span>
                </div>
                <div className="text-[10px] font-mono text-cb-muted">
                  CORE 1: <span className="text-cb-cyan">FxLMS</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
