import { Activity, Database, FileSearch, ShieldCheck, SlidersHorizontal } from "lucide-react";
import SatelliteMap from "./components/SatelliteMap";
import { ChangeEvent, useState } from "react";

const navItems = [
  "Visual Search",
  "Spectral Layers",
  "Patch Database",
  "Search History",
  "Compliance Audit",
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);
  const [uniqueCode, setUniqueCode] = useState("");
  const [vectorPreview, setVectorPreview] = useState<number[]>([]);
  const [encodeMessage, setEncodeMessage] = useState("Upload an image to generate vector code");

  async function handleEncode() {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsEncoding(true);
    setEncodeMessage("Encoding image...");
    try {
      const res = await fetch("http://localhost:8000/encode-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Unable to encode image");
      }
      const body = await res.json();
      setUniqueCode(body.unique_math_code ?? "");
      setVectorPreview(Array.isArray(body.vector_preview) ? body.vector_preview : []);
      setEncodeMessage(`Encoded ${body.embedding_dim ?? 0} dimensions`);
    } catch {
      setEncodeMessage("Encoding failed. Check backend is running on port 8000.");
    } finally {
      setIsEncoding(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
    setUniqueCode("");
    setVectorPreview([]);
  }

  return (
    <div className="screen">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">&gt;</div>
          <div>
            <div className="brand-title">TERRASEMANTIC</div>
            <div className="brand-subtitle">GEOSPATIAL INTELLIGENCE</div>
          </div>
        </div>

        <div className="nav-title">NAVIGATION</div>
        <nav className="nav-list">
          {navItems.map((item, idx) => (
            <button key={item} className={`nav-item ${idx === 0 ? "active" : ""}`} type="button">
              {idx === 0 && <FileSearch size={14} />}
              {idx === 1 && <SlidersHorizontal size={14} />}
              {idx === 2 && <Database size={14} />}
              {idx === 3 && <Activity size={14} />}
              {idx === 4 && <ShieldCheck size={14} />}
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="system-card">
          <div className="sys-title">SYSTEM RESOURCES</div>
          <div className="sys-row">
            <span>VECTOR INDEX</span>
            <span>84%</span>
          </div>
          <div className="bar">
            <div className="bar-fill vector" />
          </div>
          <div className="sys-row">
            <span>GPU COMPUTE</span>
            <span>32%</span>
          </div>
          <div className="bar">
            <div className="bar-fill gpu" />
          </div>
        </div>

        <div className="user-chip">
          <div className="avatar" />
          <div>
            <div className="user-name">Mahesh Aruna</div>
            <div className="user-role">LEAD ARCHITECT</div>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="top-center">
          <h1>TerraSemantic</h1>
          <div className="search-shell">
            <input placeholder="Search pattern (e.g. 'illegal mining near river')" />
            <button type="button">Analyze</button>
          </div>
          <div className="index-pill">GLOBAL SEMANTIC INDEX ACTIVE</div>
        </header>

        <section className="stage">
          <div className="starfield" />
          <div className="orbit-ring ring-a" />
          <div className="orbit-ring ring-b" />
          <div className="marker marker-a" />
          <div className="marker marker-b" />
          <div className="marker marker-c" />
          <SatelliteMap />
          <button type="button" className="preview-btn">
            Preview
          </button>
        </section>

        <aside className="right-status">
          <div className="status-chip">
            <span>ENGINE STATE</span>
            <strong>HNSW Index Active</strong>
          </div>
          <div className="status-chip">
            <span>PROJECTION</span>
            <strong>SPHERICAL</strong>
          </div>
        </aside>

        <section className="insights">
          <div className="insights-title">LIVE INSIGHTS</div>
          <p>Scanning global vector space. Rotate to explore clusters.</p>
        </section>
        <section className="encode-panel">
          <div className="insights-title">IMAGE TO VECTOR</div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="button" onClick={handleEncode} disabled={!selectedFile || isEncoding}>
            {isEncoding ? "Encoding..." : "Convert"}
          </button>
          <p className="encode-msg">{encodeMessage}</p>
          {uniqueCode && <p className="code-line">Code: {uniqueCode}</p>}
          {vectorPreview.length > 0 && (
            <p className="vector-line">v[0..11]: {vectorPreview.map((v) => v.toFixed(4)).join(", ")}</p>
          )}
        </section>

        <footer className="footer-bar">
          <span>SEMANTIC ENGINE v2.4</span>
          <span>Index: 5 Global Tiles | SigLIP-B/16</span>
          <span>LAT: 20.0000</span>
          <span>LNG: 0.0000</span>
        </footer>
      </main>
    </div>
  );
}
