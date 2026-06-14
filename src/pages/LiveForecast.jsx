import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck, ThermometerSun, Magnet, Wind, Target, FileText } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLiveStore } from '../store/useLiveStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solar-flare-backend.onrender.com';

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

const drawPdfChart = (pdf, title, data, x, y, w, h, color) => {
  pdf.setFontSize(11);
  pdf.setTextColor(0);
  pdf.text(title, x, y);
  
  const boxY = y + 5;
  pdf.setDrawColor(200);
  pdf.rect(x, boxY, w, h);
  
  if (!data || data.length === 0) return;
  
  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  
  pdf.setDrawColor(color.r, color.g, color.b);
  pdf.setLineWidth(0.8);
  
  const points = data.map((d, i) => {
    const px = x + (i / (data.length - 1)) * w;
    const py = boxY + h - ((d.value - minV) / range) * h;
    return [px, py];
  });
  
  for (let i = 0; i < points.length - 1; i++) {
    pdf.line(points[i][0], points[i][1], points[i+1][0], points[i+1][1]);
  }
};

const LiveForecast = () => {
  const { data, explainability, lastUpdated, history, updateTelemetry } = useLiveStore();
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [liveRes, expRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/predict/live`),
        axios.get(`${API_BASE_URL}/explainability`)
      ]);
      updateTelemetry(liveRes.data, expRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch live telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data) fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const exportLiveReport = async () => {
    if (!data) return;
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 20;
      const contentWidth = 170;
      const pageHeight = 297;
      let y = 20;
      let pageNum = 1;

      const checkPageBreak = (neededSpace) => {
        if (y + neededSpace > pageHeight - margin) {
          pdf.addPage();
          pageNum++;
          y = margin;
          pdf.setFontSize(8);
          pdf.setTextColor(150);
          pdf.text(`Page ${pageNum}`, 100, pageHeight - 10, { align: 'center' });
          pdf.setTextColor(0);
        }
      };

      // 1. Report Header
      pdf.setFontSize(22);
      pdf.setTextColor(234, 88, 12); // Orange accent
      pdf.text("Solar Flare Forecast Report", margin, y);
      y += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated Timestamp: ${new Date().toUTCString()}`, margin, y);
      y += 6;
      pdf.text(`NOAA Live Telemetry Session: OBR-LIVE-${new Date().getTime().toString().slice(-6)}`, margin, y);
      
      pdf.setDrawColor(200);
      pdf.line(margin, y + 5, margin + contentWidth, y + 5);
      
      // 2. Prediction Summary
      y += 15;
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text("Live Prediction Summary", margin, y);
      y += 8;
      pdf.setFontSize(11);
      pdf.text(`Current Prediction: ${data.prediction}`, margin, y);
      pdf.text(`Probability: ${(data.probability * 100).toFixed(1)}%`, margin + 100, y);
      y += 6;
      pdf.text(`Confidence: ${data.confidence}`, margin, y);
      pdf.text(`Forecast Window: ${data.forecast_window}`, margin + 100, y);

      // 3. Live Telemetry Values
      y += 15;
      pdf.setFontSize(16);
      pdf.text("Current Telemetry Conditions", margin, y);
      y += 8;
      pdf.setFontSize(11);
      pdf.text(`X-Ray Flux (1-8Å): ${data.latest_conditions?.xrsb_flux?.toExponential(2)} W/m²`, margin, y);
      y += 6;
      pdf.text(`Magnetic Bz: ${data.latest_conditions?.Bz?.toFixed(2)} nT`, margin, y);
      y += 6;
      pdf.text(`Solar Wind Speed: ${data.latest_conditions?.flow_speed?.toFixed(0)} km/s`, margin, y);

      if (explainability) {
        // 4. AI Prediction Analysis
        checkPageBreak(50);
        y += 15;
        pdf.setFontSize(16);
        pdf.text("AI Prediction Analysis", margin, y);
        y += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(60);
        const text = explainability.ai_explanation || explainability.explanation;
        const split = pdf.splitTextToSize(text, contentWidth);
        pdf.text(split, margin, y);
        y += (split.length * 5) + 10;

        // 5. Feature Importance Section
        checkPageBreak(50);
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text("Top Influencing Features", margin, y);
        y += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(60);
        explainability.top_features.slice(0, 5).forEach((feat, idx) => {
          pdf.text(`${idx + 1}. ${feat.feature}`, margin, y);
          pdf.text(`Importance: ${feat.importance.toFixed(4)}`, margin + 120, y);
          y += 6;
        });
      }

      // 6. Trend Graph Sections (Programmatic drawing using jsPDF natively)
      checkPageBreak(100);
      y += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text("Live Telemetry Trends", margin, y);
      y += 10;

      const chartW = 75;
      const chartH = 35;
      
      // Top row
      drawPdfChart(pdf, "Flare Probability Trend (%)", history.prob, margin, y, chartW, chartH, {r:239, g:68, b:68});
      drawPdfChart(pdf, "X-Ray Flux Trend", history.xrs, margin + chartW + 20, y, chartW, chartH, {r:234, g:88, b:12});
      y += chartH + 15;
      
      // Bottom row
      drawPdfChart(pdf, "Magnetic Bz Trend (nT)", history.bz, margin, y, chartW, chartH, {r:251, g:146, b:60});
      drawPdfChart(pdf, "Solar Wind Speed (km/s)", history.flow, margin + chartW + 20, y, chartW, chartH, {r:252, g:211, b:77});
      y += chartH + 20;

      // 7. SHAP Analysis
      if (explainability) {
        checkPageBreak(120);
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text("SHAP Feature Distribution", margin, y);
        y += 10;
        
        const shapImg1 = await getBase64ImageFromUrl(`${API_BASE_URL}${explainability.summary_plot}`);
        if (shapImg1) {
          pdf.addImage(shapImg1, 'PNG', margin, y, contentWidth, 90);
          y += 100;
        }

        checkPageBreak(120);
        pdf.text("SHAP Mean Absolute Importance", margin, y);
        y += 10;
        const shapImg2 = await getBase64ImageFromUrl(`${API_BASE_URL}${explainability.importance_plot}`);
        if (shapImg2) {
          pdf.addImage(shapImg2, 'PNG', margin, y, contentWidth, 90);
          y += 100;
        }
      }

      // 8. Historical Prediction Trend (Data Table)
      checkPageBreak(60);
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text("Historical Prediction Log (Session)", margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(60);
      
      pdf.text("Timestamp", margin, y);
      pdf.text("Probability", margin + 50, y);
      pdf.text("X-Ray Flux", margin + 90, y);
      pdf.text("Bz (nT)", margin + 140, y);
      pdf.line(margin, y + 2, margin + contentWidth, y + 2);
      y += 7;

      [...history.prob].reverse().slice(0, 10).forEach((h, i) => {
        checkPageBreak(10);
        const xrsData = [...history.xrs].reverse()[i];
        const bzData = [...history.bz].reverse()[i];
        pdf.text(h.time, margin, y);
        pdf.text(`${h.value.toFixed(1)}%`, margin + 50, y);
        pdf.text(`${xrsData?.value?.toExponential(2) || 'N/A'}`, margin + 90, y);
        pdf.text(`${bzData?.value?.toFixed(2) || 'N/A'}`, margin + 140, y);
        y += 6;
      });

      pdf.save(`solar_forecast_report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const getMetricCard = (title, value, unit, icon, isHighAlert = false) => (
    <div className={`glass-panel p-8 rounded-3xl relative overflow-hidden group ${isHighAlert ? 'border-red-500/30' : 'border-white/5'}`}>
      <div className="flex items-start justify-between relative z-10 mb-6">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-orange-400">
          {icon}
        </div>
        {isHighAlert && (
          <span className="flex h-3 w-3 relative mt-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
          <span className="text-sm font-mono text-white/40">{unit}</span>
        </div>
      </div>
    </div>
  );

  const renderTrendChart = (title, dataKey, dataSet, color) => (
    <div className="glass-panel p-8 rounded-3xl flex flex-col h-[350px] border-white/5 bg-[#0a0a0c]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        <span className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Activity className="w-3 h-3 text-white/50" /> Live Feed
        </span>
      </div>
      <div className="flex-grow w-full ml-[-25px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataSet}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#ffffff20', borderRadius: '8px' }}
              itemStyle={{ color: color }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#color-${dataKey})`} isAnimationActive={true} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const isRisk = data?.probability >= data?.threshold;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pt-8 pb-20">
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Live Solar Forecast</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </div>
          </div>
          <p className="text-white/60 text-lg">Real-time inference mapping of current solar weather conditions.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={exportLiveReport} disabled={isExporting || !data} className="px-5 py-3 rounded-xl glass-card text-white text-sm font-medium hover:bg-white/10 flex items-center gap-2 transition-colors">
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isExporting ? "Generating PDF..." : "Export Scientific Report"}
          </button>
          <button onClick={fetchData} disabled={isLoading} className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel border-red-500/50 bg-red-950/40 p-5 rounded-2xl flex items-center gap-4 text-red-200">
          <AlertTriangle className="w-6 h-6" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            
            <div className={`glass-panel rounded-[2rem] p-12 relative overflow-hidden border-t-4 ${isRisk ? 'border-red-500' : 'border-emerald-500'}`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                <div className="flex items-center gap-8 w-full">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${isRisk ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                    {isRisk ? <AlertTriangle className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                  </div>
                  <div>
                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">Real-Time Prediction</p>
                    <h2 className="text-5xl font-bold text-white tracking-tighter">{data.prediction}</h2>
                    <div className="flex gap-4 mt-3 text-sm font-mono text-white/50">
                      <span>Confidence: <strong className={isRisk ? 'text-red-400' : 'text-emerald-400'}>{data.confidence}</strong></span>
                      <span>•</span>
                      <span>Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#0a0a0c] rounded-3xl p-8 border border-white/5 min-w-[320px] text-center shadow-lg">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Flare Probability</p>
                  <p className="text-6xl font-bold font-mono tracking-tighter" style={{ color: isRisk ? '#ef4444' : '#10b981' }}>
                    {(data.probability * 100).toFixed(1)}<span className="text-3xl text-white/30 ml-1">%</span>
                  </p>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-6">
                    <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${data.probability * 100}%`, background: isRisk ? '#ef4444' : '#10b981' }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight px-2">Current Solar Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getMetricCard("X-Ray Flux", data.latest_conditions?.xrsb_flux ? data.latest_conditions.xrsb_flux.toExponential(2) : "N/A", "W/m²", <ThermometerSun className="w-6 h-6" />, data.latest_conditions?.xrsb_flux > 1e-5)}
                {getMetricCard("Magnetic Bz", data.latest_conditions?.Bz ? data.latest_conditions.Bz.toFixed(2) : "N/A", "nT", <Magnet className="w-6 h-6" />)}
                {getMetricCard("Solar Wind", data.latest_conditions?.flow_speed ? data.latest_conditions.flow_speed.toFixed(0) : "N/A", "km/s", <Wind className="w-6 h-6" />)}
                {getMetricCard("Threshold", (data.threshold * 100).toFixed(0), "%", <Target className="w-6 h-6" />)}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight px-2">Live Telemetry Trends</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-1 -m-1 bg-background">
                {renderTrendChart("Flare Probability Trend", "prob", history.prob, isRisk ? "#ef4444" : "#f97316")}
                {renderTrendChart("X-Ray Flux Trend (1-8Å)", "xrs", history.xrs, "#ea580c")}
                {renderTrendChart("Magnetic Bz Trend", "bz", history.bz, "#fb923c")}
                {renderTrendChart("Solar Wind Speed Trend", "flow", history.flow, "#fcd34d")}
              </div>
            </div>

            {explainability && (
              <div className="space-y-8 pt-6">
                <h2 className="text-2xl font-bold text-white tracking-tight px-2">AI Prediction Analysis</h2>
                
                <div className="glass-panel p-10 rounded-[2rem] border-white/5 shadow-lg">
                  <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-white/80 prose-p:text-lg max-w-none">
                    <p>{explainability.ai_explanation || explainability.explanation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                  <div className="glass-panel p-8 rounded-[2rem] border-white/5 shadow-lg flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-white mb-6">SHAP Summary Plot</h3>
                    <div className="bg-[#0a0a0c] rounded-2xl p-4 border border-white/5 w-full h-[400px] flex items-center justify-center">
                       <img 
                          src={`${API_BASE_URL}${explainability.summary_plot}`} 
                          alt="SHAP Summary Plot" 
                          className="w-full h-full object-contain mix-blend-screen opacity-90"
                       />
                    </div>
                  </div>
                  
                  <div className="glass-panel p-8 rounded-[2rem] border-white/5 shadow-lg flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-white mb-6">Feature Importance</h3>
                    <div className="bg-[#0a0a0c] rounded-2xl p-4 border border-white/5 w-full h-[400px] flex items-center justify-center">
                       <img 
                          src={`${API_BASE_URL}${explainability.importance_plot}`} 
                          alt="SHAP Feature Importance Plot" 
                          className="w-full h-full object-contain mix-blend-screen opacity-90"
                       />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveForecast;
