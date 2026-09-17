export default function Footer() {
  return (
    <footer className="py-12 border-t border-cb-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cb-olive to-cb-olive-bright flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-cb-white tracking-widest">CLEARBOX</span>
              <span className="text-cb-muted text-[10px] ml-2">DRDO SIH26052</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-cb-muted tracking-wider text-center">
            DEFENCE RESEARCH & DEVELOPMENT ORGANISATION — TACTICAL ANC MODULE
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cb-green animate-pulse-green" />
            <span className="text-[10px] font-mono text-cb-muted">SYSTEM SECURE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
