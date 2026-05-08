import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface Evidence {
  source: string;
  text: string;
}

interface ClaimResultProps {
  result: {
    claim: string;
    verdict: "TRUE" | "FALSE" | "UNVERIFIABLE";
    confidence: number;
    explanation: string;
    evidence: Evidence[];
  };
}

export default function VerificationResult({ result }: ClaimResultProps) {
  const [expanded, setExpanded] = useState(false);

  const isTrue = result.verdict === "TRUE";
  const isFalse = result.verdict === "FALSE";
  
  const StatusIcon = isTrue ? CheckCircle2 : isFalse ? XCircle : AlertCircle;
  const statusColor = isTrue ? "text-emerald-400" : isFalse ? "text-rose-400" : "text-amber-400";
  
  // Dynamic glow effects based on verdict
  const bgSoft = isTrue ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]" : 
                 isFalse ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-400/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]" : 
                 "bg-amber-500/5 border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]";

  return (
    <div className={clsx("rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-md border", bgSoft)}>
      <div 
        className="p-5 cursor-pointer flex gap-4 items-start bg-gradient-to-br from-white/50 dark:from-white/[0.03] to-transparent transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <StatusIcon className={clsx("w-6 h-6 shrink-0 mt-0.5 filter drop-shadow-sm dark:drop-shadow-md", statusColor)} />
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-relaxed tracking-wide drop-shadow-none dark:drop-shadow-sm">{result.claim}</h3>
            <div className="flex items-center gap-2 shrink-0 mt-1 bg-white dark:bg-black/30 px-2 py-1 rounded-md border border-neutral-200 dark:border-white/5 transition-colors">
              <span className={clsx("text-xs font-black tracking-wider", statusColor)}>
                {(result.confidence * 100).toFixed(0)}%
              </span>
              {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-neutral-200 dark:border-white/5 space-y-6">
              
              <div className="mt-4">
                <h4 className="text-[10px] font-black text-amber-500 dark:text-amber-300/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-3 bg-amber-500 rounded-full" />
                  Reasoning
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black/40 p-4 rounded-xl border border-neutral-200 dark:border-white/5 leading-relaxed shadow-sm dark:shadow-inner transition-colors">
                  {result.explanation}
                </p>
              </div>

              {result.evidence && result.evidence.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-rose-500 dark:text-rose-300/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1 h-3 bg-rose-500 rounded-full" />
                    Source Evidence
                  </h4>
                  <div className="space-y-3">
                    {result.evidence.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-black/30 p-4 rounded-xl border border-neutral-200 dark:border-white/5 flex gap-3 items-start hover:bg-neutral-50 dark:hover:bg-black/50 transition-colors group">
                        <LinkIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-300 block mb-1 tracking-wide">{item.source}</span>
                          <span className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">"{item.text}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
