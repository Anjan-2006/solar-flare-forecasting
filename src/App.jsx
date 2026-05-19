import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import CsvAnalysis from './pages/CsvAnalysis';
import LiveForecast from './pages/LiveForecast';

const PageTransition = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function AppRoutes() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<CsvAnalysis />} />
        <Route path="/live" element={<LiveForecast />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
        {/* Cinematic deep space overlay */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-[1px] z-0"></div>
        
        {/* Subtle solar flare ambient glows */}
        <div className="fixed top-[-30%] left-[-10%] w-[60%] h-[60%] bg-orange-600/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed top-[40%] right-[20%] w-[30%] h-[30%] bg-red-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow pt-24 px-4 md:px-8 pb-12 w-full max-w-7xl mx-auto">
            <AppRoutes />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
