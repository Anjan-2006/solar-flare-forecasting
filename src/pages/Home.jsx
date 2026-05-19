import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronDown, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';

import heroFlare from '../assets/images/hero-flare.jpg';
import activeSun from '../assets/images/active-sun.png';
import reconnection from '../assets/images/magnetic-reconnection.jpg';
import cmeBlast from '../assets/images/cme-eruption.jpg';
import earthThreat from '../assets/images/geomagnetic-storm.jpeg';
import carrington from '../assets/images/carrington-event.jpeg';
import quebec from '../assets/images/quebec-blackout.jpeg';
import starlink from '../assets/images/starlink-storm.jpg';

const STORY_IMAGES = {
  heroFlare,
  activeSun,
  reconnection,
  cmeBlast,
  earthThreat,
  carrington,
  quebec,
  starlink
};

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 800]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-hidden selection:bg-orange-500/30">
      
      {/* SECTION 1 — HERO INTRO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-10" />
          <img src={STORY_IMAGES.heroFlare} alt="Solar Flare" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay z-10" />
        </motion.div>
        
        <div className="relative z-20 text-center max-w-5xl mx-auto px-6">
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            className="text-orange-400 font-mono tracking-[0.3em] text-sm md:text-base uppercase mb-6"
          >
            The Hidden Danger
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 leading-[1.1]"
          >
            Every few years, the Sun reminds humanity how fragile technology truly is.
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2 }}>
            <ChevronDown className="w-8 h-8 text-white/30 mx-auto animate-bounce mt-16" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — THE SUN IS NOT QUIET */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <FadeIn className="w-full md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">A Star in Turmoil.</h2>
            <p className="text-xl text-white/60 leading-relaxed font-light">
              From a distance, the Sun appears to be a stable, glowing sphere. But beneath its photosphere lies a violently churning ocean of superheated plasma.
            </p>
            <p className="text-xl text-white/60 leading-relaxed font-light">
              It is constantly active. Generating intense magnetic fields that twist, stretch, and warp under the immense pressure of its own rotation. This magnetic instability builds up over an 11-year cycle, turning the Sun into a ticking time bomb.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="w-full md:w-1/2">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(234,88,12,0.1)] group">
              <div className="absolute inset-0 bg-orange-500/20 mix-blend-overlay z-10 group-hover:bg-transparent transition-all duration-1000" />
              <img src={STORY_IMAGES.activeSun} alt="Active Sun" className="w-full h-[600px] object-cover scale-100 group-hover:scale-105 transition-transform duration-[2s]" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 3 — MAGNETIC RECONNECTION */}
      <section className="relative py-32 px-6 bg-[#0a0a0c] border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
          <FadeIn className="w-full md:w-1/2 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The Snap.</h2>
            <p className="text-xl text-white/60 leading-relaxed font-light">
              As sunspots emerge, their magnetic field lines become tangled. The tension rises. 
              Eventually, physics demands a release.
            </p>
            <p className="text-xl text-white/60 leading-relaxed font-light">
              In an instant, these twisted magnetic fields cross and reconnect. The sheer tension suddenly snaps into a simpler configuration, releasing energy equivalent to millions of hydrogen bombs exploding simultaneously. We call this a <strong className="text-white font-medium">Solar Flare</strong>.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="w-full md:w-1/2">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/5 group">
              <img src={STORY_IMAGES.reconnection} alt="Magnetic Reconnection" className="w-full h-[500px] object-cover mix-blend-screen scale-100 group-hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Magnetic Field Line Tension Release</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 4 — CORONAL MASS EJECTIONS */}
      <section className="relative py-32 px-6">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <FadeIn>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">A Billion Tons of Plasma.</h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-2xl text-white/70 leading-relaxed font-light">
              A solar flare is just the flash. The true danger follows immediately after.
            </p>
            <p className="text-2xl text-white/70 leading-relaxed font-light mt-6">
              Major flares often violently eject the Sun's coronal material outward into deep space. This is a Coronal Mass Ejection (CME). A massive cloud of highly charged radioactive plasma racing across the solar system at millions of miles per hour.
            </p>
            <p className="text-2xl text-white font-medium mt-6">
              And sometimes... it is pointed directly at Earth.
            </p>
          </FadeIn>
          <FadeIn delay={0.4} className="pt-12">
            <img src={STORY_IMAGES.cmeBlast} alt="CME" className="w-full h-[400px] object-cover rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.15)] border border-red-500/10" />
          </FadeIn>
        </div>
      </section>

      {/* SECTION 5 — WHEN SPACE WEATHER HITS EARTH */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={STORY_IMAGES.earthThreat} alt="Earth at Night" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">The Collision.</h2>
            <p className="text-2xl text-red-200/80 font-light max-w-3xl mx-auto">
              When a CME strikes our magnetosphere, it peels back Earth's magnetic defenses and triggers a severe Geomagnetic Storm.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Power Grid Collapse", desc: "Geomagnetically induced currents enter the ground, overheating high-voltage transformers and triggering cascading, continent-wide blackouts." },
              { title: "GPS & Radio Blackouts", desc: "The ionosphere becomes heavily ionized, scrambling high-frequency aviation comms and throwing GPS navigation off by tens of meters." },
              { title: "Satellite Degradation", desc: "Atmospheric heating expands the thermosphere, violently increasing orbital drag and dragging billions of dollars of hardware back to Earth." }
            ].map((threat, i) => (
              <FadeIn key={i} delay={0.2 + (i * 0.1)}>
                <div className="bg-black/60 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10 hover:border-red-500/30 transition-colors h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">{threat.title}</h3>
                  <p className="text-white/60 leading-relaxed text-lg">{threat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — REAL HISTORICAL DISASTERS */}
      <section className="relative py-32 px-6 bg-[#08080a] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Humanity Already Received Warnings.</h2>
            <p className="text-xl text-white/50">These events are not theoretical. They have already happened.</p>
          </FadeIn>

          <div className="space-y-32">
            
            <FadeIn>
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="w-full md:w-5/12">
                  <img src={STORY_IMAGES.carrington} alt="Telegraph" className="w-full h-[300px] object-cover rounded-[2rem] grayscale border border-white/10" />
                </div>
                <div className="w-full md:w-7/12 space-y-4">
                  <span className="font-mono text-orange-400 tracking-widest uppercase">September 1859</span>
                  <h3 className="text-4xl font-bold">The Carrington Event</h3>
                  <p className="text-lg text-white/70 leading-relaxed">
                    The most intense geomagnetic storm in recorded history. Telegraph systems across Europe and North America failed, throwing sparks and igniting fires in telegraph offices. Auroras were so bright they woke gold miners in the Rocky Mountains. If it happened today, damages would exceed $2 trillion.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
                <div className="w-full md:w-5/12">
                  <img src={STORY_IMAGES.quebec} alt="Quebec Blackout" className="w-full h-[300px] object-cover rounded-[2rem] border border-white/10 opacity-80" />
                </div>
                <div className="w-full md:w-7/12 space-y-4">
                  <span className="font-mono text-red-400 tracking-widest uppercase">March 1989</span>
                  <h3 className="text-4xl font-bold">The Quebec Blackout</h3>
                  <p className="text-lg text-white/70 leading-relaxed">
                    An X-class flare caused the entire Hydro-Québec power grid to collapse in just 92 seconds. Six million people were plunged into freezing darkness for 9 hours. It proved that modern, interconnected power infrastructure was disastrously vulnerable to space weather.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="w-full md:w-5/12">
                  <img src={STORY_IMAGES.starlink} alt="Starlink" className="w-full h-[300px] object-cover rounded-[2rem] border border-white/10 opacity-90" />
                </div>
                <div className="w-full md:w-7/12 space-y-4">
                  <span className="font-mono text-blue-400 tracking-widest uppercase">February 2022</span>
                  <h3 className="text-4xl font-bold">SpaceX Starlink Drag</h3>
                  <p className="text-lg text-white/70 leading-relaxed">
                    A relatively minor geomagnetic storm expanded the upper atmosphere, increasing orbital drag by 50%. As a result, 38 newly launched Starlink satellites failed to reach their target orbits, falling back and burning up upon atmospheric reentry—tens of millions of dollars lost overnight.
                  </p>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* SECTION 7 — WHY PREDICTION MATTERS */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">We Cannot Stop The Sun.</h2>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <p className="text-3xl text-orange-200/90 font-light">
              But we can predict it.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.6} className="pt-8">
            <p className="text-xl text-white/60 leading-relaxed font-light max-w-3xl mx-auto mb-16">
              That is why this Observatory exists. By analyzing continuous NOAA telemetry datasets through deep LSTM neural networks, we can detect the subtle magnetic and X-ray anomalies that precede a major flare. Our AI doesn't just predict the threat—using SHAP causality synthesis, it explains exactly <em className="text-white">why</em> the threat is imminent.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="/csv-analysis" className="px-8 py-4 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-500 transition-colors flex items-center gap-3 shadow-[0_0_30px_rgba(234,88,12,0.4)]">
                <BrainCircuit className="w-5 h-5" />
                Analyze Batch Telemetry
              </a>
              <a href="/live-forecast" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-400" />
                Monitor Live Forecast
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
};

export default Home;
