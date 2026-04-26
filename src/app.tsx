
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SatelliteMap from './components/SatelliteMap';
import GeospatialSearch from './components/GeospatialSearch';
import VQAOverlay from './components/VQAOverlay';
import { MOCK_DATA, SatellitePatch } from './constants';
import { parseGeospatialQuery } from './services/geminiService';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [filteredPatches, setFilteredPatches] = useState<SatellitePatch[]>(MOCK_DATA);
  const [selectedPatch, setSelectedPatch] = useState<SatellitePatch | null>(null);
  const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number }>({
    center: [20, 0],
    zoom: 2,
  });

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResult(null);
    try {
      const parsed = await parseGeospatialQuery(query);
      setSearchResult(parsed);

      // Simulate vector search filtering MOCK_DATA
      // In reality, this would be a FAISS/Pinecone query
      const feature = parsed.semantic_feature?.toLowerCase() || '';
      const relevant = MOCK_DATA.filter(p => 
        p.tags.some(t => t.includes(feature) || feature.includes(t)) ||
        p.description.toLowerCase().includes(feature)
      );

      if (relevant.length > 0) {
        setFilteredPatches(relevant);
        // Pan to the first result
        setMapView({
          center: [relevant[0].lat, relevant[0].lng],
          zoom: 8,
        });
      } else {
        // Just show everything if no specific match, but maybe zoom out
        setFilteredPatches(MOCK_DATA);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatchClick = (patch: SatellitePatch) => {
    setSelectedPatch(patch);
    setMapView({
      center: [patch.lat, patch.lng],
      zoom: 12,
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0B0D] text-gray-200 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex" />
      
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Top Search Overlay */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1100] w-full flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <GeospatialSearch 
              onSearch={handleSearch} 
              isSearching={isSearching} 
              searchResult={searchResult}
            />
          </div>
        </div>

        {/* Map Engine */}
        <div className="flex-1">
          <SatelliteMap 
            patches={filteredPatches} 
            onPatchClick={handlePatchClick}
            center={mapView.center}
            zoom={mapView.zoom}
          />
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-10 bg-[#15171D] border-t border-white/5 px-6 flex items-center justify-between z-[1000]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">Semantic Engine v2.4</span>
            </div>
            <div className="h-4 w-px bg-white/5" />
            <span className="text-[9px] font-mono opacity-40">Index: {MOCK_DATA.length} Global Tiles | SigLIP-B/16</span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-mono opacity-30 uppercase">Lat:</span>
               <span className="text-[9px] font-mono">{mapView.center[0].toFixed(4)}</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-[9px] font-mono opacity-30 uppercase">Lng:</span>
               <span className="text-[9px] font-mono">{mapView.center[1].toFixed(4)}</span>
             </div>
          </div>
        </footer>

        {/* VQA Intelligence Drawer */}
        <VQAOverlay 
          patch={selectedPatch} 
          onClose={() => setSelectedPatch(null)} 
        />
      </main>

      {/* Global Loading Overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[5000] flex items-center justify-center pointer-events-none">
           <div className="bg-[#15171D] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             <div className="text-center">
               <p className="text-sm font-bold opacity-80">Orchestrating Vector Retrieval</p>
               <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest mt-1">Cross-Modal Mapping Signature</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
