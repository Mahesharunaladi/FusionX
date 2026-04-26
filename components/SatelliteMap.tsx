import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'motion/react';
import { SatellitePatch } from '../constants';
import { cn } from '../lib/utils';

interface MapProps {
  patches: SatellitePatch[];
  onPatchClick: (patch: SatellitePatch) => void;
  center?: [number, number];
  zoom?: number;
}

// Fix Leaflet marker icon issue
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div class="marker-inner"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapEvents({ onZoomChange, onMove }: { onZoomChange: (z: number) => void; onMove: (c: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    const handleEvents = () => {
      onZoomChange(map.getZoom());
      const center = map.getCenter();
      onMove([center.lat, center.lng]);
    };
    map.on('zoomend', handleEvents);
    map.on('moveend', handleEvents);
    return () => {
      map.off('zoomend', handleEvents);
      map.off('moveend', handleEvents);
    };
  }, [map, onZoomChange, onMove]);
  return null;
}

function MapResizer({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function SatelliteMap({ patches, onPatchClick, center: initialCenter = [20, 0], zoom: initialZoom = 2 }: MapProps) {
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(initialCenter);
  const globeRef = useRef<any>();

  // Determine if we should show the globe based on zoom
  const isGlobeMode = currentZoom < 3.5;

  // Sync initial props
  useEffect(() => {
    setCurrentZoom(initialZoom);
    setCurrentCenter(initialCenter);
  }, [initialZoom, initialCenter]);

  // Points for the globe
  const globePoints = useMemo(() => patches.map(p => ({
    lat: p.lat,
    lng: p.lng,
    size: 0.5,
    color: '#3B82F6',
    label: p.id,
    patch: p
  })), [patches]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0A0B0D]">
      <AnimatePresence mode="wait">
        {isGlobeMode ? (
          <motion.div
            key="globe-view"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Globe
              ref={globeRef}
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={globePoints}
              pointColor="color"
              pointAltitude="size"
              pointRadius={0.5}
              pointsMerge={true}
              pointLabel="label"
              onPointClick={(point: any) => {
                onPatchClick(point.patch);
              }}
              onZoom={(z: any) => {
                // Approximate leaflet zoom from distance if needed, 
                // but let's rely on standard rotation for now
              }}
              labelsData={globePoints}
              labelLat={d => (d as any).lat}
              labelLng={d => (d as any).lng}
              labelText={d => (d as any).label}
              labelSize={0.5}
              labelDotRadius={0.2}
              labelColor={() => 'rgba(255, 255, 255, 0.7)'}
              labelResolution={2}
            />
            {/* Globe View Instructions */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
               <div className="w-[60vh] h-[60vh] border border-blue-500/20 rounded-full animate-pulse" />
            </div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">Global Semantic Index Active</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="map-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <MapContainer
              center={currentCenter}
              zoom={currentZoom}
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <MapResizer center={currentCenter} zoom={currentZoom} />
              <MapEvents 
                onZoomChange={setCurrentZoom} 
                onMove={setCurrentCenter} 
              />
              
              {patches.map((patch) => (
                <Marker
                  key={patch.id}
                  position={[patch.lat, patch.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => onPatchClick(patch),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                      <img src={patch.imageUrl} alt={patch.id} className="w-full h-24 object-cover rounded mb-2" />
                      <h3 className="text-sm font-bold capitalize">{patch.id}</h3>
                      <p className="text-xs text-gray-500 mb-2 truncate">{patch.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {patch.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Overlay HUD */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono opacity-60">Engine State</span>
          </div>
          <span className="text-xs font-mono font-medium">HNSW Index Active</span>
        </div>
        
        {/* Toggle View Control */}
        <button 
          onClick={() => setCurrentZoom(isGlobeMode ? 6 : 2)}
          className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg hover:bg-white/10 transition-colors text-[10px] font-mono uppercase tracking-widest text-left"
        >
          Projection: <span className="text-blue-400">{isGlobeMode ? 'Spherical' : 'Mercator'}</span>
        </button>
      </div>

      <div className="absolute bottom-10 left-4 z-[1000] space-y-2">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-[300px]">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-50 mb-2">Live Insights</h4>
          <p className="text-xs leading-relaxed opacity-80">
            {isGlobeMode 
              ? "Scanning global vector space. Rotate to explore clusters." 
              : "Spectral analysis focused on local patch. Resolution optimal."}
          </p>
        </div>
      </div>
    </div>
  );
}
