import { Satellite, ShieldCheck, Database, History, Info, Layers, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const menuItems = [
    { icon: Satellite, label: 'Visual Search', active: true },
    { icon: Layers, label: 'Spectral Layers' },
    { icon: Database, label: 'Patch Database' },
    { icon: History, label: 'Search History' },
    { icon: ShieldCheck, label: 'Compliance Audit' },
  ];

  return (
    <aside className={cn("w-64 bg-[#15171D] border-r border-white/5 flex flex-col", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tighter">Terra<span className="text-blue-500">Semantic</span></h1>
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest text-nowrap">Geospatial Intelligence</p>
          </div>
        </div>

        <nav className="space-y-4">
          <div className="text-[10px] font-mono uppercase tracking-widest opacity-30 px-3 mb-2">Navigation</div>
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all group",
                item.active 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                  : "hover:bg-white/5 opacity-60 hover:opacity-100"
              )}
            >
              <item.icon className={cn("w-4 h-4", item.active ? "text-blue-400" : "opacity-60")} />
              <span className="font-medium tracking-tight">{item.label}</span>
              {item.active && <div className="ml-auto w-1 h-1 rounded-full bg-blue-400" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3 h-3 opacity-40" />
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">System Resources</span>
          </div>
          <div className="space-y-2">
            <ResourceBar label="Vector Index" value={84} />
            <ResourceBar label="GPU Compute" value={32} />
          </div>
        </div>

        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600" />
          <div className="flex flex-col">
            <span className="text-xs font-bold">Mahesh Aruna</span>
            <span className="text-[10px] font-mono opacity-30 uppercase">Lead Architect</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ResourceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-mono uppercase opacity-50">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
