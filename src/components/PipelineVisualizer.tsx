import { motion } from 'framer-motion';
import { useClearbox } from '../context/ClearboxContext';

interface PipelineBlock {
  id: string;
  label: string;
  sublabel: string;
  color: string;
}

const streamA: PipelineBlock[] = [
  { id: 'mic', label: 'MIC', sublabel: 'INMP441', color: 'cb-cyan' },
  { id: 'limiter', label: 'LIMITER', sublabel: 'Dynamic', color: 'cb-amber' },
  { id: 'rnnoise', label: 'RNNoise', sublabel: 'AI Denoise', color: 'cb-olive-bright' },
  { id: 'radio-out', label: 'RADIO', sublabel: 'TX Out', color: 'cb-red' },
];

const streamB: PipelineBlock[] = [
  { id: 'radio-in', label: 'RADIO', sublabel: 'RX In', color: 'cb-green' },
  { id: 'ai-denoise', label: 'AI DENOISE', sublabel: 'RNNoise', color: 'cb-olive-bright' },
  { id: 'fxlms', label: 'FxLMS', sublabel: 'ANC Engine', color: 'cb-cyan' },
  { id: 'speaker', label: 'SPEAKER', sublabel: 'PCM5102A', color: 'cb-blue' },
];

function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center mx-1 sm:mx-2 relative">
      <div className={`h-[2px] w-6 sm:w-10 ${active ? `bg-${color}` : 'bg-cb-border'} transition-colors duration-300 relative overflow-hidden`}>
        {active && (
          <motion.div
            className={`absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-white/60 to-transparent`}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
      <svg width="8" height="12" viewBox="0 0 8 12" className={`${active ? `text-${color}` : 'text-cb-border'} transition-colors duration-300 -ml-1`}>
        <path d="M1 1L7 6L1 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Block({ block, active, delay }: { block: PipelineBlock; active: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={`relative flex flex-col items-center justify-center px-3 py-3 sm:px-5 sm:py-4 rounded-xl border transition-all duration-500 min-w-[80px] sm:min-w-[100px] ${
        active
          ? `border-${block.color}/40 bg-${block.color}/10 shadow-lg shadow-${block.color}/10`
          : 'border-cb-border/50 bg-cb-dark/50'
      }`}
    >
      {active && (
        <motion.div
          className={`absolute inset-0 rounded-xl bg-${block.color}/5`}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className={`font-mono text-xs sm:text-sm font-bold tracking-wider relative z-10 ${active ? `text-${block.color}` : 'text-cb-text-dim'}`}>
        {block.label}
      </span>
      <span className="font-mono text-[9px] sm:text-[10px] text-cb-muted mt-1 relative z-10">{block.sublabel}</span>
    </motion.div>
  );
}

export default function PipelineVisualizer() {
  const { isTransmitting } = useClearbox();

  return (
    <section id="pipeline" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] text-cb-olive-bright uppercase">System Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-cb-white mt-3 tracking-tight">
            Dual-Stream Audio Pipeline
          </h2>
          <p className="text-cb-text-dim mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Real-time bi-directional audio processing with AI noise suppression and active noise cancellation.
          </p>
        </motion.div>

        {/* Stream A: Outbound (TX) */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${isTransmitting ? 'bg-cb-red animate-pulse-red' : 'bg-cb-red/30'}`} />
            <span className="font-mono text-sm tracking-wider text-cb-red font-semibold">
              STREAM A — OUTBOUND (TX)
            </span>
            {isTransmitting && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono bg-cb-red/20 text-cb-red px-2 py-0.5 rounded-full border border-cb-red/30"
              >
                ACTIVE
              </motion.span>
            )}
          </div>
          <div className="glass-panel rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-center justify-center min-w-[500px]">
              {streamA.map((block, i) => (
                <div key={block.id} className="flex items-center">
                  <Block block={block} active={isTransmitting} delay={i * 0.1} />
                  {i < streamA.length - 1 && <FlowArrow active={isTransmitting} color="cb-red" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stream B: Inbound (RX) */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${!isTransmitting ? 'bg-cb-green animate-pulse-green' : 'bg-cb-green/30'}`} />
            <span className="font-mono text-sm tracking-wider text-cb-green font-semibold">
              STREAM B — INBOUND (RX)
            </span>
            {!isTransmitting && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-mono bg-cb-green/20 text-cb-green px-2 py-0.5 rounded-full border border-cb-green/30"
              >
                ACTIVE
              </motion.span>
            )}
          </div>
          <div className="glass-panel rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-center justify-center min-w-[500px]">
              {streamB.map((block, i) => (
                <div key={block.id} className="flex items-center">
                  <Block block={block} active={!isTransmitting} delay={i * 0.1} />
                  {i < streamB.length - 1 && <FlowArrow active={!isTransmitting} color="cb-green" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interaction hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-xs font-mono text-cb-muted"
        >
          ↓ Press PTT buttons in the <span className="text-cb-olive-bright">Hardware Routing</span> section to switch streams ↓
        </motion.p>
      </div>
    </section>
  );
}
