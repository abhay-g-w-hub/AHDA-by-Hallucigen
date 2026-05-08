"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, ShieldAlert, CheckCircle2, XCircle, BrainCircuit, Moon, Sun } from "lucide-react";
import WorkflowVisualizer from "@/components/WorkflowVisualizer";
import VerificationResult from "@/components/VerificationResult";
import { useTheme } from "next-themes";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVerify = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setError("");
    setResults(null);
    setActiveAgent("planner");

    // Smooth scroll to results area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      // Simulate agent workflow states for UI
      setTimeout(() => setActiveAgent("extractor"), 1000);
      setTimeout(() => setActiveAgent("retriever"), 2500);
      setTimeout(() => setActiveAgent("verifier"), 4000);

      const response = await axios.post("http://localhost:8080/api/verify", {
        text: inputText
      });
      
      setResults(response.data);
      setActiveAgent("done");
    } catch (err: any) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        setError(data.error + (data.openClawError ? `\nOpenClaw Logs: ${data.openClawError}` : ""));
        
        if (data.groqResults) {
          setResults({ claims: data.groqResults });
        }
      } else {
        setError(err.message || "Failed to verify text.");
      }
      setActiveAgent("done");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen text-neutral-900 dark:text-neutral-200 font-sans selection:bg-rose-500/30 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 flex flex-col h-screen relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between py-5 px-6 rounded-2xl bg-white/70 dark:bg-rose-950/20 border border-neutral-200 dark:border-rose-900/30 backdrop-blur-xl shadow-xl dark:shadow-2xl mb-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20 border border-amber-500/20 dark:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] dark:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400">AHDA</h1>
              <p className="text-xs font-bold text-rose-500 dark:text-rose-300/80 tracking-widest uppercase">Autonomous Fact Checker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-full bg-neutral-100 dark:bg-rose-950/40 border border-neutral-200 dark:border-rose-900/40 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-rose-950/40 border border-neutral-200 dark:border-rose-900/40 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200 shadow-inner">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              Engine Active
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-8 min-h-0 relative">
          
          {/* Left Column: Workflow Visualizer */}
          <div className="w-1/4 shrink-0 hidden lg:block">
            <div className="sticky top-0 bg-white/70 dark:bg-rose-950/20 border-t-[3px] border-t-amber-500 dark:border-t-amber-400 border border-neutral-200 dark:border-rose-900/30 backdrop-blur-xl rounded-2xl p-6 h-72 shadow-xl dark:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)] overflow-hidden transition-colors">
               <WorkflowVisualizer activeAgent={activeAgent} />
            </div>
          </div>

          {/* Right Column: Centered Input & Auto-scrolling Results */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 pt-4 px-2">
            
            <div className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full ${!results && !isProcessing && !error ? 'min-h-[60vh] justify-center' : 'mt-0 mb-10'}`}>
              
              <div className={`w-full max-w-3xl transition-all duration-700 ${!results && !isProcessing && !error ? 'scale-105' : 'scale-100'}`}>
                <div className="bg-white/70 dark:bg-rose-950/20 border border-neutral-200 dark:border-rose-900/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative overflow-hidden group transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <h2 className="text-sm font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    Target Text
                  </h2>
                  
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste an AI-generated response or internet claim here to verify its factual accuracy..."
                    className="flex-1 min-h-[160px] bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-rose-900/40 rounded-xl p-5 text-sm md:text-base text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 resize-none transition-all placeholder:text-neutral-400 dark:placeholder:text-rose-200/40 shadow-inner relative z-10"
                  />
                  
                  <button
                    onClick={handleVerify}
                    disabled={isProcessing || !inputText.trim()}
                    className="mt-6 w-full bg-gradient-to-r from-amber-500 to-rose-600 dark:from-amber-600 dark:to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-50 disabled:from-neutral-300 disabled:to-neutral-300 dark:disabled:from-neutral-800 dark:disabled:to-neutral-800 disabled:text-neutral-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg dark:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 relative overflow-hidden z-10"
                  >
                    {isProcessing ? "Analyzing Nodes..." : "Verify Facts"}
                    {!isProcessing && <Send className="w-4 h-4" />}
                    {isProcessing && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Results Section */}
            {(isProcessing || results || error) && (
              <div ref={resultsRef} className="w-full max-w-4xl mx-auto scroll-mt-6">
                <div className="bg-white/70 dark:bg-rose-950/20 border-t-[3px] border-t-rose-500 dark:border-t-rose-400 border border-neutral-200 dark:border-rose-900/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl dark:shadow-[0_10px_30px_-10px_rgba(244,63,94,0.15)] relative transition-colors">
                  
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-rose-900/30">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
                      Intelligence Report
                    </h2>
                    {results && (
                      <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-sm dark:shadow-lg ${results.overall_confidence > 0.7 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        Confidence: {(results.overall_confidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-6 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm rounded-xl whitespace-pre-wrap font-mono relative z-10 shadow-inner">
                      {error}
                    </div>
                  )}

                  {isProcessing && !results && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-rose-500/70 dark:text-rose-300/60 gap-6">
                      <div className="relative flex items-center justify-center w-16 h-16">
                        <div className="absolute inset-0 border-4 border-rose-200 dark:border-rose-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-rose-600 dark:border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                        <BrainCircuit className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-pulse" />
                      </div>
                      <p className="animate-pulse font-bold tracking-widest uppercase text-xs">Orchestrating Agents...</p>
                    </div>
                  )}

                  {results && results.claims && (
                    <div className="space-y-6">
                      {results.claims.map((claimResult: any, idx: number) => (
                        <VerificationResult key={idx} result={claimResult} />
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
}
