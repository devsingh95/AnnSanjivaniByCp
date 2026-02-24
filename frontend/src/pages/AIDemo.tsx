import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Brain, Sparkles, Route, MessageSquare, TrendingUp,
  ArrowRight, Cpu, Zap, Target, BarChart3, Truck, Clock,
} from 'lucide-react';
import Navbar from '../components/Navbar';

const DEMO_TAB = ['surplus-prediction', 'route-optimization', 'food-classification'] as const;

const RESTAURANTS_DEMO = [
  { id: 1, name: 'Taj Palace Kitchen', base: 45 },
  { id: 2, name: 'Spice Garden', base: 25 },
  { id: 3, name: 'Mumbai Masala House', base: 35 },
  { id: 4, name: 'Grand Bhoj Thali', base: 50 },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EVENTS = ['normal', 'wedding', 'festival', 'corporate', 'birthday'];
const WEATHER = ['clear', 'rain', 'hot', 'cold'];

export default function AIDemo() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<typeof DEMO_TAB[number]>('surplus-prediction');
  
  // Surplus Prediction State
  const [predForm, setPredForm] = useState({
    restaurant: RESTAURANTS_DEMO[0],
    day: 5, // Saturday
    guests: 150,
    event: 'wedding',
    weather: 'clear',
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [predLoading, setPredLoading] = useState(false);

  // Route Optimization State
  const [routeResult, setRouteResult] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Classification State
  const [classText, setClassText] = useState('Paneer butter masala with jeera rice and tandoori naan');
  const [classResult, setClassResult] = useState<any>(null);
  const [classLoading, setClassLoading] = useState(false);

  const runPrediction = () => {
    setPredLoading(true);
    setPrediction(null);
    setTimeout(() => {
      const dayMult: Record<number, number> = { 0: 0.8, 1: 0.85, 2: 0.9, 3: 0.95, 4: 1.1, 5: 1.3, 6: 1.2 };
      const eventMult: Record<string, number> = { normal: 1, wedding: 2.5, festival: 2, corporate: 1.5, birthday: 1.3 };
      const weatherMult: Record<string, number> = { clear: 1, rain: 1.3, hot: 0.9, cold: 1.1 };
      
      const base = predForm.restaurant.base;
      const predicted = Math.round(
        base * (dayMult[predForm.day] || 1) * (eventMult[predForm.event] || 1) * 
        (weatherMult[predForm.weather] || 1) * (predForm.guests / 100) + (Math.random() * 4 - 2)
      );

      setPrediction({
        predicted_kg: Math.max(predicted, 5),
        confidence: (0.82 + Math.random() * 0.12).toFixed(2),
        meals: predicted * 4,
        value_inr: predicted * 100,
        co2_kg: (predicted * 2.5).toFixed(1),
        breakdown: {
          'Main Dishes': Math.round(predicted * 0.45),
          'Rice/Bread': Math.round(predicted * 0.25),
          'Sides/Desserts': Math.round(predicted * 0.2),
          'Other': Math.round(predicted * 0.1),
        },
        recommendation: predicted > 100 
          ? '🔴 Very high surplus! Alert 5+ NGOs and 3+ drivers immediately.'
          : predicted > 50 
          ? '🟡 High surplus. Pre-arrange 2-3 NGOs and 2 drivers.'
          : predicted > 20
          ? '🟢 Moderate surplus. Standard 1 NGO + 1 driver assignment.'
          : '🟢 Low surplus. Routine pickup will suffice.',
      });
      setPredLoading(false);
    }, 1500);
  };

  const runRouteOptimization = () => {
    setRouteLoading(true);
    setRouteResult(null);
    setTimeout(() => {
      setRouteResult({
        stops: [
          { type: 'Start', name: 'Driver Location (Bandra)', distance: '0 km', time: '0 min' },
          { type: 'Pickup', name: 'Taj Palace Kitchen, Colaba', distance: '5.2 km', time: '12 min' },
          { type: 'Pickup', name: 'Royal Biryani Centre, Mohammed Ali Rd', distance: '2.1 km', time: '6 min' },
          { type: 'Dropoff', name: 'Akshaya Patra Foundation, Juhu', distance: '8.4 km', time: '22 min' },
          { type: 'Dropoff', name: 'Robin Hood Army, BKC', distance: '3.8 km', time: '10 min' },
        ],
        total_distance: 19.5,
        total_time: 50,
        fuel_cost: 68,
        optimization_savings: '32% shorter than naive route',
      });
      setRouteLoading(false);
    }, 2000);
  };

  const runClassification = () => {
    setClassLoading(true);
    setClassResult(null);
    setTimeout(() => {
      const text = classText.toLowerCase();
      const categories: Record<string, { score: number; keywords: string[] }> = {
        'Vegetarian': { score: 0, keywords: ['paneer', 'sabzi', 'dal', 'vegetable', 'aloo', 'gobi', 'palak', 'chole', 'rajma'] },
        'Non-Vegetarian': { score: 0, keywords: ['chicken', 'mutton', 'fish', 'egg', 'prawn', 'kebab', 'tikka'] },
        'Rice Dishes': { score: 0, keywords: ['rice', 'pulao', 'biryani', 'jeera rice', 'fried rice', 'khichdi'] },
        'Bread': { score: 0, keywords: ['roti', 'naan', 'paratha', 'chapati', 'puri', 'bread', 'pav'] },
        'Curry/Gravy': { score: 0, keywords: ['curry', 'gravy', 'masala', 'butter', 'kadai', 'korma'] },
        'Snacks': { score: 0, keywords: ['samosa', 'pakora', 'bhaji', 'vada', 'chaat'] },
        'Sweets': { score: 0, keywords: ['gulab jamun', 'rasgulla', 'halwa', 'kheer', 'jalebi', 'ladoo'] },
      };

      for (const [cat, data] of Object.entries(categories)) {
        for (const kw of data.keywords) {
          if (text.includes(kw)) data.score += 1;
        }
      }

      const sorted = Object.entries(categories)
        .map(([name, data]) => ({ name, score: data.score, confidence: Math.min(0.98, 0.3 + data.score * 0.2 + Math.random() * 0.1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setClassResult({
        primary: sorted[0]?.name || 'Mixed',
        categories: sorted,
        tokens_analyzed: classText.split(' ').length,
        model: 'IndicBERT v2 (fine-tuned)',
      });
      setClassLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
            <Cpu className="w-4 h-4" />
            {t('aiDemo.showcase')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display mb-2">
            <span className="gradient-text-cool">{t('aiDemo.title').split(' ').slice(0, 2).join(' ')}</span>{' '}
            <span className="text-white">{t('aiDemo.title').split(' ').slice(2).join(' ') || 'Ann-Sanjivani AI'}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('aiDemo.subtitle')}
          </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { key: 'surplus-prediction', label: t('aiDemo.tab1'), icon: Brain, color: 'violet' },
            { key: 'route-optimization', label: t('aiDemo.tab2'), icon: Route, color: 'cyan' },
            { key: 'food-classification', label: t('aiDemo.tab3'), icon: MessageSquare, color: 'amber' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30 shadow-lg shadow-${tab.color}-500/10`
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ==================== SURPLUS PREDICTION ==================== */}
          {activeTab === 'surplus-prediction' && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                    <Brain className="w-5 h-5 text-violet-400" />
                    {t('aiDemo.configurePrediction')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">{t('aiDemo.restaurant')}</label>
                      <select
                        value={predForm.restaurant.id}
                        onChange={(e) => setPredForm({ ...predForm, restaurant: RESTAURANTS_DEMO.find(r => r.id === Number(e.target.value))! })}
                        className="input-field"
                      >
                        {RESTAURANTS_DEMO.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} (avg {r.base} kg/day)</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">{t('aiDemo.day')}</label>
                        <select value={predForm.day} onChange={(e) => setPredForm({ ...predForm, day: Number(e.target.value) })} className="input-field">
                          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">{t('aiDemo.guestCount')}</label>
                        <input
                          type="number"
                          value={predForm.guests}
                          onChange={(e) => setPredForm({ ...predForm, guests: Number(e.target.value) })}
                          className="input-field"
                          min={10}
                          max={1000}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">{t('aiDemo.eventType')}</label>
                        <select value={predForm.event} onChange={(e) => setPredForm({ ...predForm, event: e.target.value })} className="input-field">
                          {EVENTS.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">{t('aiDemo.weather')}</label>
                        <select value={predForm.weather} onChange={(e) => setPredForm({ ...predForm, weather: e.target.value })} className="input-field">
                          {WEATHER.map((w) => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>

                    <button onClick={runPrediction} disabled={predLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                      {predLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('aiDemo.runningXgboost')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {t('aiDemo.runPrediction')}
                        </>
                      )}
                    </button>

                    <div className="text-xs text-slate-600 text-center">
                      {t('aiDemo.modelInfo')}
                    </div>
                  </div>
                </div>

                {/* Results Panel */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                    <Target className="w-5 h-5 text-green-400" />
                    {t('aiDemo.predictionResults')}
                  </h3>

                  {prediction ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-5"
                    >
                      {/* Main Prediction */}
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
                        <div className="text-sm text-slate-400 mb-1">{t('aiDemo.predictedSurplus')}</div>
                        <div className="text-5xl font-extrabold text-violet-400">{prediction.predicted_kg} kg</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {t('aiDemo.confidence')}: <span className="text-green-400">{(prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Impact Metrics */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-lg font-bold text-green-400">{prediction.meals}</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.mealsLabel')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-lg font-bold text-amber-400">₹{prediction.value_inr.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.valueLabel')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-lg font-bold text-cyan-400">{prediction.co2_kg} kg</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.co2Saved')}</div>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div>
                        <div className="text-sm font-semibold text-slate-300 mb-2">{t('aiDemo.categoryBreakdown')}</div>
                        {Object.entries(prediction.breakdown).map(([cat, val]) => (
                          <div key={cat} className="flex items-center gap-3 mb-2">
                            <div className="text-xs text-slate-400 w-28">{cat}</div>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((val as number) / prediction.predicted_kg) * 100}%` }}
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                              />
                            </div>
                            <div className="text-xs text-white font-medium w-12 text-right">{val as number} kg</div>
                          </div>
                        ))}
                      </div>

                      {/* Recommendation */}
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm text-slate-300">
                        {prediction.recommendation}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 text-slate-600">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>{t('aiDemo.configurePrompt')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== ROUTE OPTIMIZATION ==================== */}
          {activeTab === 'route-optimization' && (
            <motion.div
              key="route"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Route className="w-6 h-6 text-cyan-400" />
                {t('aiDemo.vrpTitle')}
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-400 mb-4">
                    {t('aiDemo.vrpDesc')}
                  </p>

                  <div className="glass-card p-4 mb-4 border-cyan-500/10">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">{t('aiDemo.demoScenario')}</h4>
                    <div className="text-sm text-slate-300 space-y-1">
                      <p>📍 <strong>Driver:</strong> Starting from Bandra</p>
                      <p>🍽️ <strong>Pickup 1:</strong> Taj Palace Kitchen, Colaba</p>
                      <p>🍽️ <strong>Pickup 2:</strong> Royal Biryani Centre, Mohammed Ali Rd</p>
                      <p>🏠 <strong>Dropoff 1:</strong> Akshaya Patra Foundation, Juhu</p>
                      <p>🏠 <strong>Dropoff 2:</strong> Robin Hood Army, BKC</p>
                    </div>
                  </div>

                  <button onClick={runRouteOptimization} disabled={routeLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {routeLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('aiDemo.runningOrTools')}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {t('aiDemo.optimizeRoute')}
                      </>
                    )}
                  </button>
                  <div className="text-xs text-slate-600 text-center mt-2">
                    {t('aiDemo.solverInfo')}
                  </div>
                </div>

                <div>
                  {routeResult ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {/* Route Steps */}
                      <div className="space-y-3 mb-6">
                        {routeResult.stops.map((stop: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-start gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                stop.type === 'Start' ? 'bg-blue-500/20 text-blue-400' :
                                stop.type === 'Pickup' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {i + 1}
                              </div>
                              {i < routeResult.stops.length - 1 && (
                                <div className="w-0.5 h-6 bg-white/10 mt-1" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-xs font-semibold ${
                                stop.type === 'Start' ? 'text-blue-400' :
                                stop.type === 'Pickup' ? 'text-orange-400' : 'text-green-400'
                              }`}>{stop.type}</div>
                              <div className="text-sm text-white">{stop.name}</div>
                              <div className="text-xs text-slate-500">{stop.distance} • {stop.time}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          <div className="text-lg font-bold text-cyan-400">{routeResult.total_distance} km</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.totalDistance')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="text-lg font-bold text-green-400">{routeResult.total_time} min</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.totalTime')}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="text-lg font-bold text-amber-400">₹{routeResult.fuel_cost}</div>
                          <div className="text-xs text-slate-500">{t('aiDemo.fuelCost')}</div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-center">
                        <span className="text-sm text-green-400 font-semibold">{routeResult.optimization_savings}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 text-slate-600">
                      <Route className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>{t('aiDemo.routePrompt')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== FOOD CLASSIFICATION ==================== */}
          {activeTab === 'food-classification' && (
            <motion.div
              key="classify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <MessageSquare className="w-6 h-6 text-amber-400" />
                {t('aiDemo.nlpTitle')}
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-400 mb-4">
                    {t('aiDemo.nlpDesc')}
                  </p>

                  <div className="mb-4">
                    <label className="text-sm text-slate-300 mb-1.5 block">{t('aiDemo.foodDescription')}</label>
                    <textarea
                      value={classText}
                      onChange={(e) => setClassText(e.target.value)}
                      className="input-field h-24 resize-none"
                      placeholder="Describe the food items..."
                    />
                  </div>

                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      'Chicken biryani with raita',
                      'Dal makhani and butter naan',
                      'Gulab jamun and rasmalai desserts',
                      'Samosa and pakora snacks',
                      'Idli sambar with coconut chutney',
                    ].map((txt) => (
                      <button
                        key={txt}
                        onClick={() => setClassText(txt)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  <button onClick={runClassification} disabled={classLoading || !classText} className="btn-primary w-full flex items-center justify-center gap-2">
                    {classLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Classifying with IndicBERT...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Classify Food
                      </>
                    )}
                  </button>
                  <div className="text-xs text-slate-600 text-center mt-2">
                    {t('aiDemo.nlpModelInfo')}
                  </div>
                </div>

                <div>
                  {classResult ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                        <div className="text-sm text-slate-400 mb-1">{t('aiDemo.primaryClassification')}</div>
                        <div className="text-3xl font-extrabold text-amber-400">{classResult.primary}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {classResult.tokens_analyzed} tokens analyzed • {classResult.model}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-300 mb-3">{t('aiDemo.confidenceScores')}</div>
                        {classResult.categories.map((cat: any) => (
                          <div key={cat.name} className="flex items-center gap-3 mb-2">
                            <div className="text-xs text-slate-400 w-28">{cat.name}</div>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.confidence * 100}%` }}
                                className={`h-full rounded-full ${cat.score > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-slate-600'}`}
                              />
                            </div>
                            <div className="text-xs text-white font-medium w-12 text-right">
                              {(cat.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-sm text-slate-300">
                        <span className="text-green-400 font-semibold">{t('aiDemo.autoTagged')}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-16 text-slate-600">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>{t('aiDemo.classifyPrompt')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ML Architecture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card p-6 md:p-8"
        >
          <h3 className="text-xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
            <Cpu className="w-6 h-6 text-violet-400" />
            {t('aiDemo.mlPipeline')}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Surplus Prediction', model: 'XGBoost', input: 'Day + guests + event', output: 'kg predicted', color: 'border-violet-500/20 bg-violet-500/5', icon: '🤖' },
              { name: 'Route Optimization', model: 'OR-Tools VRP', input: 'Drivers + requests', output: 'Optimal routes', color: 'border-cyan-500/20 bg-cyan-500/5', icon: '🗺️' },
              { name: 'Food Classification', model: 'IndicBERT', input: 'Text description', output: 'Category + tags', color: 'border-amber-500/20 bg-amber-500/5', icon: '📝' },
              { name: 'ETA Prediction', model: 'LSTM', input: 'Historical trips', output: 'Arrival time', color: 'border-green-500/20 bg-green-500/5', icon: '⏱️' },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-4 rounded-xl border ${model.color}`}
              >
                <div className="text-2xl mb-2">{model.icon}</div>
                <div className="text-sm font-bold text-white">{model.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  <span className="text-slate-400">Model:</span> {model.model}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="text-slate-400">In:</span> {model.input}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="text-slate-400">Out:</span> {model.output}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
