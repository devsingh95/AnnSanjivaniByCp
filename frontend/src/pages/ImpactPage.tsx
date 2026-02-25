import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Leaf, Heart, Globe2, DollarSign, Droplets,
  TrendingUp, Calendar, Building2, HeartHandshake, Truck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CountUpNumber from '../components/CountUpNumber';
import { impactAPI } from '../api';

export default function ImpactPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [dashboard, setDashboard] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<any[]>([]);
  const [topNgos, setTopNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, histRes, restRes, ngoRes] = await Promise.all([
          impactAPI.dashboard(),
          impactAPI.history(30),
          impactAPI.leaderboard('restaurant', 5),
          impactAPI.leaderboard('ngo', 5),
        ]);
        setDashboard(dashRes.data);
        setDailyData(histRes.data || []);
        setTopRestaurants(restRes.data || []);
        setTopNgos(ngoRes.data || []);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalKg = dashboard?.total_kg_saved || 0;
  const totalMeals = dashboard?.total_meals_served || 0;
  const totalCo2 = dashboard?.total_co2_saved_kg || 0;
  const totalWater = dashboard?.total_water_saved_liters || 0;
  const totalMoney = dashboard?.total_money_saved_inr || 0;

  const IMPACT_STATS = [
    { label: 'totalFoodSaved', value: totalKg, suffix: ' kg', icon: Leaf, color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/5', border: 'border-green-500/20' },
    { label: 'mealsServed', value: totalMeals, suffix: '+', icon: Heart, color: 'text-rose-400', bg: 'from-rose-500/20 to-pink-500/5', border: 'border-rose-500/20' },
    { label: 'co2Prevented', value: totalCo2, suffix: ' kg', icon: Globe2, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/5', border: 'border-cyan-500/20' },
    { label: 'waterSaved', value: totalWater, suffix: ' L', icon: Droplets, color: 'text-sky-400', bg: 'from-sky-500/20 to-blue-500/5', border: 'border-sky-500/20' },
    { label: 'moneySaved', value: totalMoney, prefix: '\u20B9', suffix: '', icon: DollarSign, color: 'text-amber-400', bg: 'from-amber-500/20 to-yellow-500/5', border: 'border-amber-500/20' },
    { label: 'deliveries', value: dashboard?.delivered_today || 0, suffix: '+', icon: Truck, color: 'text-violet-400', bg: 'from-violet-500/20 to-purple-500/5', border: 'border-violet-500/20' },
  ];

  const chartData = timeRange === '7d' ? dailyData.slice(-7) : dailyData;
  const maxKg = Math.max(...(chartData.length ? chartData.map((d: any) => d.kg_saved || 0) : [1]));
  const treesEquiv = totalKg > 0 ? Math.round(totalCo2 / 100) : 0;
  const kmNotDriven = totalKg > 0 ? Math.round(totalKg * 10) : 0;
  const poolsEquiv = totalWater > 0 ? Math.round(totalWater / 2500) : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            <BarChart3 className="inline w-8 h-8 text-green-400 mr-2" />
            <span className="gradient-text">{t('impact.title')}</span>
          </h1>
          <p className="text-slate-400 mt-1">{t('impact.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 md:p-12 mb-8 relative overflow-hidden glow-green">
          <div className="absolute top-0 right-0 w-64 h-64 blob-green opacity-30" />
          <div className="relative z-10 text-center">
            <div className="text-5xl mb-4">{'\uD83C\uDF0D'}</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              <CountUpNumber end={totalKg} suffix=" kg" /> {t('impact.foodRescued')}
            </h2>
            <p className="text-xl text-slate-400">
              {t('impact.thats')} <span className="text-green-400 font-bold"><CountUpNumber end={totalMeals} /></span> {t('impact.mealsServedAnd')}{' '}
              <span className="text-cyan-400 font-bold">{'\u20B9'}<CountUpNumber end={totalMoney} /></span> {t('impact.inValueSaved')}
            </p>
            {totalKg > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                {t('impact.increaseMonth')}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {IMPACT_STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card p-4 text-center border ${stat.border} hover:scale-105 transition-all duration-300 cursor-pointer`}>
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-xl md:text-2xl font-bold text-white">
                <CountUpNumber end={stat.value} suffix={stat.suffix} prefix={(stat as any).prefix || ''} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{t(`impact.${stat.label}`)}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" /> Daily Food Rescue (kg)
            </h3>
            <div className="flex gap-1">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <button key={range} onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${timeRange === range ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
                  {range === '7d' ? t('impact.days7') : range === '30d' ? t('impact.days30') : t('impact.all')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 h-48">
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet. Start rescuing food to see your impact chart!</div>
            ) : chartData.map((d: any, i: number) => (
              <motion.div key={d.date || i} initial={{ height: 0 }} animate={{ height: `${((d.kg_saved || 0) / maxKg) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative min-w-[4px]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {d.date}: {d.kg_saved} kg
                </div>
              </motion.div>
            ))}
          </div>
          {chartData.length > 0 && (
            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-white">{t('impact.topRestaurants')}</h3>
            </div>
            <div className="divide-y divide-white/5">
              {topRestaurants.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No restaurant data yet</div>
              ) : topRestaurants.map((r: any, i: number) => (
                <div key={r.name} className="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/20 text-orange-500' : 'bg-white/5 text-slate-500'}`}>
                    {r.rank || i + 1}
                  </div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{r.name}</div></div>
                  <div className="text-right"><div className="text-sm font-bold text-green-400">{r.value} kg</div></div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">{t('impact.topNgos')}</h3>
            </div>
            <div className="divide-y divide-white/5">
              {topNgos.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No NGO data yet</div>
              ) : topNgos.map((n: any, i: number) => (
                <div key={n.name} className="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/20 text-orange-500' : 'bg-white/5 text-slate-500'}`}>
                    {n.rank || i + 1}
                  </div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{n.name}</div></div>
                  <div className="text-right"><div className="text-sm font-bold text-green-400">{n.value} kg</div></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 glass-card p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">{t('impact.environmentTitle')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '\uD83C\uDF33', value: treesEquiv.toLocaleString(), label: t('impact.treesPlanted'), desc: t('impact.co2Absorption') },
              { emoji: '\uD83D\uDE97', value: kmNotDriven.toLocaleString(), label: t('impact.kmNotDriven'), desc: t('impact.emissionsSaved') },
              { emoji: '\uD83C\uDFCA', value: poolsEquiv.toLocaleString(), label: t('impact.olympicPools'), desc: t('impact.waterConserved') },
              { emoji: '\uD83D\uDCA1', value: totalCo2.toLocaleString(), label: t('impact.energySaved'), desc: t('impact.processingEnergy') },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.1 }} className="p-4">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-sm text-green-400 font-medium">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
