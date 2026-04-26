import { Search, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchResult?: any;
}

export default function GeospatialSearch({ onSearch, isSearching, searchResult }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-2xl px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl group-focus-within:bg-blue-500/30 transition-all duration-500 rounded-full" />
        <div className={cn(
          "relative flex items-center bg-[#15171D]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl transition-all duration-300",
          isSearching ? "border-blue-500/50" : "hover:border-white/20"
        )}>
          <Search className={cn("w-5 h-5 mr-3 transition-colors", isSearching ? "text-blue-500" : "opacity-40")} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patterns (e.g. 'illegal deforestation in rainforests' or 'large swimming pools in desert')"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:opacity-40"
            disabled={isSearching}
          />
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="p-2 rounded-full hover:bg-white/5 transition-colors opacity-40 hover:opacity-100"
              title="Filter Tools"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                !query.trim() || isSearching
                  ? "bg-white/5 opacity-50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              )}
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {isSearching ? "Thinking..." : "Analyze"}
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {searchResult && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-4 left-4 right-4 bg-[#15171D]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-blue-400">Semantic Mapping</h4>
                  <span className="text-[10px] font-mono opacity-40">Latency: 1.2s</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80 italic">
                  "{searchResult.explanation}"
                </p>
                <div className="mt-3 flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-40 font-mono">Sim Score</span>
                    <span className="text-sm font-mono text-green-400">{searchResult.confidence_threshold}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-40 font-mono">Area Context</span>
                    <span className="text-sm font-mono capitalize">{searchResult.area_type}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
              <Search className="w-32 h-32 transform translate-x-1/4 translate-y-1/4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
