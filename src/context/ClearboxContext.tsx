import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type PttSource = 'helmet' | 'clearbox';
export type ActiveDemo = 'stationary' | 'non-stationary' | 'impulsive' | null;

interface TerminalLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'tx' | 'error' | 'success';
}

interface ClearboxState {
  pttSource: PttSource;
  isTransmitting: boolean;
  activeDemo: ActiveDemo;
  ancEnabled: boolean;
  terminalLogs: TerminalLog[];
  setPttSource: (source: PttSource) => void;
  setIsTransmitting: (val: boolean) => void;
  setActiveDemo: (demo: ActiveDemo) => void;
  setAncEnabled: (val: boolean) => void;
  addTerminalLog: (message: string, type: TerminalLog['type']) => void;
}

const ClearboxContext = createContext<ClearboxState | null>(null);

let logCounter = 0;

function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

export function ClearboxProvider({ children }: { children: ReactNode }) {
  const [pttSource, setPttSource] = useState<PttSource>('helmet');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState<ActiveDemo>(null);
  const [ancEnabled, setAncEnabled] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { id: logCounter++, timestamp: getTimestamp(), message: 'CLEARBOX v2.1.0 — System Boot', type: 'info' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'FreeRTOS Kernel Initialized', type: 'info' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'ESP32-S3 Core 0: Audio Pipeline Ready', type: 'success' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'ESP32-S3 Core 1: FxLMS ANC Engine Ready', type: 'success' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'RNNoise Model Loaded (48kHz)', type: 'success' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'PTT Source: PRIMARY (Helmet)', type: 'info' },
    { id: logCounter++, timestamp: getTimestamp(), message: 'STATUS: AWAITING INPUT', type: 'info' },
  ]);

  const addTerminalLog = useCallback((message: string, type: TerminalLog['type']) => {
    setTerminalLogs(prev => {
      const newLog: TerminalLog = {
        id: logCounter++,
        timestamp: getTimestamp(),
        message,
        type,
      };
      const updated = [...prev, newLog];
      // Keep last 50 logs
      return updated.slice(-50);
    });
  }, []);

  return (
    <ClearboxContext.Provider
      value={{
        pttSource,
        isTransmitting,
        activeDemo,
        ancEnabled,
        terminalLogs,
        setPttSource,
        setIsTransmitting,
        setActiveDemo,
        setAncEnabled,
        addTerminalLog,
      }}
    >
      {children}
    </ClearboxContext.Provider>
  );
}

export function useClearbox(): ClearboxState {
  const ctx = useContext(ClearboxContext);
  if (!ctx) throw new Error('useClearbox must be used within ClearboxProvider');
  return ctx;
}
