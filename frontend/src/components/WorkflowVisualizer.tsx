import { motion } from "framer-motion";
import { Brain, FileSearch, CheckCircle, Scale } from "lucide-react";
import clsx from "clsx";

interface WorkflowVisualizerProps {
  activeAgent: string | null;
}

export default function WorkflowVisualizer({ activeAgent }: WorkflowVisualizerProps) {
  const steps = [
    { id: "planner", label: "Planner", icon: Brain },
    { id: "extractor", label: "Extractor", icon: FileSearch },
    { id: "retriever", label: "Retriever", icon: Scale },
    { id: "verifier", label: "Verifier", icon: CheckCircle },
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-medium text-neutral-400 mb-6">Agent Workflow</h3>
      <div className="flex-1 flex flex-col justify-between relative">
        
        {/* Connecting line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-500/50 via-rose-500/50 to-transparent -z-10" />

        {steps.map((step, idx) => {
          const isActive = activeAgent === step.id;
          const isPast = steps.findIndex(s => s.id === activeAgent) > idx || activeAgent === "done";
          const isDone = isPast || activeAgent === "done";

          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center gap-5 relative group">
              {/* Pulse animation for active step */}
              {isActive && (
                <div className="absolute left-[2px] top-[2px] w-9 h-9 rounded-full bg-amber-500/40 animate-ping -z-10" />
              )}
              
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                }}
                className={clsx(
                  "w-10 h-10 rounded-full border flex items-center justify-center z-10 transition-all duration-300 backdrop-blur-md",
                  isActive ? "bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : 
                  isDone ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                  "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 shadow-none"
                )}
              >
                <Icon className={clsx("w-4 h-4 transition-colors duration-300", isActive || isDone ? "text-white" : "text-neutral-400 dark:text-neutral-500")} />
              </motion.div>
              
              <div className="flex-1 flex justify-between items-center">
                <span className={clsx("text-sm font-bold tracking-wide transition-colors duration-300", isActive ? "text-amber-600 dark:text-white drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : isDone ? "text-neutral-600 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-600")}>
                  {step.label}
                </span>
                
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] uppercase tracking-widest font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-inner"
                  >
                    Processing
                  </motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
