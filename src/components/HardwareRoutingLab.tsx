import { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@heroui/react';
import { useClearbox } from '../context/ClearboxContext';

function TerminalWindow() {
  const { terminalLogs } = useClearbox();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const getColor = (type: string) => {
    switch (type) {
      case 'tx': return 'text-cb-red';
      case 'error': return 'text-cb-red';
      case 'success': return 'text-cb-green';
      default: return 'text-cb-text-dim';
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cb-border/50 bg-cb-black/40">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cb-red/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-cb-amber/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-cb-green/60" />
        </div>
        <span className="text-[10px] font-mono text-cb-muted tracking-wider ml-2">CLEARBOX_TERMINAL v2.1</span>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-3 h-64 sm:h-80 overflow-y-auto terminal-text"
      >
        {terminalLogs.map((log) => (
          <div key={log.id} className="flex gap-2 mb-0.5">
            <span className="text-cb-muted/50 shrink-0">[{log.timestamp}]</span>
            <span className={getColor(log.type)}>
              {log.type === 'tx' && '▶ '}
              {log.type === 'error' && '✗ '}
              {log.type === 'success' && '✓ '}
              {log.message}
            </span>
          </div>
        ))}
        <div className="flex gap-1 items-center mt-1">
          <span className="text-cb-olive-bright">$</span>
          <span className="w-2 h-4 bg-cb-olive-bright/70 animate-terminal-blink" />
        </div>
      </div>
    </div>
  );
}

function TxIndicator() {
  const { isTransmitting } = useClearbox();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Large TX LED */}
      <motion.div
        animate={{
          scale: isTransmitting ? [1, 1.1, 1] : 1,
          boxShadow: isTransmitting
            ? ['0 0 20px rgba(239,68,68,0.4)', '0 0 40px rgba(239,68,68,0.7)', '0 0 20px rgba(239,68,68,0.4)']
            : '0 0 4px rgba(107,107,107,0.2)',
        }}
        transition={{ duration: 0.8, repeat: isTransmitting ? Infinity : 0 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
          isTransmitting
            ? 'bg-cb-red/20 border-cb-red/60'
            : 'bg-cb-dark border-cb-border'
        }`}
      >
        <span className={`font-mono text-2xl font-black tracking-widest transition-colors duration-300 ${
          isTransmitting ? 'text-cb-red' : 'text-cb-muted/30'
        }`}>
          TX
        </span>
      </motion.div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isTransmitting ? 'tx' : 'standby'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`text-[10px] font-mono tracking-[0.2em] font-bold ${
            isTransmitting ? 'text-cb-red' : 'text-cb-amber'
          }`}
        >
          {isTransmitting ? 'TRANSMITTING' : 'STANDBY'}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function HardwareRoutingLab() {
  const { pttSource, setPttSource, isTransmitting, setIsTransmitting, addTerminalLog } = useClearbox();

  const handleSourceChange = useCallback((checked: boolean) => {
    const newSource = checked ? 'clearbox' : 'helmet';
    setPttSource(newSource);
    addTerminalLog(`PTT Source changed: ${newSource === 'helmet' ? 'PRIMARY (Helmet)' : 'BACKUP (Clearbox)'}`, 'success');
  }, [setPttSource, addTerminalLog]);

  const handleButtonDown = useCallback((button: 'helmet' | 'clearbox') => {
    if (button === pttSource) {
      setIsTransmitting(true);
      addTerminalLog(`PTT ENGAGED [${button.toUpperCase()}] — Transmission Secured`, 'tx');
    } else {
      addTerminalLog(`PTT BLOCKED [${button.toUpperCase()}] — Not active source (fault tolerance)`, 'error');
    }
  }, [pttSource, setIsTransmitting, addTerminalLog]);

  const handleButtonUp = useCallback((button: 'helmet' | 'clearbox') => {
    if (button === pttSource && isTransmitting) {
      setIsTransmitting(false);
      addTerminalLog(`PTT RELEASED [${button.toUpperCase()}] — TX Ended`, 'info');
    }
  }, [pttSource, isTransmitting, setIsTransmitting, addTerminalLog]);

  return (
    <section id="routing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] text-cb-olive-bright uppercase">Fault Tolerance</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-cb-white mt-3 tracking-tight">
            Hardware Level Routing
          </h2>
          <p className="text-cb-text-dim mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Redundant PTT routing with hardware-level failover. Only the active source can trigger transmission —
            ensuring fault isolation in the field.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Route Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel rounded-2xl p-6"
            >
              <h3 className="text-xs font-mono tracking-[0.2em] text-cb-olive-bright mb-6 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20" />
                </svg>
                ROUTE SELECTOR
              </h3>

              <div className="flex items-center justify-between">
                <div className={`text-sm font-mono font-bold transition-colors duration-300 ${
                  pttSource === 'helmet' ? 'text-cb-green' : 'text-cb-muted'
                }`}>
                  <div className="text-[10px] text-cb-muted mb-1">PRIMARY</div>
                  Helmet PTT
                </div>

                <Switch
                  size="lg"
                  isSelected={pttSource === 'clearbox'}
                  onChange={handleSourceChange}
                  className={pttSource === 'clearbox' ? 'data-[selected]:bg-cb-olive-bright' : ''}
                  aria-label="PTT Source Selector"
                />

                <div className={`text-sm font-mono font-bold text-right transition-colors duration-300 ${
                  pttSource === 'clearbox' ? 'text-cb-green' : 'text-cb-muted'
                }`}>
                  <div className="text-[10px] text-cb-muted mb-1">BACKUP</div>
                  Clearbox PTT
                </div>
              </div>
            </motion.div>

            {/* TX Indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl p-6 flex items-center justify-center"
            >
              <TxIndicator />
            </motion.div>

            {/* PTT Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-2xl p-6"
            >
              <h3 className="text-xs font-mono tracking-[0.2em] text-cb-olive-bright mb-6 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                PTT TRIGGERS
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Helmet Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onMouseDown={() => handleButtonDown('helmet')}
                  onMouseUp={() => handleButtonUp('helmet')}
                  onMouseLeave={() => handleButtonUp('helmet')}
                  onTouchStart={() => handleButtonDown('helmet')}
                  onTouchEnd={() => handleButtonUp('helmet')}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 select-none cursor-pointer ${
                    pttSource === 'helmet'
                      ? 'border-cb-olive-bright/50 bg-cb-olive/10 hover:bg-cb-olive/20 active:bg-cb-olive/30'
                      : 'border-cb-border/30 bg-cb-dark/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={pttSource === 'helmet' ? '#6b8f39' : '#6b6b6b'} strokeWidth="1.5">
                      <path d="M3 18v-6a9 9 0 0118 0v6" />
                      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
                    </svg>
                    <span className={`text-xs font-mono font-bold tracking-wider ${
                      pttSource === 'helmet' ? 'text-cb-olive-bright' : 'text-cb-muted'
                    }`}>
                      HELMET
                    </span>
                    <span className="text-[10px] font-mono text-cb-muted">
                      {pttSource === 'helmet' ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  {pttSource === 'helmet' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cb-green animate-pulse-green" />
                  )}
                </motion.button>

                {/* Clearbox Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onMouseDown={() => handleButtonDown('clearbox')}
                  onMouseUp={() => handleButtonUp('clearbox')}
                  onMouseLeave={() => handleButtonUp('clearbox')}
                  onTouchStart={() => handleButtonDown('clearbox')}
                  onTouchEnd={() => handleButtonUp('clearbox')}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 select-none cursor-pointer ${
                    pttSource === 'clearbox'
                      ? 'border-cb-olive-bright/50 bg-cb-olive/10 hover:bg-cb-olive/20 active:bg-cb-olive/30'
                      : 'border-cb-border/30 bg-cb-dark/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={pttSource === 'clearbox' ? '#6b8f39' : '#6b6b6b'} strokeWidth="1.5">
                      <rect x="4" y="4" width="16" height="16" rx="3" />
                      <circle cx="12" cy="11" r="3" />
                      <path d="M12 15v2" />
                    </svg>
                    <span className={`text-xs font-mono font-bold tracking-wider ${
                      pttSource === 'clearbox' ? 'text-cb-olive-bright' : 'text-cb-muted'
                    }`}>
                      CLEARBOX
                    </span>
                    <span className="text-[10px] font-mono text-cb-muted">
                      {pttSource === 'clearbox' ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  {pttSource === 'clearbox' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cb-green animate-pulse-green" />
                  )}
                </motion.button>
              </div>

              <p className="text-[10px] font-mono text-cb-muted text-center mt-4">
                Hold button to transmit • Only active source can TX
              </p>
            </motion.div>
          </div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <TerminalWindow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
