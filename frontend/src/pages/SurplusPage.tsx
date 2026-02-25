import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Utensils, Camera, Clock, Sparkles, CheckCircle2,
  ArrowRight, Package, Leaf, TrendingUp, Truck,
  MapPin, HeartHandshake, Building2, Navigation,
  AlertTriangle, RefreshCcw, Eye,
  Star, Timer,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { mlAPI, surplusAPI } from '../api';
import { useAuthStore } from '../store';

const FOOD_PRESETS = [
  { name: 'Dal Makhani + Rice', qty: 25, category: 'curry', emoji: '🍛' },
  { name: 'Paneer Butter Masala + Naan', qty: 15, category: 'veg', emoji: '🧈' },
  { name: 'Chicken Biryani', qty: 20, category: 'rice', emoji: '🍚' },
  { name: 'Mixed Veg Thali', qty: 30, category: 'mixed', emoji: '🥘' },
  { name: 'Idli Sambar', qty: 18, category: 'veg', emoji: '🫕' },
  { name: 'Pav Bhaji', qty: 12, category: 'snacks', emoji: '🍞' },
  { name: 'Chole Bhature', qty: 20, category: 'curry', emoji: '🫘' },
  { name: 'Gulab Jamun + Kheer', qty: 10, category: 'sweets', emoji: '🍮' },
];

const ORDER_STAGES = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: 'amber' },
  { key: 'assigned', label: 'Driver Assigned', icon: Truck, color: 'blue' },
  { key: 'picked_up', label: 'Food Picked Up', icon: Building2, color: 'purple' },
  { key: 'in_transit', label: 'In Transit', icon: Navigation, color: 'cyan' },
  { key: 'delivered', label: 'Delivered to NGO', icon: HeartHandshake, color: 'green' },
];

function getStageIndex(status: string) {
  const idx = ORDER_STAGES.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function SurplusPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // Form state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    food_description: '',
    quantity_kg: 0,
    food_category: 'mixed',
    expiry_hours: 2,
    photo_url: '',
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Order lifecycle state
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [driverPopup, setDriverPopup] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // View toggle
  const [view, setView] = useState<'form' | 'tracking'>('form');

  // Load user's orders
  const fetchMyOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const res = await surplusAPI.myOrders();
      setMyOrders(res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Poll active order status
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered' || activeOrder.status === 'cancelled') return;
    const interval = setInterval(async () => {
      try {
        const res = await surplusAPI.get(activeOrder.id);
        const updated = res.data;
        if (updated.status !== activeOrder.status) {
          setActiveOrder(updated);
          if (updated.status === 'assigned' && updated.driver_name) {
            setDriverPopup(true);
            toast.success(`🚗 Driver ${updated.driver_name} has been assigned!`);
          }
          if (updated.status === 'picked_up') {
            toast.success('📦 Food has been picked up by the driver!');
          }
          if (updated.status === 'in_transit') {
            toast.success('🚚 Driver is on the way to the NGO!');
          }
          if (updated.status === 'delivered') {
            toast.success('✅ Food delivered successfully to the NGO!');
            fetchMyOrders();
          }
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeOrder, fetchMyOrders]);

  const handlePreset = async (preset: typeof FOOD_PRESETS[0]) => {
    setForm({
      ...form,
      food_description: preset.name,
      quantity_kg: preset.qty,
      food_category: preset.category,
    });
    try {
      const res = await mlAPI.predictSurplus({
        day_of_week: new Date().getDay(),
        guest_count: Math.round(preset.qty * 4),
        event_type: 'normal',
        weather: 'clear',
        base_surplus_kg: preset.qty,
      });
      const data = res.data;
      setPrediction({
        predicted_kg: data.predicted_kg,
        confidence: data.confidence,
        recommendation: data.recommendation,
        category_breakdown: data.category_breakdown || {},
      });
    } catch {
      toast.error('AI prediction failed. You can still submit manually.');
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to submit surplus food.');
      window.location.href = '/login';
      return;
    }
    setSubmitting(true);
    try {
      const res = await surplusAPI.create({
        food_description: form.food_description,
        quantity_kg: form.quantity_kg,
        food_category: form.food_category,
        expiry_hours: form.expiry_hours,
        photo_url: form.photo_url || undefined,
      });
      const order = res.data;
      setActiveOrder(order);
      setView('tracking');

      if (order.driver_name || order.driver_id) {
        setTimeout(() => {
          setDriverPopup(true);
          toast.success(`🚗 Driver ${order.driver_name || 'assigned'} is on the way!`);
        }, 1500);
      }

      toast.success(t('surplus.surplusMarked'));
      fetchMyOrders();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to submit. Please login as a restaurant account.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ food_description: '', quantity_kg: 0, food_category: 'mixed', expiry_hours: 2, photo_url: '' });
    setPrediction(null);
    setStep(1);
    setActiveOrder(null);
    setDriverPopup(false);
    setView('form');
  };

  const stageIdx = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Driver Assigned Popup */}
      <AnimatePresence>
        {driverPopup && activeOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setDriverPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-green-500/20 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-green-500/10"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Truck className="w-10 h-10 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-1">Driver Assigned!</h3>
                <p className="text-slate-400 text-sm">A driver has been assigned to pick up your food</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-slate-400 text-sm">Driver</span>
                  <span className="text-white font-semibold">{activeOrder.driver_name || 'Assigned'}</span>
                </div>
                {activeOrder.eta_minutes > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-slate-400 text-sm">ETA</span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {activeOrder.eta_minutes} min
                    </span>
                  </div>
                )}
                {activeOrder.distance_km > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-slate-400 text-sm">Distance</span>
                    <span className="text-purple-400 font-semibold">{activeOrder.distance_km} km</span>
                  </div>
                )}
                {activeOrder.ngo_name && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-slate-400 text-sm">Delivering to</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <HeartHandshake className="w-4 h-4" />
                      {activeOrder.ngo_name}
                    </span>
                  </div>
                )}
              </div>

              <button onClick={() => setDriverPopup(false)} className="btn-primary w-full">
                Got it! Track Delivery →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header with view toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                <Utensils className="inline w-8 h-8 text-green-400 mr-2" />
                <span className="gradient-text">{t('surplus.title')}</span>
              </h1>
              <p className="text-slate-400 mt-1">{t('surplus.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setView('form')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  view === 'form' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Package className="w-4 h-4" /> New Surplus
              </button>
              <button onClick={() => { setView('tracking'); fetchMyOrders(); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  view === 'tracking' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Eye className="w-4 h-4" /> My Orders
                {myOrders.length > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs px-1.5 py-0.5 rounded-full">{myOrders.length}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-300 font-medium text-sm">Login Required</p>
                <p className="text-slate-400 text-xs mt-0.5">Please <a href="/login" className="text-amber-400 underline">login</a> or <a href="/register" className="text-amber-400 underline">register</a> as a restaurant to submit surplus food.</p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ══════════════════ FORM VIEW ══════════════════ */}
          {view === 'form' && (
            <motion.div key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-10">
                {[
                  { num: 1, label: t('surplus.step1') },
                  { num: 2, label: t('surplus.step2') },
                  { num: 3, label: t('surplus.step3') },
                ].map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      step >= s.num ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className={`text-sm hidden sm:inline ${step >= s.num ? 'text-green-400' : 'text-slate-600'}`}>{s.label}</span>
                    {i < 2 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card p-6 md:p-8">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-orange-400" /> {t('surplus.quickSelect')}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {FOOD_PRESETS.map((preset) => (
                          <motion.button key={preset.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handlePreset(preset)}
                            className={`p-4 rounded-xl border text-center transition-all ${form.food_description === preset.name ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                          >
                            <div className="text-2xl mb-1">{preset.emoji}</div>
                            <div className="text-xs font-medium text-white">{preset.name}</div>
                            <div className="text-xs text-slate-500">~{preset.qty} kg</div>
                          </motion.button>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">{t('surplus.foodDesc')}</label>
                          <textarea value={form.food_description} onChange={(e) => setForm({ ...form, food_description: e.target.value })}
                            className="input-field h-20 resize-none" placeholder={t('surplus.foodDescPlaceholder')} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">{t('surplus.quantity')}</label>
                            <input type="number" value={form.quantity_kg || ''} onChange={(e) => setForm({ ...form, quantity_kg: Number(e.target.value) })}
                              className="input-field" placeholder="e.g., 25" min={1} />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-1.5 block">{t('surplus.expiry')}</label>
                            <select value={form.expiry_hours} onChange={(e) => setForm({ ...form, expiry_hours: Number(e.target.value) })} className="input-field">
                              <option value={2}>2 {t('surplus.hours')}</option>
                              <option value={4}>4 {t('surplus.hours')}</option>
                              <option value={6}>6 {t('surplus.hours')}</option>
                              <option value={8}>8 {t('surplus.hours')}</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">{t('surplus.category')}</label>
                          <select value={form.food_category} onChange={(e) => setForm({ ...form, food_category: e.target.value })} className="input-field">
                            <option value="veg">🥬 Vegetarian</option>
                            <option value="non_veg">🍗 Non-Vegetarian</option>
                            <option value="mixed">🥘 Mixed</option>
                            <option value="rice">🍚 Rice</option>
                            <option value="bread">🍞 Bread / Roti</option>
                            <option value="curry">🍛 Curry / Sabzi</option>
                            <option value="snacks">🥟 Snacks</option>
                            <option value="sweets">🍮 Sweets / Desserts</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-300 mb-1.5 block">{t('surplus.photoOptional')}</label>
                          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-green-500/30 transition-colors cursor-pointer">
                            <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">{t('surplus.uploadPhoto')}</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => {
                        if (!form.food_description || !form.quantity_kg) { toast.error(t('surplus.fillRequired')); return; }
                        if (!prediction) handlePreset({ name: form.food_description, qty: form.quantity_kg, category: 'mixed', emoji: '🍽' });
                        setStep(2);
                      }} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                        {t('surplus.getAiPrediction')} <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card p-6 md:p-8">
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-400" /> {t('surplus.aiPrediction')}
                      </h2>
                      {prediction ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-5 text-center bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
                              <div className="text-sm text-slate-400 mb-1">{t('surplus.aiPredicted')}</div>
                              <div className="text-4xl font-extrabold text-violet-400">{prediction.predicted_kg} kg</div>
                            </div>
                            <div className="glass-card p-5 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                              <div className="text-sm text-slate-400 mb-1">{t('surplus.yourInput')}</div>
                              <div className="text-4xl font-extrabold text-green-400">{form.quantity_kg} kg</div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">{t('surplus.modelConfidence')}</span>
                              <span className="text-green-400 font-semibold">{(prediction.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${prediction.confidence * 100}%` }}
                                transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                            </div>
                          </div>
                          <div className="glass-card p-4 border-white/5">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('surplus.categoryBreakdown')}</h3>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(prediction.category_breakdown).map(([key, val]) => (
                                <div key={key} className="text-center">
                                  <div className="text-lg font-bold text-white">{val as number} kg</div>
                                  <div className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="text-sm font-semibold text-amber-400 mb-1">{t('surplus.aiRecommendation')}</div>
                            <p className="text-sm text-slate-300">{prediction.recommendation}</p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1">{t('surplus.back')}</button>
                            <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                              {t('surplus.confirm')} <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-slate-400">{t('surplus.runningModel')}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card p-6 md:p-8">
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" /> {t('surplus.confirmTitle')}
                      </h2>
                      <div className="space-y-4 mb-6">
                        {[
                          { label: t('surplus.food'), value: form.food_description },
                          { label: t('surplus.qty'), value: `${form.quantity_kg} kg` },
                          { label: t('surplus.aiPredictedLabel'), value: `${prediction?.predicted_kg || '—'} kg`, color: 'text-violet-400' },
                          { label: t('surplus.expiryLabel'), value: `${form.expiry_hours} ${t('surplus.hours')}` },
                          { label: t('surplus.estMeals'), value: `~${form.quantity_kg * 4} meals`, color: 'text-green-400' },
                          { label: t('surplus.impactValue'), value: `₹${(form.quantity_kg * 100).toLocaleString()}`, color: 'text-amber-400' },
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-slate-400">{row.label}</span>
                            <span className={`font-medium ${row.color || 'text-white'}`}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 mb-6">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-slate-300">
                            <p className="font-semibold text-green-400 mb-1">{t('surplus.whatHappensNext')}</p>
                            <ul className="space-y-1 text-slate-400">
                              <li>• AI will auto-assign the nearest NGO</li>
                              <li>• A nearby driver will be notified and assigned</li>
                              <li>• You can track the delivery in real-time</li>
                              <li>• Impact metrics update when food is delivered</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="btn-secondary flex-1">{t('surplus.back')}</button>
                        <button onClick={handleSubmit} disabled={submitting || !isAuthenticated}
                          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {submitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                          ) : (
                            <>{t('surplus.submitRescue')}</>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════════════ TRACKING VIEW — ACTIVE ORDER ══════════════════ */}
          {view === 'tracking' && activeOrder && (
            <motion.div key="active-order" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="space-y-6">
                <div className="glass-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-cyan-400 animate-pulse" />
                      Order #{activeOrder.id} — Live Tracking
                    </h2>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      activeOrder.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                      activeOrder.status === 'in_transit' ? 'bg-cyan-500/20 text-cyan-300' :
                      activeOrder.status === 'picked_up' ? 'bg-purple-500/20 text-purple-300' :
                      activeOrder.status === 'assigned' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {activeOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Stage Progress */}
                  <div className="relative mb-8">
                    <div className="flex items-center justify-between relative">
                      {ORDER_STAGES.map((stage, i) => {
                        const done = i <= stageIdx;
                        const current = i === stageIdx;
                        const StageIcon = stage.icon;
                        const colorMap: Record<string, string> = {
                          amber: 'bg-amber-500 shadow-amber-500/30',
                          blue: 'bg-blue-500 shadow-blue-500/30',
                          purple: 'bg-purple-500 shadow-purple-500/30',
                          cyan: 'bg-cyan-500 shadow-cyan-500/30',
                          green: 'bg-green-500 shadow-green-500/30',
                        };
                        const textColorMap: Record<string, string> = {
                          amber: 'text-amber-400',
                          blue: 'text-blue-400',
                          purple: 'text-purple-400',
                          cyan: 'text-cyan-400',
                          green: 'text-green-400',
                        };
                        return (
                          <div key={stage.key} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                            <motion.div
                              initial={current ? { scale: 0.5 } : {}}
                              animate={current ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                              transition={current ? { repeat: Infinity, duration: 2 } : {}}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                done ? `${colorMap[stage.color]} shadow-lg` : 'bg-white/5 border border-white/10'
                              }`}
                            >
                              <StageIcon className={`w-5 h-5 ${done ? 'text-white' : 'text-slate-500'}`} />
                            </motion.div>
                            <span className={`text-xs mt-2 text-center font-medium ${done ? textColorMap[stage.color] : 'text-slate-600'}`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-0" />
                      <motion.div
                        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-amber-500 via-cyan-500 to-green-500 -z-0"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(stageIdx / (ORDER_STAGES.length - 1)) * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4 text-center bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
                      <Package className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{activeOrder.quantity_kg} kg</div>
                      <div className="text-xs text-slate-500">Food Weight</div>
                    </div>
                    <div className="glass-card p-4 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                      <Leaf className="w-5 h-5 text-green-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">~{activeOrder.servings || activeOrder.quantity_kg * 4}</div>
                      <div className="text-xs text-slate-500">Meals</div>
                    </div>
                    <div className="glass-card p-4 text-center bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
                      <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{activeOrder.eta_minutes || '—'} min</div>
                      <div className="text-xs text-slate-500">ETA</div>
                    </div>
                    <div className="glass-card p-4 text-center bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
                      <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{activeOrder.distance_km || '—'} km</div>
                      <div className="text-xs text-slate-500">Distance</div>
                    </div>
                  </div>

                  {/* Live Map */}
                  <div className="glass-card overflow-hidden relative mb-6" style={{ minHeight: '300px' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950">
                      <svg viewBox="0 0 600 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          </pattern>
                          <radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f97316" stopOpacity="0.6" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></radialGradient>
                          <radialGradient id="ng" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
                          <radialGradient id="dg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" /><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" /></radialGradient>
                        </defs>
                        <rect width="600" height="300" fill="url(#mapgrid)" />

                        {/* Route line */}
                        <path d="M 100 150 Q 200 80 300 150 Q 400 220 500 150" fill="none" stroke="rgba(14,165,233,0.3)" strokeWidth="2" strokeDasharray="6,4">
                          <animate attributeName="stroke-dashoffset" values="0;-100" dur="3s" repeatCount="indefinite" />
                        </path>

                        {/* Restaurant marker */}
                        <g>
                          <circle cx="100" cy="150" r="20" fill="url(#rg)" opacity="0.5">
                            <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="100" cy="150" r="10" fill="#f97316" stroke="#1e293b" strokeWidth="2" />
                          <text x="100" y="182" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="600">
                            {(activeOrder.restaurant_name || 'Restaurant').substring(0, 15)}
                          </text>
                          <text x="100" y="193" textAnchor="middle" fill="#94a3b8" fontSize="7">PICKUP</text>
                        </g>

                        {/* Driver marker (animated along route) */}
                        {activeOrder.driver_name && activeOrder.status !== 'delivered' && (
                          <g>
                            <animateMotion dur="6s" repeatCount="indefinite" path="M 100 150 Q 200 80 300 150 Q 400 220 500 150" />
                            <circle r="18" fill="url(#dg)" opacity="0.6">
                              <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle r="8" fill="#0ea5e9" stroke="#1e293b" strokeWidth="2" />
                            <text y="22" textAnchor="middle" fill="#0ea5e9" fontSize="8" fontWeight="600">
                              🚗 {(activeOrder.driver_name || 'Driver').substring(0, 12)}
                            </text>
                          </g>
                        )}

                        {/* NGO marker */}
                        <g>
                          <circle cx="500" cy="150" r="20" fill="url(#ng)" opacity="0.5">
                            <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="500" cy="150" r="10" fill="#22c55e" stroke="#1e293b" strokeWidth="2" />
                          <text x="500" y="182" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">
                            {(activeOrder.ngo_name || 'NGO').substring(0, 15)}
                          </text>
                          <text x="500" y="193" textAnchor="middle" fill="#94a3b8" fontSize="7">DROPOFF</text>
                        </g>

                        {/* Legend */}
                        <g transform="translate(20, 20)">
                          <rect width="120" height="70" rx="8" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" />
                          <circle cx="15" cy="18" r="4" fill="#f97316" /><text x="25" y="21" fill="#94a3b8" fontSize="8">Restaurant</text>
                          <circle cx="15" cy="35" r="4" fill="#0ea5e9" /><text x="25" y="38" fill="#94a3b8" fontSize="8">Driver</text>
                          <circle cx="15" cy="52" r="4" fill="#22c55e" /><text x="25" y="55" fill="#94a3b8" fontSize="8">NGO</text>
                        </g>
                      </svg>
                    </div>
                    <div className="absolute bottom-3 left-3 glass-card px-3 py-1.5 text-xs flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-slate-300">Live Tracking</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 bg-gradient-to-br from-orange-500/5 to-amber-500/3 border-orange-500/15">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{activeOrder.restaurant_name || 'Restaurant'}</div>
                          <div className="text-xs text-slate-500">Pickup Point</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">{activeOrder.food_description}</div>
                    </div>

                    <div className="glass-card p-4 bg-gradient-to-br from-cyan-500/5 to-blue-500/3 border-cyan-500/15">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{activeOrder.driver_name || 'Finding driver...'}</div>
                          <div className="text-xs text-slate-500">Delivery Driver</div>
                        </div>
                      </div>
                      {activeOrder.driver_name ? (
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> 4.8</span>
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-cyan-400" /> {activeOrder.eta_minutes} min</span>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-400 animate-pulse">Searching for nearby drivers...</div>
                      )}
                    </div>

                    <div className="glass-card p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/3 border-green-500/15">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <HeartHandshake className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{activeOrder.ngo_name || 'Finding NGO...'}</div>
                          <div className="text-xs text-slate-500">Receiving NGO</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">Est. receiving: ~{activeOrder.eta_minutes || 25} min</div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={resetForm} className="btn-secondary flex-1">+ New Surplus</button>
                    <a href="/tracking" className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" /> Full Tracking Map
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════ MY ORDERS LIST ══════════════════ */}
          {view === 'tracking' && !activeOrder && (
            <motion.div key="orders-list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-400" /> My Orders
                  </h2>
                  <button onClick={fetchMyOrders} className="btn-secondary py-2 px-3 text-sm flex items-center gap-1">
                    <RefreshCcw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Loading orders...</p>
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-1">No orders yet</p>
                    <p className="text-slate-600 text-xs">Submit your first surplus food to get started!</p>
                    <button onClick={() => setView('form')} className="btn-primary mt-4 text-sm">+ New Surplus</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order: any) => {
                      const sIdx = getStageIndex(order.status);
                      const isActive = !['delivered', 'cancelled', 'expired'].includes(order.status);
                      return (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`glass-card p-4 cursor-pointer hover:border-green-500/20 transition-all ${isActive ? 'border-cyan-500/20' : ''}`}
                          onClick={() => { if (isActive) setActiveOrder(order); }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-white">#{order.id}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                                order.status === 'cancelled' || order.status === 'expired' ? 'bg-red-500/20 text-red-300' :
                                order.status === 'in_transit' ? 'bg-cyan-500/20 text-cyan-300' :
                                order.status === 'picked_up' ? 'bg-purple-500/20 text-purple-300' :
                                order.status === 'assigned' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-amber-500/20 text-amber-300'
                              }`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-sm text-white font-medium mb-2">{order.food_description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {order.quantity_kg} kg</span>
                            {order.eta_minutes > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.eta_minutes} min</span>}
                            {order.distance_km > 0 && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.distance_km} km</span>}
                          </div>
                          {/* Mini stage progress */}
                          <div className="flex gap-1">
                            {ORDER_STAGES.map((stage, i) => (
                              <div key={stage.key} className={`h-1 flex-1 rounded-full ${
                                i <= sIdx
                                  ? order.status === 'delivered' ? 'bg-green-500' :
                                    order.status === 'cancelled' || order.status === 'expired' ? 'bg-red-500' : 'bg-cyan-500'
                                  : 'bg-white/10'
                              }`} />
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-3 text-xs">
                            <div className="flex gap-3">
                              {order.ngo_name && <span className="text-green-400 flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> {order.ngo_name}</span>}
                              {order.driver_name && <span className="text-cyan-400 flex items-center gap-1"><Truck className="w-3 h-3" /> {order.driver_name}</span>}
                            </div>
                            {isActive && <span className="text-cyan-400 flex items-center gap-1 font-medium">Track <ArrowRight className="w-3 h-3" /></span>}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="glass-card p-4 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{myOrders.filter((o: any) => o.status === 'delivered').length}</div>
                        <div className="text-xs text-slate-500">Delivered</div>
                      </div>
                      <div className="glass-card p-4 text-center bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
                        <div className="text-2xl font-bold text-cyan-400">{myOrders.filter((o: any) => !['delivered', 'cancelled', 'expired'].includes(o.status)).length}</div>
                        <div className="text-xs text-slate-500">Active</div>
                      </div>
                      <div className="glass-card p-4 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
                        <div className="text-2xl font-bold text-amber-400">{myOrders.reduce((a: number, o: any) => a + (o.quantity_kg || 0), 0)} kg</div>
                        <div className="text-xs text-slate-500">Total Food</div>
                      </div>
                    </div>
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
