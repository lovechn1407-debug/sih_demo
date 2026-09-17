import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useClearbox } from '../context/ClearboxContext';
import { audioEngine, type AudioEngineMetrics } from '../services/audioEngine';

// Pill Slider Switch component matching the exact design from user image
function DiagramPillSlider({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center select-none">
      {/* Label above slider */}
      <span className="text-sm font-sans font-medium tracking-wide text-neutral-200 mb-3 uppercase">
        {label}
      </span>

      {/* Pill Track */}
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-20 h-10 rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner flex items-center ${
          checked ? 'bg-black' : 'bg-[#0a0a0a]'
        } border border-neutral-700/80 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {/* White Circular Sliding Knob */}
        <div
          className={`w-8 h-8 rounded-full bg-white shadow-md transition-transform duration-300 ease-out transform ${
            checked ? 'translate-x-10' : 'translate-x-0'
          }`}
        />
      </div>

      {/* OFF / ON Labels below slider */}
      <div className="flex justify-between w-20 mt-2 px-1 text-xs font-sans font-medium tracking-wider text-neutral-400">
        <span className={!checked ? 'text-white font-bold' : 'text-neutral-500'}>OFF</span>
        <span className={checked ? 'text-white font-bold' : 'text-neutral-500'}>ON</span>
      </div>
    </div>
  );
}

export default function ClearboxInteractiveStage() {
  const { addTerminalLog, setAncEnabled } = useClearbox();

  // Audio States
  const [signalPlaying, setSignalPlaying] = useState(false);
  const [envPlaying, setEnvPlaying] = useState(false);
  const [filterActive, setFilterActive] = useState(false); // DSP AI CLEAN
  const [ancActive, setAncActive] = useState(false);       // ANC
  const [powerOn, setPowerOn] = useState(true);            // POWER

  // 3D Card Flip State: false = Front Photo View, true = Back Control Panel UI View
  const [isFlipped, setIsFlipped] = useState(false);

  const [signalPreset, setSignalPreset] = useState('comm_walkie_talkie');
  const [envPreset, setEnvPreset] = useState('rotor_helicopter');

  const [metrics, setMetrics] = useState<AudioEngineMetrics>({
    snr: 3.4,
    noiseSuppressionDb: -1.2,
    latencyMs: 1.85,
    inputRms: 0.1,
    outputRms: 0.1,
    ancPressureIndex: 0,
  });

  // Canvas Refs for Real-time Waveforms
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const oledCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Toggle Power Master
  const handlePowerToggle = (val: boolean) => {
    setPowerOn(val);
    audioEngine.setPowerActive(val);
    if (!val) {
      audioEngine.stopIncomingSignal();
      audioEngine.stopEnvironmentalSound();
      setSignalPlaying(false);
      setEnvPlaying(false);
      addTerminalLog('CLEARBOX Unit Power: DOWN', 'error');
    } else {
      addTerminalLog('CLEARBOX Unit Power: UP (DSP AI Core Active)', 'success');
    }
  };

  // Toggle DSP AI CLEAN Switch
  const handleFilterToggle = useCallback(
    (checked: boolean) => {
      setFilterActive(checked);
      audioEngine.setFilterActive(checked);
      addTerminalLog(
        `CLEARBOX DSP AI CLEAN: ${checked ? 'ON [Walkie-Talkie Speech Isolated & Cleaned]' : 'OFF [RAW Walkie-Talkie Signal]'}` ,
        checked ? 'success' : 'info'
      );
    },
    [addTerminalLog]
  );

  // Toggle ANC Switch
  const handleAncToggle = useCallback(
    (checked: boolean) => {
      setAncActive(checked);
      setAncEnabled(checked);
      audioEngine.setAncActive(checked);
      addTerminalLog(
        `CLEARBOX ANC: ${checked ? 'ON [Helicopter Acoustic Pressure Seal Engaged]' : 'OFF [Open Helicopter Spectrum]'}`,
        checked ? 'success' : 'info'
      );
    },
    [addTerminalLog, setAncEnabled]
  );

  // Play / Stop Incoming Radio Signal (Real Walkie Talkie MP3)
  const handlePlayIncomingSignal = async (preset = signalPreset) => {
    if (!powerOn) {
      addTerminalLog('Error: Turn CLEARBOX Power ON first!', 'error');
      return;
    }

    if (signalPlaying && preset === signalPreset) {
      audioEngine.stopIncomingSignal();
      setSignalPlaying(false);
      addTerminalLog('Incoming Walkie-Talkie Audio Stopped', 'info');
    } else {
      setSignalPreset(preset);
      await audioEngine.playIncomingSignal(preset);
      setSignalPlaying(true);
      addTerminalLog(`Playing Real Walkie-Talkie Audio [police waliki talki.mp3]`, 'tx');
    }
  };

  // Play / Stop Environmental Helicopter Sound (Real Helicopter MP3)
  const handlePlayEnvSound = async (preset = envPreset) => {
    if (!powerOn) {
      addTerminalLog('Error: Turn CLEARBOX Power ON first!', 'error');
      return;
    }

    if (envPlaying && preset === envPreset) {
      audioEngine.stopEnvironmentalSound();
      setEnvPlaying(false);
      addTerminalLog('Helicopter Audio Stopped', 'info');
    } else {
      setEnvPreset(preset);
      await audioEngine.playEnvironmentalSound(preset);
      setEnvPlaying(true);
      addTerminalLog(`Playing Real Helicopter Audio [Helicopter sound.mp3]`, 'info');
    }
  };

  // Draw real-time waveforms on HTML5 Canvases
  useEffect(() => {
    const drawWaveforms = () => {
      // 1. Input Canvas
      const inputCanvas = inputCanvasRef.current;
      if (inputCanvas) {
        const ctx = inputCanvas.getContext('2d');
        if (ctx) {
          const waveData = audioEngine.getWaveformData('input');
          ctx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = signalPlaying ? '#ef4444' : '#52525b';
          ctx.beginPath();

          const sliceWidth = inputCanvas.width / waveData.length;
          let x = 0;
          for (let i = 0; i < waveData.length; i++) {
            const v = waveData[i] / 128.0;
            const y = (v * inputCanvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        }
      }

      // 2. Output Canvas
      const outputCanvas = outputCanvasRef.current;
      if (outputCanvas) {
        const ctx = outputCanvas.getContext('2d');
        if (ctx) {
          const waveData = audioEngine.getWaveformData('output');
          ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
          ctx.lineWidth = 2;
          ctx.strokeStyle =
            signalPlaying || envPlaying
              ? filterActive || ancActive
                ? '#10b981'
                : '#f59e0b'
              : '#52525b';
          ctx.beginPath();

          const sliceWidth = outputCanvas.width / waveData.length;
          let x = 0;
          for (let i = 0; i < waveData.length; i++) {
            const v = waveData[i] / 128.0;
            const y = (v * outputCanvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        }
      }

      // 3. OLED Telemetry Display Canvas
      const oledCanvas = oledCanvasRef.current;
      if (oledCanvas) {
        const ctx = oledCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060b11';
          ctx.fillRect(0, 0, oledCanvas.width, oledCanvas.height);

          if (powerOn) {
            const freqData = audioEngine.getFrequencyData('output');
            const barWidth = oledCanvas.width / 16;
            ctx.fillStyle = filterActive ? '#10b981' : '#06b6d4';

            for (let i = 0; i < 16; i++) {
              const val = freqData[i * 4] || 0;
              const barHeight = (val / 255) * (oledCanvas.height - 12);
              ctx.fillRect(
                i * barWidth + 2,
                oledCanvas.height - barHeight - 4,
                barWidth - 4,
                barHeight
              );
            }
          }
        }
      }

      if (powerOn) {
        setMetrics(audioEngine.getMetrics());
      }

      animFrameId.current = requestAnimationFrame(drawWaveforms);
    };

    animFrameId.current = requestAnimationFrame(drawWaveforms);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [powerOn, signalPlaying, envPlaying, filterActive, ancActive]);

  return (
    <section className="py-12 relative overflow-hidden bg-cb-black min-h-screen flex items-center">
      {/* Background Radar & Glow */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-cb-olive/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-cb-olive/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-cb-green animate-pulse-green" />
            <span className="text-[11px] font-mono tracking-widest text-cb-olive-bright uppercase">
              DRDO SIH26052 — Interactive Demonstration Stage
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-cb-white tracking-tight">
            CLEARBOX TACTICAL WORKSTATION
          </h1>
          <p className="text-cb-text-dim text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Play real Walkie-Talkie audio on the left & real Helicopter audio on the right. Toggle <strong>DSP AI CLEAN</strong> to hear HD speech isolation or <strong>ANC</strong> for pressurized acoustic sealing.
          </p>
        </div>

        {/* 3-Column Workbench */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: Real Walkie-Talkie Radio Signal */}
          <div className="lg:col-span-3 flex flex-col gap-4 glass-panel rounded-2xl p-5 border border-cb-border/40">
            <div className="flex items-center justify-between pb-3 border-b border-cb-border/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <h3 className="text-xs font-bold font-mono tracking-wider text-cb-white uppercase">
                  Raw Walkie-Talkie Radio
                </h3>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${signalPlaying ? 'bg-cb-red animate-pulse' : 'bg-cb-muted/40'}`} />
            </div>

            <p className="text-xs text-cb-text-dim leading-relaxed">
              Real recording: <code className="text-cb-cyan">police waliki talki.mp3</code>
            </p>

            {/* Audio Stream Card */}
            <div className="p-4 rounded-xl bg-cb-charcoal/80 border border-cb-border/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📻</span>
                <div>
                  <div className="text-xs font-bold text-cb-white">Police Walkie-Talkie Stream</div>
                  <div className="text-[10px] font-mono text-cb-muted">Raw Comm Audio Recording</div>
                </div>
              </div>
              <p className="text-[11px] text-cb-text-dim leading-relaxed">
                Contains real walkie-talkie speech. Toggle <strong>DSP AI CLEAN</strong> to hear the voice cleaned in real time.
              </p>
            </div>

            {/* Main Action Button */}
            <button
              onClick={() => handlePlayIncomingSignal(signalPreset)}
              className={`w-full py-4 rounded-xl font-mono text-xs font-extrabold tracking-wider transition-all duration-300 shadow-xl ${
                signalPlaying
                  ? 'bg-cb-red/20 text-cb-red border border-cb-red/50 hover:bg-cb-red/30'
                  : 'bg-gradient-to-r from-cb-olive to-cb-olive-bright text-white hover:brightness-110 shadow-cb-olive/20'
              }`}
            >
              {signalPlaying ? '🛑 STOP RADIO SIGNAL' : '▶ PLAY WALKIE-TALKIE SIGNAL'}
            </button>

            {/* Live Input Waveform Visualizer */}
            <div className="mt-auto pt-3">
              <div className="flex justify-between text-[10px] font-mono text-cb-muted mb-1">
                <span>WALKIE-TALKIE WAVEFORM</span>
                <span className={signalPlaying ? 'text-cb-red font-bold' : ''}>
                  {signalPlaying ? 'LIVE STREAM' : 'IDLE'}
                </span>
              </div>
              <div className="h-16 bg-[#060b11] rounded-xl p-1 border border-cb-border/40 overflow-hidden">
                <canvas ref={inputCanvasRef} width={260} height={56} className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: CLEARBOX unit with 3D FLIP "TURN BOX" */}
          <div className="lg:col-span-6 flex flex-col justify-between glass-strong rounded-3xl p-6 border-2 border-cb-olive/30 relative shadow-2xl overflow-hidden min-h-[520px]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cb-olive/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar with "TURN BOX" Button */}
            <div className="flex items-center justify-between mb-4 z-10">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${powerOn ? 'bg-cb-green animate-pulse-green' : 'bg-cb-muted'}`} />
                <div>
                  <h2 className="text-xl font-black font-mono tracking-wider text-cb-white">
                    CLEARBOX HARDWARE UNIT
                  </h2>
                  <p className="text-[11px] font-mono text-cb-olive-bright">
                    {isFlipped ? 'HARDWARE CONTROL PANEL' : 'FRONT PHOTO VIEW'}
                  </p>
                </div>
              </div>

              {/* 🔄 TURN BOX BUTTON */}
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-black tracking-wider bg-gradient-to-r from-cb-olive to-cb-olive-bright text-white shadow-lg shadow-cb-olive/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-cb-olive-bright/40 flex items-center gap-2"
              >
                <span>🔄</span>
                <span>TURN BOX</span>
              </button>
            </div>

            {/* 3D FLIP CONTAINER */}
            <div className="relative w-full my-auto py-2" style={{ perspective: 1200 }}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full"
              >
                {/* ---------------- FRONT SIDE (Device Photo View) ---------------- */}
                <div
                  className="w-full rounded-2xl overflow-hidden border border-cb-border/60 bg-[#06080c] shadow-inner p-4 min-h-[360px] flex items-center justify-center relative"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <img
                    src="/clearbox-device.jpg"
                    alt="CLEARBOX Hardware Unit Front"
                    className={`max-h-[320px] object-contain rounded-xl transition-all duration-500 ${
                      powerOn
                        ? 'filter brightness-105 contrast-105 drop-shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                        : 'filter brightness-40 grayscale'
                    }`}
                  />

                  {/* OLED Telemetry Overlay */}
                  <div className="absolute top-4 left-4 glass-strong rounded-xl p-3 border border-cb-cyan/40 shadow-2xl max-w-[210px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-cb-cyan tracking-wider">OLED TELEMETRY</span>
                      <span className="text-[9px] font-mono text-cb-green">48kHz</span>
                    </div>

                    <div className="h-10 bg-[#04080e] rounded-lg p-1 border border-cb-cyan/20 mb-2">
                      <canvas ref={oledCanvasRef} width={190} height={32} className="w-full h-full" />
                    </div>

                    <div className="space-y-1 font-mono text-[9px]">
                      <div className="flex justify-between text-cb-muted">
                        <span>DSP AI CLEAN:</span>
                        <span className={filterActive ? 'text-cb-green font-bold' : 'text-cb-amber'}>
                          {filterActive ? 'ACTIVE (-34.8dB)' : 'BYPASS'}
                        </span>
                      </div>
                      <div className="flex justify-between text-cb-muted">
                        <span>ANC PRESSURE:</span>
                        <span className={ancActive ? 'text-cb-cyan font-bold' : 'text-cb-muted'}>
                          {ancActive ? 'ACOUSTIC SEAL' : 'OFF'}
                        </span>
                      </div>
                      <div className="flex justify-between text-cb-muted">
                        <span>LATENCY:</span>
                        <span className="text-cb-white font-bold">{metrics.latencyMs} ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-3 glass-panel px-4 py-2 rounded-xl border border-cb-border/60">
                    <div className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${filterActive ? 'bg-cb-green animate-pulse-green' : 'bg-cb-amber'}`} />
                      <span className="text-[9px] font-mono text-cb-muted">DSP</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${ancActive ? 'bg-cb-cyan glow-cyan' : 'bg-cb-border'}`} />
                      <span className="text-[9px] font-mono text-cb-muted">ANC</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${signalPlaying ? 'bg-cb-red animate-pulse' : 'bg-cb-border'}`} />
                      <span className="text-[9px] font-mono text-cb-muted">TX</span>
                    </div>
                  </div>

                  {/* Flip Prompt Badge */}
                  <div
                    onClick={() => setIsFlipped(true)}
                    className="absolute bottom-4 left-4 cursor-pointer glass px-3 py-1.5 rounded-lg border border-cb-olive/40 hover:bg-cb-olive/20 transition-all text-[11px] font-mono text-cb-olive-bright flex items-center gap-1.5"
                  >
                    <span>🔄 Click to view Control Panel</span>
                  </div>
                </div>

                {/* ---------------- BACK SIDE (Exact Control Panel UI from User Diagram) ---------------- */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl bg-[#171719] border-2 border-[#2b2b2e] shadow-2xl p-8 flex flex-col justify-between"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {/* Top Row: POWER Slider & ANC Slider */}
                  <div className="grid grid-cols-2 gap-8 items-center justify-items-center pt-2">
                    {/* POWER Slider */}
                    <DiagramPillSlider
                      label="POWER"
                      checked={powerOn}
                      onChange={handlePowerToggle}
                    />

                    {/* ANC Slider */}
                    <DiagramPillSlider
                      label="ANC"
                      checked={ancActive}
                      onChange={handleAncToggle}
                      disabled={!powerOn}
                    />
                  </div>

                  {/* Bottom Row: DSP AI CLEAN Slider & Status LEDs */}
                  <div className="grid grid-cols-2 gap-8 items-end justify-items-center pb-2">
                    {/* DSP AI CLEAN Slider */}
                    <DiagramPillSlider
                      label="DSP AI CLEAN"
                      checked={filterActive}
                      onChange={handleFilterToggle}
                      disabled={!powerOn}
                    />

                    {/* Status LEDs (DSP, ANC, TX) */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-5 mb-2">
                        {/* DSP LED */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full transition-all duration-300 ${
                              powerOn && filterActive
                                ? 'bg-[#10b981] shadow-[0_0_12px_#10b981]'
                                : 'bg-[#2a2a2c] border border-neutral-700'
                            }`}
                          />
                        </div>

                        {/* ANC LED */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full transition-all duration-300 ${
                              powerOn && ancActive
                                ? 'bg-[#06b6d4] shadow-[0_0_12px_#06b6d4]'
                                : 'bg-[#2a2a2c] border border-neutral-700'
                            }`}
                          />
                        </div>

                        {/* TX LED */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full transition-all duration-300 ${
                              powerOn && signalPlaying
                                ? 'bg-[#ef4444] shadow-[0_0_12px_#ef4444] animate-pulse'
                                : 'bg-[#2a2a2c] border border-neutral-700'
                            }`}
                          />
                        </div>
                      </div>

                      {/* LED Labels */}
                      <div className="flex justify-between w-28 text-[11px] font-sans font-medium tracking-wider text-neutral-400">
                        <span>DSP</span>
                        <span>ANC</span>
                        <span>TX</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Logo */}
                  <div className="text-center pt-2">
                    <span className="text-sm font-sans font-normal tracking-[0.2em] text-neutral-300 uppercase">
                      CLEARBOX
                    </span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real Helicopter Environmental ANC Sound */}
          <div className="lg:col-span-3 flex flex-col gap-4 glass-panel rounded-2xl p-5 border border-cb-border/40">
            <div className="flex items-center justify-between pb-3 border-b border-cb-border/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚁</span>
                <h3 className="text-xs font-bold font-mono tracking-wider text-cb-white uppercase">
                  Real Helicopter ANC
                </h3>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${envPlaying ? 'bg-cb-cyan animate-pulse' : 'bg-cb-muted/40'}`} />
            </div>

            <p className="text-xs text-cb-text-dim leading-relaxed">
              Real recording: <code className="text-cb-cyan">Helicopter sound.mp3</code>
            </p>

            {/* Helicopter Audio Card */}
            <div className="p-4 rounded-xl bg-cb-charcoal/80 border border-cb-border/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🚁</span>
                <div>
                  <div className="text-xs font-bold text-cb-white">Helicopter Audio Stream</div>
                  <div className="text-[10px] font-mono text-cb-muted">Raw Environmental Recording</div>
                </div>
              </div>
              <p className="text-[11px] text-cb-text-dim leading-relaxed">
                Contains real helicopter rotor sound. Toggle <strong>ANC</strong> to hear the acoustic pressure seal in action.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handlePlayEnvSound(envPreset)}
              className={`w-full py-4 rounded-xl font-mono text-xs font-extrabold tracking-wider transition-all duration-300 shadow-xl ${
                envPlaying
                  ? 'bg-cb-cyan/20 text-cb-cyan border border-cb-cyan/50 hover:bg-cb-cyan/30'
                  : 'bg-gradient-to-r from-cb-charcoal to-[#262626] text-cb-cyan border border-cb-cyan/40 hover:bg-cb-cyan/10'
              }`}
            >
              {envPlaying ? '🛑 STOP HELICOPTER AUDIO' : '▶ PLAY HELICOPTER SOUND'}
            </button>

            {/* Live Filtered Output Waveform Visualizer */}
            <div className="mt-auto pt-3">
              <div className="flex justify-between text-[10px] font-mono text-cb-muted mb-1">
                <span>CLEARBOX OUTPUT WAVEFORM</span>
                <span className={filterActive || ancActive ? 'text-cb-green font-bold' : ''}>
                  {filterActive ? 'DSP CLEAN' : ancActive ? 'ANC SEAL' : 'RAW'}
                </span>
              </div>
              <div className="h-16 bg-[#060b11] rounded-xl p-1 border border-cb-border/40 overflow-hidden">
                <canvas ref={outputCanvasRef} width={260} height={56} className="w-full h-full" />
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Metric Bar below Stage */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs font-mono text-cb-muted mb-1">NOISE SUPPRESSION</div>
            <div className="text-2xl font-bold font-mono text-cb-green">
              {metrics.noiseSuppressionDb} dB
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs font-mono text-cb-muted mb-1">SIGNAL-TO-NOISE RATIO</div>
            <div className="text-2xl font-bold font-mono text-cb-white">
              +{metrics.snr} dB
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs font-mono text-cb-muted mb-1">ANC PRESSURE INDEX</div>
            <div className="text-2xl font-bold font-mono text-cb-cyan">
              {metrics.ancPressureIndex.toFixed(1)}%
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-xs font-mono text-cb-muted mb-1">DSP LATENCY</div>
            <div className="text-2xl font-bold font-mono text-cb-olive-bright">
              {metrics.latencyMs} ms
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
