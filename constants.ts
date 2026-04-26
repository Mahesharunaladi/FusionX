export interface SatellitePatch {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  confidence: number;
  tags: string[];
  description: string;
  imageUrl: string;
}

export const MOCK_DATA: SatellitePatch[] = [
  {
    id: "patch-1",
    lat: -3.4653,
    lng: -62.2159,
    timestamp: "2024-03-15T10:30:00Z",
    confidence: 0.94,
    tags: ["deforestation", "amazon", "illegal-logging"],
    description: "New clearing detected near state border. Irregular patterns suggest unofficial road expansion.",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400"
  }
];