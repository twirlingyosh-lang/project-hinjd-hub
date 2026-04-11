import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Bug, Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle, Info } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'success' | 'error';
  source: string;
  message: string;
}

interface DebugLogContextType {
  log: (level: LogEntry['level'], source: string, message: string) => void;
}

const DebugLogContext = createContext<DebugLogContextType>({ log: () => {} });

export const useDebugLog = () => useContext(DebugLogContext);

let _nextId = 1;

export function DebugLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [open, setOpen] = useState(true);

  const log = useCallback((level: LogEntry['level'], source: string, message: string) => {
    setEntries(prev => [
      { id: _nextId++, timestamp: new Date(), level, source, message },
      ...prev,
    ].slice(0, 100));
  }, []);

  const clear = () => setEntries([]);

  const icon = (level: LogEntry['level']) => {
    if (level === 'success') return <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />;
    if (level === 'error') return <XCircle size={12} className="text-red-400 flex-shrink-0" />;
    return <Info size={12} className="text-blue-400 flex-shrink-0" />;
  };

  return (
    <DebugLogContext.Provider value={{ log }}>
      {children}
      {/* Floating debug panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-slate-950/95 border border-slate-700 rounded-t-xl shadow-2xl backdrop-blur-md">
            {/* Header */}
            <button
              onClick={() => setOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bug size={14} className="text-amber-400" />
                DEBUG LOG
                {entries.length > 0 && (
                  <span className="bg-red-500/80 text-white rounded-full px-1.5 text-[10px]">{entries.length}</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                {open && (
                  <span onClick={(e) => { e.stopPropagation(); clear(); }} className="text-slate-500 hover:text-red-400 cursor-pointer">
                    <Trash2 size={12} />
                  </span>
                )}
                {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </span>
            </button>

            {/* Log entries */}
            {open && (
              <div className="max-h-48 overflow-y-auto border-t border-slate-800 px-3 py-2 space-y-1 font-mono text-[11px]">
                {entries.length === 0 ? (
                  <p className="text-slate-600 text-center py-3">Click a payment or manifest button to see logs here.</p>
                ) : (
                  entries.map(e => (
                    <div key={e.id} className="flex items-start gap-2 py-0.5">
                      {icon(e.level)}
                      <span className="text-slate-500">{e.timestamp.toLocaleTimeString()}</span>
                      <span className="text-amber-400/80">[{e.source}]</span>
                      <span className={e.level === 'error' ? 'text-red-300' : e.level === 'success' ? 'text-emerald-300' : 'text-slate-300'}>
                        {e.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DebugLogContext.Provider>
  );
}
