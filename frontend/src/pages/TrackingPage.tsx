import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Truck, Building2, HeartHandshake, Navigation, Package,
  Clock, RefreshCcw, Wifi, WifiOff, Star, CheckCircle2, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { trackingAPI, surplusAPI } from '../api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  assigned: 'bg-blue-500/20 text-blue-300',
  picked_up: 'bg-purple-500/20 text-purple-300',
  in_transit: 'bg-cyan-500/20 text-cyan-300',
  delivered: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

export default function TrackingPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'all' | 'restaurants' | 'ngos' | 'drivers'>('all');
  const [isLive, setIsLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [locations, setLocations] = useState<any>({ restaurants: [], ngos: [], drivers: [] });
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = async () => {
    try {
      const [locRes, jobRes, ordRes] = await Promise.all([
        trackingAPI.allLocations(),
        trackingAPI.activeJobs(),
        surplusAPI.list(undefined, 50),
      ]);
      setLocations(locRes.data || { restaurants: [], ngos: [], drivers: [] });
      setActiveJobs(jobRes.data || []);
      setAllOrders(ordRes.data || []);
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
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const restaurants = locations.restaurants || [];
  const ngos = locations.ngos || [];
  const drivers = locations.drivers || [];

  const deliveredOrders = allOrders.filter((o: any) => o.status === 'delivered');
  const totalKgDelivered = deliveredOrders.reduce((a: number, o: any) => a + (o.quantity_kg || 0), 0);

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
              <button onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${showHistory ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                {showHistory ? 'Live View' : 'History'}
              </button>
              <button onClick={() => fetchData()} className="btn-secondary py-2 px-3 text-sm flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" />
                {t('tracking.refresh')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1"><Navigation className="w-4 h-4" /> Active</div>
            <div className="text-2xl font-bold text-white">{activeJobs.length}</div>
          </div>
          <div className="glass-card p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-1"><CheckCircle2 className="w-4 h-4" /> Delivered</div>
            <div className="text-2xl font-bold text-white">{deliveredOrders.length}</div>
          </div>
          <div className="glass-card p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
            <div className="flex items-center gap-2 text-orange-400 text-sm mb-1"><Package className="w-4 h-4" /> Total kg</div>
            <div className="text-2xl font-bold text-white">{totalKgDelivered.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400 text-sm mb-1"><Truck className="w-4 h-4" /> Drivers</div>
            <div className="text-2xl font-bold text-white">{drivers.length}</div>
          </div>
        </div>

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

        <AnimatePresence mode="wait">
          {!showHistory ? (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map */}
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

                      {/* Active delivery routes */}
                      {activeJobs.map((job: any, i: number) => {
                        const sx = 100 + (i % 3) * 250;
                        const sy = 150 + Math.floor(i / 3) * 200;
                        const ex = sx + 200;
                        const ey = sy + (i % 2 === 0 ? -60 : 60);
                        return (
                          <g key={`route-${job.id}`}>
                            <path d={`M ${sx} ${sy} Q ${(sx + ex) / 2} ${sy - 80} ${ex} ${ey}`} fill="none" stroke="rgba(14,165,233,0.25)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" values="0;-100" dur="3s" repeatCount="indefinite" />
                            </path>
                            {/* Driver moving along route */}
                            {job.driver && (
                              <g>
                                <animateMotion dur={`${4 + i}s`} repeatCount="indefinite" path={`M ${sx} ${sy} Q ${(sx + ex) / 2} ${sy - 80} ${ex} ${ey}`} />
                                <circle r="12" fill="url(#glow-b)" opacity="0.6" />
                                <circle r="6" fill="#0ea5e9" stroke="#1e293b" strokeWidth="2" />
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {(selectedType === 'all' || selectedType === 'restaurants') && restaurants.map((r: any, i: number) => {
                        const x = 80 + (i % 4) * 170 + Math.sin(i) * 30;
                        const y = 80 + Math.floor(i / 4) * 180 + Math.cos(i) * 30;
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
                        const y = 350 + Math.floor(i / 3) * 130 + Math.cos(i * 2) * 20;
                        return (
                          <g key={`n-${n.id}`} className="cursor-pointer">
                            <circle cx={x} cy={y} r="18" fill="url(#glow-g)" opacity="0.4"><animate attributeName="r" values="18;23;18" dur="4s" repeatCount="indefinite" /></circle>
                            <circle cx={x} cy={y} r="8" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />
                            <text x={x} y={y + 22} textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">{(n.name || '').split(' ').slice(0, 2).join(' ')}</text>
                          </g>
                        );
                      })}

                      {(selectedType === 'all' || selectedType === 'drivers') && drivers.map((d: any, i: number) => {
                        const x = 200 + (i % 3) * 180 + Math.sin(tick + i) * 15;
                        const y = 200 + Math.floor(i / 3) * 150 + Math.cos(tick + i) * 15;
                        return (
                          <g key={`d-${d.id}`} className="cursor-pointer">
                            <circle cx={x} cy={y} r="15" fill="url(#glow-b)" opacity="0.5"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" /></circle>
                            <circle cx={x} cy={y} r="7" fill={d.available ? '#0ea5e9' : '#64748b'} stroke="#1e293b" strokeWidth="2" />
                            <text x={x} y={y + 18} textAnchor="middle" fill={d.available ? '#0ea5e9' : '#64748b'} fontSize="7" fontWeight="600">
                              {d.available ? '🚗' : '🔒'}
                            </text>
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

                {/* Active Deliveries Sidebar */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-400" />
                    {t('tracking.activeDeliveries')}
                  </h3>

                  {activeJobs.length === 0 ? (
                    <div className="glass-card p-6 text-center text-slate-500 text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No active deliveries right now
                      <a href="/surplus" className="block mt-3 text-green-400 text-xs underline">Create a surplus request →</a>
                    </div>
                  ) : activeJobs.map((job: any, i: number) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className={`glass-card p-4 cursor-pointer transition-all duration-300 ${selectedJob?.id === job.id ? 'border-cyan-500/30 bg-cyan-500/5' : 'hover:border-green-500/20'}`}
                      onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status] || 'bg-amber-500/20 text-amber-300'}`}>
                          {(job.status || '').replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">#{job.id}</span>
                      </div>
                      <p className="text-sm text-white font-medium mb-2">{job.food_description} ({job.quantity_kg} kg)</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-orange-400"><Building2 className="w-3 h-3" /><span>{job.pickup?.name || 'Unknown'}</span></div>
                        <div className="flex items-center gap-2 text-green-400"><HeartHandshake className="w-3 h-3" /><span>{job.dropoff?.name || 'Unknown'}</span></div>
                        {job.driver && (
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Truck className="w-3 h-3" />
                            <span>{job.driver.name}</span>
                            <span className="text-slate-500">({job.driver.vehicle})</span>
                          </div>
                        )}
                      </div>
                      {(job.eta_minutes > 0 || job.distance_km > 0) && (
                        <div className="mt-3 flex justify-between text-xs text-slate-500">
                          {job.distance_km > 0 && <span>{job.distance_km} km</span>}
                          {job.eta_minutes > 0 && <span className="text-cyan-400 flex items-center gap-1"><Clock className="w-3 h-3" />{job.eta_minutes} min ETA</span>}
                        </div>
                      )}

                      {/* Expanded view */}
                      <AnimatePresence>
                        {selectedJob?.id === job.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
                            {/* Mini stage progress */}
                            <div className="flex gap-1 mb-3">
                              {['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((s, si) => {
                                const cIdx = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].indexOf(job.status);
                                return <div key={s} className={`h-1.5 flex-1 rounded-full ${si <= cIdx ? 'bg-cyan-500' : 'bg-white/10'}`} />;
                              })}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-white/5 text-center">
                                <div className="text-slate-500">Servings</div>
                                <div className="text-white font-semibold">{job.servings || Math.round((job.quantity_kg || 0) * 4)}</div>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5 text-center">
                                <div className="text-slate-500">Category</div>
                                <div className="text-white font-semibold capitalize">{(job.food_category || 'mixed').replace('_', ' ')}</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
            </motion.div>
          ) : (
            /* ══════════════════ HISTORY VIEW ══════════════════ */
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" /> Order History
                </h2>
                {allOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allOrders.map((order: any) => (
                      <div key={order.id} className="glass-card p-4 hover:border-green-500/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white">#{order.id}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-slate-500/20 text-slate-300'}`}>
                              {(order.status || '').replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</span>
                        </div>
                        <p className="text-sm text-white mb-2">{order.food_description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span><Package className="w-3 h-3 inline mr-1" />{order.quantity_kg} kg</span>
                          {order.restaurant_name && <span><Building2 className="w-3 h-3 inline mr-1" />{order.restaurant_name}</span>}
                          {order.ngo_name && <span><HeartHandshake className="w-3 h-3 inline mr-1" />{order.ngo_name}</span>}
                          {order.driver_name && <span><Truck className="w-3 h-3 inline mr-1" />{order.driver_name}</span>}
                        </div>
                        {/* Mini stage progress */}
                        <div className="flex gap-1 mt-3">
                          {['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((s, si) => {
                            const cIdx = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].indexOf(order.status);
                            return <div key={s} className={`h-1 flex-1 rounded-full ${
                              si <= cIdx
                                ? order.status === 'delivered' ? 'bg-green-500' :
                                  order.status === 'cancelled' || order.status === 'expired' ? 'bg-red-500' : 'bg-cyan-500'
                                : 'bg-white/10'
                            }`} />;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
