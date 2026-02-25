import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Truck, Building2, HeartHandshake, Navigation, Package,
  Clock, RefreshCcw, Wifi, WifiOff,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { trackingAPI } from '../api';

export default function TrackingPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'all' | 'restaurants' | 'ngos' | 'drivers'>('all');
  const [isLive, setIsLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [locations, setLocations] = useState<any>({ restaurants: [], ngos: [], drivers: [] });
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [locRes, jobRes] = await Promise.all([
        trackingAPI.allLocations(),
        trackingAPI.activeJobs(),
      ]);
      setLocations(locRes.data || { restaurants: [], ngos: [], drivers: [] });
      setActiveJobs(jobRes.data || []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const restaurants = locations.restaurants || [];
  const ngos = locations.ngos || [];
  const drivers = locations.drivers || [];

  const filters = [
    { key: 'all', label: t('tracking.all'), count: restaurants.length + ngos.length + drivers.length },
    { key: 'restaurants', label: t('tracking.restaurants'), count: restaurants.length, icon: Building2, color: 'text-orange-400' },
    { key: 'ngos', label: t('tracking.ngos'), count: ngos.length, icon: HeartHandshake, color: 'text-green-400' },
    { key: 'drivers', label: t('tracking.drivers'), count: drivers.length, icon: Truck, color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                <MapPin className="inline w-8 h-8 text-green-400 mr-2" />
                <span className="gradient-text">{t('tracking.title')}</span>
              </h1>
              <p className="text-slate-400 mt-1">{t('tracking.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isLive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isLive ? t('tracking.live') : t('tracking.offline')}
              </div>
              <button onClick={() => fetchData()} className="btn-secondary py-2 px-3 text-sm flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" />
                {t('tracking.refresh')}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setSelectedType(f.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === f.key ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
              {f.icon && <f.icon className={`w-3.5 h-3.5 ${(f as any).color || ''}`} />}
              {f.label}
              <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-xs">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 glass-card overflow-hidden relative" style={{ minHeight: '500px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950">
              <svg viewBox="0 0 800 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                  <radialGradient id="glow-g" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
                  <radialGradient id="glow-o" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f97316" stopOpacity="0.6" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></radialGradient>
                  <radialGradient id="glow-b" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" /><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" /></radialGradient>
                </defs>
                <rect width="800" height="600" fill="url(#grid)" />
                <path d="M 50 100 Q 100 200 80 350 Q 60 450 120 550" fill="none" stroke="rgba(14,165,233,0.15)" strokeWidth="2" strokeDasharray="5,5" />

                {(selectedType === 'all' || selectedType === 'restaurants') && restaurants.map((r: any, i: number) => {
                  const x = 100 + (i % 4) * 170 + Math.sin(i) * 30;
                  const y = 80 + Math.floor(i / 4) * 220 + Math.cos(i) * 30;
                  return (
                    <g key={`r-${r.id}`} className="cursor-pointer">
                      <circle cx={x} cy={y} r="18" fill="url(#glow-o)" opacity="0.4"><animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" /></circle>
                      <circle cx={x} cy={y} r="8" fill="#f97316" stroke="#1e293b" strokeWidth="2" />
                      <text x={x} y={y + 22} textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="600">{(r.name || '').split(' ').slice(0, 2).join(' ')}</text>
                    </g>
                  );
                })}

                {(selectedType === 'all' || selectedType === 'ngos') && ngos.map((n: any, i: number) => {
                  const x = 150 + (i % 3) * 200 + Math.sin(i * 2) * 40;
                  const y = 300 + Math.floor(i / 3) * 160 + Math.cos(i * 2) * 20;
                  return (
                    <g key={`n-${n.id}`} className="cursor-pointer">
                      <circle cx={x} cy={y} r="18" fill="url(#glow-g)" opacity="0.4"><animate attributeName="r" values="18;23;18" dur="4s" repeatCount="indefinite" /></circle>
                      <circle cx={x} cy={y} r="8" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />
                      <text x={x} y={y + 22} textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">{(n.name || '').split(' ').slice(0, 2).join(' ')}</text>
                    </g>
                  );
                })}

                {(selectedType === 'all' || selectedType === 'drivers') && drivers.map((d: any, i: number) => {
                  const x = 200 + (i % 3) * 180 + Math.sin(tick + i) * 10;
                  const y = 200 + Math.floor(i / 3) * 150 + Math.cos(tick + i) * 10;
                  return (
                    <g key={`d-${d.id}`} className="cursor-pointer">
                      <circle cx={x} cy={y} r="15" fill="url(#glow-b)" opacity="0.5"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" /></circle>
                      <circle cx={x} cy={y} r="7" fill={d.available ? '#0ea5e9' : '#64748b'} stroke="#1e293b" strokeWidth="2" />
                    </g>
                  );
                })}

                <g transform="translate(620, 20)">
                  <rect x="0" y="0" width="160" height="100" rx="12" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" />
                  <circle cx="20" cy="25" r="5" fill="#f97316" /><text x="32" y="28" fill="#94a3b8" fontSize="10">Restaurants</text>
                  <circle cx="20" cy="48" r="5" fill="#22c55e" /><text x="32" y="51" fill="#94a3b8" fontSize="10">NGOs</text>
                  <circle cx="20" cy="71" r="5" fill="#0ea5e9" /><text x="32" y="74" fill="#94a3b8" fontSize="10">Drivers</text>
                </g>
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex gap-3">
              <div className="glass-card px-4 py-2 text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-300">{t('tracking.activeDeliveriesCount', { count: activeJobs.length })}</span>
              </div>
              <div className="glass-card px-4 py-2 text-xs text-slate-400">{t('tracking.mumbaiRegion')}</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-green-400" />
              {t('tracking.activeDeliveries')}
            </h3>

            {activeJobs.length === 0 ? (
              <div className="glass-card p-6 text-center text-slate-500 text-sm">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No active deliveries right now
              </div>
            ) : activeJobs.map((job: any, i: number) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }} className="glass-card p-4 hover:border-green-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${job.status === 'in_transit' ? 'bg-cyan-500/20 text-cyan-300' : job.status === 'picked_up' ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {(job.status || '').replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">#{job.id}</span>
                </div>
                <p className="text-sm text-white font-medium mb-2">{job.food_description} ({job.quantity_kg} kg)</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-orange-400"><Building2 className="w-3 h-3" /><span>{job.pickup?.name || 'Unknown'}</span></div>
                  <div className="flex items-center gap-2 text-green-400"><HeartHandshake className="w-3 h-3" /><span>{job.dropoff?.name || 'Unknown'}</span></div>
                  {job.driver && <div className="flex items-center gap-2 text-cyan-400"><Truck className="w-3 h-3" /><span>{job.driver.name}</span></div>}
                </div>
                {(job.eta_minutes > 0 || job.distance_km > 0) && (
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    {job.distance_km > 0 && <span>{job.distance_km} km</span>}
                    {job.eta_minutes > 0 && <span className="text-cyan-400 flex items-center gap-1"><Clock className="w-3 h-3" />{job.eta_minutes} min</span>}
                  </div>
                )}
              </motion.div>
            ))}

            <div className="glass-card p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
              <div className="text-sm text-slate-400 mb-1">{t('tracking.totalActiveDistance')}</div>
              <div className="text-2xl font-bold text-white">
                {activeJobs.reduce((a: number, d: any) => a + (d.distance_km || 0), 0).toFixed(1)} km
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
