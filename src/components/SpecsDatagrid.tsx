import { motion } from 'framer-motion';

interface SpecRow {
  component: string;
  model: string;
  role: string;
  interface: string;
  notes: string;
}

const bomData: SpecRow[] = [
  {
    component: 'Microcontroller',
    model: 'ESP32-S3-WROOM-1',
    role: 'Dual-Core Processing',
    interface: 'SPI / I2S / GPIO',
    notes: 'Core 0: Audio Pipeline, Core 1: FxLMS ANC',
  },
  {
    component: 'MEMS Microphone',
    model: 'INMP441 (×2)',
    role: 'Voice + Reference Capture',
    interface: 'I2S (24-bit)',
    notes: 'Primary voice mic + ANC reference mic',
  },
  {
    component: 'DAC Module',
    model: 'PCM5102A',
    role: 'Audio Output',
    interface: 'I2S (32-bit)',
    notes: 'Hi-Fi audio to headset speaker',
  },
  {
    component: 'RTOS',
    model: 'FreeRTOS',
    role: 'Task Scheduling',
    interface: 'Kernel API',
    notes: 'Real-time task management & audio ISR',
  },
  {
    component: 'AI Denoise',
    model: 'RNNoise (Quantized)',
    role: 'Speech Enhancement',
    interface: 'C Library',
    notes: 'Recurrent NN for speech/noise separation',
  },
  {
    component: 'ANC Engine',
    model: 'FxLMS Algorithm',
    role: 'Active Noise Cancellation',
    interface: 'DSP Pipeline',
    notes: 'Filtered-x Least Mean Squares adaptive filter',
  },
  {
    component: 'Power Supply',
    model: 'LiPo 3.7V 2000mAh',
    role: 'Portable Power',
    interface: 'USB-C Charge',
    notes: '~8h continuous operation',
  },
  {
    component: 'Enclosure',
    model: 'Custom IP54',
    role: 'Environmental Protection',
    interface: '—',
    notes: 'Ruggedized housing, dust/splash resistant',
  },
];

export default function SpecsDatagrid() {
  return (
    <section id="specs" className="py-20 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] text-cb-olive-bright uppercase">Hardware Stack</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-cb-white mt-3 tracking-tight">
            BOM & Technical Specifications
          </h2>
          <p className="text-cb-text-dim mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            Complete embedded hardware and software stack powering the CLEARBOX tactical ANC module.
          </p>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-cb-border/50">
                  <th className="text-left px-6 py-4 text-[10px] font-mono tracking-[0.2em] text-cb-olive-bright font-semibold uppercase">
                    Component
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-mono tracking-[0.2em] text-cb-olive-bright font-semibold uppercase">
                    Model / Type
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-mono tracking-[0.2em] text-cb-olive-bright font-semibold uppercase">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-mono tracking-[0.2em] text-cb-olive-bright font-semibold uppercase hidden lg:table-cell">
                    Interface
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-mono tracking-[0.2em] text-cb-olive-bright font-semibold uppercase hidden xl:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {bomData.map((row, i) => (
                  <motion.tr
                    key={row.component}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-cb-border/20 hover:bg-cb-olive/5 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cb-olive-bright/50 group-hover:bg-cb-olive-bright transition-colors" />
                        <span className="text-sm font-semibold text-cb-white">{row.component}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-cb-cyan">{row.model}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-cb-text-dim">{row.role}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-mono text-cb-amber/80 bg-cb-amber/5 px-2 py-1 rounded-md border border-cb-amber/10">
                        {row.interface}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className="text-xs text-cb-muted">{row.notes}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Processing', value: '240 MHz', sub: 'Dual Xtensa LX7' },
            { label: 'Memory', value: '8 MB PSRAM', sub: '+ 512KB SRAM' },
            { label: 'ADC Resolution', value: '24-bit', sub: 'I2S Interface' },
            { label: 'Form Factor', value: '65×65×45', sub: 'mm (Compact)' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-xl p-4 text-center"
            >
              <div className="text-xl sm:text-2xl font-bold font-mono text-cb-white">{metric.value}</div>
              <div className="text-xs font-mono text-cb-olive-bright mt-1 tracking-wider">{metric.label}</div>
              <div className="text-[10px] text-cb-muted mt-0.5">{metric.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
