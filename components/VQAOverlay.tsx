import { X, MessageSquare, Send, Globe, ScanSearch, MapPin, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import React from 'react';
import { SatellitePatch } from '../constants';
import { getGeminiResponse } from '../services/geminiService';
import { cn } from '../lib/utils';

interface VQAOverlayProps {
  patch: SatellitePatch | null;
  onClose: () => void;
}

export default function VQAOverlay({ patch, onClose }: VQAOverlayProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !patch) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      // Simulate VQA using Gemini. 
      // In a real app we'd send the patch image. 
      // For this demo, we'll tell Gemini about the patch.
      const prompt = `
        You are a Geospatial Analyst evaluating a satellite image patch.
        Patch ID: ${patch.id}
        Tags: ${patch.tags.join(', ')}
        Description: ${patch.description}
        Coordinates: ${patch.lat}, ${patch.lng}
        
        Question: ${userText}
        
        Provide a professional, technical analysis based on the visual properties described.
      `;
      
      const response = await getGeminiResponse(prompt);
      setMessages(prev => [...prev, { role: 'ai', text: response || "Analysis failed." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Spectral analysis error. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {patch && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#15171D] border-l border-white/10 z-[2000] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-bottom border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <ScanSearch className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-tight">Intelligence Node: {patch.id}</h3>
                <div className="flex items-center gap-4 text-[10px] font-mono opacity-40">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {patch.lat.toFixed(4)}, {patch.lng.toFixed(4)}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(patch.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Visual Metadata Section */}
            <div className="p-6 space-y-6">
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-video">
                <img src={patch.imageUrl} alt={patch.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {patch.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-mono tracking-widest opacity-40">Semantic Description</h4>
                <p className="text-sm leading-relaxed opacity-80">{patch.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Metric label="Confidence" value={`${(patch.confidence * 100).toFixed(1)}%`} color="text-green-400" />
                <Metric label="Sensor" value="Sentinel-2B" />
                <Metric label="Cloud Cover" value="1.2%" />
                <Metric label="Resolution" value="10m/px" />
              </div>

              <div className="h-px bg-white/5" />

              {/* Chat Interface */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest opacity-40">
                  <MessageSquare className="w-3 h-3" /> Visual Q&A Layer
                </h4>
                
                <div className="space-y-4 pb-20">
                  {messages.length === 0 && (
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                      <p className="text-xs text-blue-400 leading-relaxed italic">
                        "Ask about changes, object density, or spectral anomalies in this patch."
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-1 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}>
                      <div className={cn(
                        "p-3 rounded-2xl text-xs leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-blue-600 text-white" 
                          : "bg-white/5 border border-white/5 text-gray-300"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-mono opacity-20 uppercase">
                        {msg.role === 'user' ? 'Operator' : 'SigLIP Agent'}
                      </span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2 items-center text-xs opacity-40">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="font-mono">Analyzing spectral signature...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#1A1C23] border-t border-white/5">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask analysis question..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs pr-12 focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-black/20 border border-white/5 p-3 rounded-xl">
      <div className="text-[9px] uppercase font-mono opacity-40 mb-1">{label}</div>
      <div className={cn("text-xs font-bold", color)}>{value}</div>
    </div>
  );
}
