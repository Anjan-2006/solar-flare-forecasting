import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, UploadCloud, Home as HomeIcon } from 'lucide-react';
import clsx from 'clsx';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'About the Project', path: '/', icon: HomeIcon },
    { name: 'CSV Analysis', path: '/analysis', icon: UploadCloud },
    { name: 'Live Telemetry', path: '/live', icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-2xl px-6 py-3 border-white/10 shadow-lg">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all duration-300">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Solar Weather Forecasting
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
