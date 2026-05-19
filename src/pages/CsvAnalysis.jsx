import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2, AlertCircle, Activity, ShieldCheck, AlertTriangle, Download, Target, BarChart3, Presentation, Table, Trash2, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { useCsvStore } from '../store/useCsvStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solarflare.anjan.top';

const getBase64ImageFromUrl = async (imageUrl) => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
};

const CsvAnalysis = () => {
  const { fileName, fileSize, csvPreview, result, explainability, setAnalysisState, clearAnalysis } = useCsvStore();
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);

  const parseCSVPreview = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '').slice(0, 6);
      if (lines.length > 0) {
        const parsed = lines.map(line => line.split(','));
        setLocalPreview(parsed);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
      parseCSVPreview(selectedFile);
    } else {
      setError("Please upload a valid CSV file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
      parseCSVPreview(droppedFile);
    } else {
      setError("Please upload a valid CSV file containing NOAA telemetry.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/predict/csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      let expData = null;
      if (res.data.status === 'success') {
        const expRes = await axios.get(`${API_BASE_URL}/explainability`);
        expData = expRes.data;
      }
      
      setAnalysisState(file.name, file.size, localPreview, res.data, expData);
      setFile(null);
      setLocalPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewDataset = () => {
    clearAnalysis();
    setFile(null);
    setLocalPreview(null);
    setError(null);
  };

  const exportScientificReport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const marginX = 20;
      let cursorY = 20;

      // Title & Branding
      pdf.setFontSize(22);
      pdf.setTextColor(234, 88, 12);
      pdf.text("Solar Flare Inference Report", marginX, cursorY);
      
      cursorY += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Dataset: ${fileName} | Generated: ${new Date().toUTCString()}`, marginX, cursorY);
      
      pdf.setDrawColor(200);
      pdf.line(marginX, cursorY + 5, 190, cursorY + 5);
      cursorY += 15;

      // Prediction Results
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("AI Prediction Summary", marginX, cursorY);
      
      cursorY += 8;
      pdf.setFontSize(12);
      pdf.text(`Outcome: ${result.prediction}`, marginX, cursorY);
      pdf.text(`Probability: ${(result.probability * 100).toFixed(2)}%`, marginX + 80, cursorY);
      
      cursorY += 6;
      pdf.text(`Confidence Level: ${result.confidence}`, marginX, cursorY);
      pdf.text(`Model: ${result.prediction_model}`, marginX + 80, cursorY);
      
      cursorY += 6;
      pdf.text(`Forecast Window: ${result.forecast_window}`, marginX, cursorY);
      
      cursorY += 15;

      if (explainability) {
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Primary Telemetry Drivers", marginX, cursorY);
        cursorY += 8;
        
        pdf.setFontSize(11);
        explainability.top_features.slice(0, 5).forEach((feat, idx) => {
          pdf.text(`${idx + 1}. ${feat.feature}`, marginX + 5, cursorY);
          pdf.text(`Importance: ${feat.importance.toFixed(4)}`, marginX + 80, cursorY);
          cursorY += 6;
        });

        cursorY += 10;

        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Scientific Causality Synthesis", marginX, cursorY);
        cursorY += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const text = explainability.ai_explanation || explainability.explanation;
        const splitText = pdf.splitTextToSize(text, 170);
        pdf.text(splitText, marginX, cursorY);
        cursorY += (splitText.length * 5) + 10;

        if (cursorY > 200) { pdf.addPage(); cursorY = 20; }
        
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text("SHAP Global Summary Topology", marginX, cursorY);
        cursorY += 10;

        const imgBase64 = await getBase64ImageFromUrl(`${API_BASE_URL}${explainability.summary_plot}`);
        if (imgBase64) {
          pdf.addImage(imgBase64, 'PNG', marginX, cursorY, 160, 100);
        }
      }

      pdf.save(`helios_scientific_report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const isRisk = result?.probability >= result?.threshold;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pt-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Batch Telemetry Analysis</h1>
            {result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                ANALYZED
              </div>
            )}
          </div>
          <p className="text-white/60 text-lg max-w-2xl">Upload historical NOAA datasets for deep sequence inference and SHAP causality analysis.</p>
        </div>
        
        {result && (
          <div className="flex items-center gap-4">
            <button onClick={exportScientificReport} disabled={isExporting} className="px-5 py-3 rounded-xl glass-card text-white text-sm font-medium hover:bg-white/10 flex items-center gap-2 transition-colors">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Scientific Report
            </button>
            <button onClick={handleNewDataset} className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-colors">
              <PlusCircle className="w-4 h-4" />
              Upload New Dataset
            </button>
          </div>
        )}
      </div>

      {!result && !isUploading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto mt-8">
          <div className="solar-glow">
            <div 
              className={`relative glass-panel rounded-[2rem] p-12 text-center border-2 border-dashed transition-all duration-500 ${isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-orange-500/30 hover:bg-white/5'}`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center gap-6 py-12">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500 bg-white/5 shadow-inner">
                    <UploadCloud className="w-12 h-12 text-white/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white tracking-tight">Drag & Drop Dataset</h3>
                    <p className="text-white/50 max-w-sm mx-auto">Time-series sequences of xrsa_flux, xrsb_flux, Bz, etc.</p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3.5 rounded-xl glass-card text-white font-medium hover:bg-white/10 mt-4 transition-colors">Browse Files</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 w-full py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-orange-500/20 text-orange-400 mb-2">
                      <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white tracking-tight">{file.name}</h3>
                    <p className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Inference</p>
                  </div>

                  <div className="flex gap-4 w-full justify-center">
                    <button onClick={() => { setFile(null); setLocalPreview(null); }} className="px-8 py-3.5 rounded-xl glass-card text-white font-medium hover:bg-white/10 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleUpload} className="px-8 py-3.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center gap-2">
                      <Activity className="w-5 h-5" /> Run Analysis
                    </button>
                  </div>
                </div>
              )}
              
              {error && <div className="absolute bottom-6 left-0 right-0 flex justify-center"><div className="bg-red-950/80 text-red-200 px-5 py-2.5 rounded-xl border border-red-500/50 flex items-center gap-2 shadow-lg"><AlertCircle className="w-5 h-5" />{error}</div></div>}
            </div>
          </div>
        </motion.div>
      )}

      {isUploading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-[2rem] p-24 flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto mt-8 border-orange-500/20 shadow-[0_0_50px_rgba(234,88,12,0.1)]">
          <Loader2 className="w-20 h-20 text-orange-500 animate-spin" />
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold text-white tracking-tight">Evaluating Tensor Sequences</h3>
            <p className="text-white/60 font-mono text-base animate-pulse">Computing SHAP causality metadata against deep learning model...</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {result && !isUploading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            
            {/* Prediction Summary Grid */}
            <div className={`glass-panel rounded-[2.5rem] p-12 relative overflow-hidden border-t-[6px] ${isRisk ? 'border-red-500' : 'border-emerald-500'} shadow-2xl`}>
              <div className={`absolute top-0 right-0 w-full h-[500px] blur-[100px] opacity-10 ${isRisk ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600 via-transparent to-transparent'} pointer-events-none`} />
              
              <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                <div className="space-y-6 w-full lg:w-1/2">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${isRisk ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {isRisk ? <AlertTriangle className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                    </div>
                    <div>
                      <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-1">Inference Result</p>
                      <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">{result.prediction}</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="glass-card p-5 rounded-2xl border-white/5">
                      <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Confidence</p>
                      <p className={`text-2xl font-bold tracking-tight ${isRisk ? 'text-red-400' : 'text-emerald-400'}`}>{result.confidence}</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border-white/5">
                      <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Forecast Window</p>
                      <p className="text-2xl font-bold tracking-tight text-white">{result.forecast_window}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                  <div className="w-72 h-72 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" 
                        barSize={24} data={[{ name: 'Prob', value: result.probability * 100, fill: isRisk ? '#ef4444' : '#10b981' }]} 
                        startAngle={180} endAngle={0}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar minAngle={15} background={{ fill: '#ffffff10' }} clockWise dataKey="value" cornerRadius={12} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                      <span className="text-6xl font-bold font-mono text-white tracking-tighter">{(result.probability * 100).toFixed(1)}<span className="text-3xl text-white/40 ml-1">%</span></span>
                      <span className="text-sm text-white/50 font-bold uppercase tracking-widest mt-2">Probability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PERFECT CSV DATA PREVIEW TABLE */}
            {csvPreview && (
              <div className="glass-panel rounded-[2rem] p-8 border-t border-orange-500/20 shadow-xl overflow-hidden flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <Table className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Analyzed Telemetry Data</h3>
                      <p className="text-sm font-mono text-orange-300/70 uppercase tracking-widest mt-1">Dataset: {fileName} (First 5 Rows)</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#060608] custom-scrollbar shadow-inner">
                  <table className="w-full text-left text-sm font-mono text-white/80 border-collapse min-w-max">
                    <thead className="bg-[#121216] text-white/50 border-b border-white/10">
                      <tr>
                        {csvPreview[0].map((header, i) => (
                          <th key={i} className="px-6 py-4 font-bold uppercase tracking-widest border-r border-white/5 last:border-0 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {csvPreview.slice(1).map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors odd:bg-[#0a0a0c] even:bg-[#0f0f13]">
                          {row.map((cell, j) => (
                            <td key={j} className="px-6 py-3.5 border-r border-white/5 last:border-0 whitespace-nowrap text-white/70">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {explainability && (
              <>
                {/* Text Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel p-10 rounded-[2rem] flex flex-col h-full border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">AI Prediction Analysis</h3>
                        <p className="text-sm text-orange-300/70 font-medium tracking-wide uppercase mt-1">Causality Synthesis</p>
                      </div>
                    </div>
                    <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-white/80 prose-p:text-lg flex-grow">
                      <p>{explainability.ai_explanation || explainability.explanation}</p>
                    </div>
                  </div>

                  <div className="glass-panel p-10 rounded-[2rem] flex flex-col h-full border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Primary Telemetry Drivers</h3>
                        <p className="text-sm text-orange-300/70 font-medium tracking-wide uppercase mt-1">Top Influencing Parameters</p>
                      </div>
                    </div>
                    <div className="space-y-6 flex-grow">
                      {explainability.top_features?.map((feat, idx) => (
                        <div key={idx} className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white/30 w-4">{idx + 1}.</span>
                              <span className="text-base font-mono text-white/90 font-semibold">{feat.feature}</span>
                            </div>
                            <span className="text-sm text-orange-300 font-mono bg-orange-950/50 px-3 py-1 rounded-lg border border-orange-500/20 shadow-inner">
                              {feat.importance.toFixed(4)}
                            </span>
                          </div>
                          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-orange-600 to-amber-400 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${(feat.importance / explainability.top_features[0].importance) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SHAP Visualizations */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold text-white tracking-tight px-2 pt-6">High-Dimensional SHAP Topology</h3>
                  
                  <div className="glass-panel p-8 rounded-[2rem] border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8 px-4">
                      <div>
                        <h4 className="text-2xl font-bold text-white">Global Summary Plot</h4>
                        <p className="text-white/50 text-base mt-1">Distribution of SHAP values across all data points, showing positive/negative impacts.</p>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0c] rounded-3xl p-6 border border-white/5 relative overflow-hidden group w-full h-[600px] flex items-center justify-center">
                       <img 
                          src={`${API_BASE_URL}${explainability.summary_plot}`} 
                          alt="SHAP Summary Plot" 
                          className="w-full h-full object-contain mix-blend-screen"
                       />
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-[2rem] border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8 px-4">
                      <div>
                        <h4 className="text-2xl font-bold text-white">Mean Absolute Importance</h4>
                        <p className="text-white/50 text-base mt-1">Average magnitude of feature impact on the model's sequence output.</p>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0c] rounded-3xl p-6 border border-white/5 relative overflow-hidden group w-full h-[500px] flex items-center justify-center">
                       <img 
                          src={`${API_BASE_URL}${explainability.importance_plot}`} 
                          alt="SHAP Feature Importance" 
                          className="w-full h-full object-contain mix-blend-screen"
                       />
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CsvAnalysis;
