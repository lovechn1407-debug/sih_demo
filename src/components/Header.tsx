import { motion } from 'framer-motion';
import { useClearbox } from '../context/ClearboxContext';

export default function Header() {
  const { isTransmitting } = useClearbox();

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cb-olive to-cb-olive-bright flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-cb-white text-sm tracking-widest font-mono">CLEARBOX</span>
              <span className="text-cb-muted text-xs ml-2 hidden sm:inline">DRDO SIH26052</span>
            </div>
          </div>

          {/* Center Status */}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isTransmitting ? 'bg-cb-red animate-pulse-red' : 'bg-cb-green animate-pulse-green'}`} />
            <span className="text-xs font-mono tracking-wider text-cb-text-dim">
              STATUS: <span className={isTransmitting ? 'text-cb-red' : 'text-cb-green'}>
                {isTransmitting ? 'TRANSMITTING' : 'SECURE CONNECTION'}
              </span>
            </span>
          </div>

          {/* Right side nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#pipeline" className="text-xs font-mono text-cb-text-dim hover:text-cb-olive-bright transition-colors tracking-wider">
              PIPELINE
            </a>
            <a href="#demos" className="text-xs font-mono text-cb-text-dim hover:text-cb-olive-bright transition-colors tracking-wider">
              DEMOS
            </a>
            <a href="#routing" className="text-xs font-mono text-cb-text-dim hover:text-cb-olive-bright transition-colors tracking-wider">
              ROUTING
            </a>
            <a href="#specs" className="text-xs font-mono text-cb-text-dim hover:text-cb-olive-bright transition-colors tracking-wider">
              SPECS
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
