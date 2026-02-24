import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Camera, Clock, Upload, Sparkles, CheckCircle2,
  AlertCircle, TrendingUp, ArrowRight, Package, Leaf,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

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

export default function SurplusPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    food_description: '',
    quantity_kg: 0,
    food_category: 'mixed',
    expiry_hours: 4,
    photo_url: '',
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePreset = (preset: typeof FOOD_PRESETS[0]) => {
    setForm({
      ...form,
      food_description: preset.name,
      quantity_kg: preset.qty,
      food_category: preset.category,
    });
    // Simulate AI prediction
    setTimeout(() => {
      const predicted = preset.qty + Math.round((Math.random() - 0.3) * 8);
      setPrediction({
        predicted_kg: Math.max(predicted, 5),
        confidence: (0.8 + Math.random() * 0.15).toFixed(2),
        recommendation: predicted > 30
          ? '🔴 High surplus expected! Pre-alert 3+ NGOs.'
          : predicted > 15
          ? '🟡 Moderate surplus. 1-2 NGOs can handle this.'
          : '🟢 Low surplus. Standard single-NGO assignment.',
        category_breakdown: {
          main_dish: Math.round(predicted * 0.5),
          sides: Math.round(predicted * 0.3),
          other: Math.round(predicted * 0.2),
        },
      });
    }, 800);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Surplus marked! AI is assigning NGO & driver...');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold font-display">
            <Utensils className="inline w-8 h-8 text-green-400 mr-2" />
            <span className="gradient-text">Mark Surplus Food</span>
          </h1>
          <p className="text-slate-400 mt-1">AI will predict quantity and auto-assign the nearest NGO & driver</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Select Food' },
            { num: 2, label: 'AI Prediction' },
            { num: 3, label: 'Confirm & Submit' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                step >= s.num
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s.num ? 'text-green-400' : 'text-slate-600'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Food */}
          {step === 1 && !submitted && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Quick Select or Describe Your Surplus
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {FOOD_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePreset(preset)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        form.food_description === preset.name
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{preset.emoji}</div>
                      <div className="text-xs font-medium text-white">{preset.name}</div>
                      <div className="text-xs text-slate-500">~{preset.qty} kg</div>
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Food Description</label>
                    <textarea
                      value={form.food_description}
                      onChange={(e) => setForm({ ...form, food_description: e.target.value })}
                      className="input-field h-20 resize-none"
                      placeholder="Describe the surplus food..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1.5 block">Quantity (kg)</label>
                      <input
                        type="number"
                        value={form.quantity_kg || ''}
                        onChange={(e) => setForm({ ...form, quantity_kg: Number(e.target.value) })}
                        className="input-field"
                        placeholder="e.g., 25"
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-1.5 block">Expiry (hours)</label>
                      <select
                        value={form.expiry_hours}
                        onChange={(e) => setForm({ ...form, expiry_hours: Number(e.target.value) })}
                        className="input-field"
                      >
                        <option value={2}>2 hours</option>
                        <option value={4}>4 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={8}>8 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1.5 block">Photo (optional)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-green-500/30 transition-colors cursor-pointer">
                      <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to upload food photo</p>
                      <p className="text-xs text-slate-600 mt-1">Helps NGOs verify quality</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!form.food_description || !form.quantity_kg) {
                      toast.error('Please fill in food description and quantity');
                      return;
                    }
                    if (!prediction) handlePreset({ name: form.food_description, qty: form.quantity_kg, category: 'mixed', emoji: '🍽' });
                    setStep(2);
                  }}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                >
                  Get AI Prediction
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: AI Prediction */}
          {step === 2 && !submitted && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  AI Surplus Prediction
                </h2>

                {prediction ? (
                  <div className="space-y-6">
                    {/* Prediction Result */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-5 text-center bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20">
                        <div className="text-sm text-slate-400 mb-1">AI Predicted</div>
                        <div className="text-4xl font-extrabold text-violet-400">{prediction.predicted_kg} kg</div>
                        <div className="text-xs text-slate-500 mt-1">±2 kg accuracy</div>
                      </div>
                      <div className="glass-card p-5 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
                        <div className="text-sm text-slate-400 mb-1">Your Input</div>
                        <div className="text-4xl font-extrabold text-green-400">{form.quantity_kg} kg</div>
                        <div className="text-xs text-slate-500 mt-1">{form.food_description}</div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Model Confidence</span>
                        <span className="text-green-400 font-semibold">{(prediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="glass-card p-4 border-white/5">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">Category Breakdown</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(prediction.category_breakdown).map(([key, val]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-bold text-white">{val as number} kg</div>
                            <div className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="text-sm font-semibold text-amber-400 mb-1">AI Recommendation</div>
                      <p className="text-sm text-slate-300">{prediction.recommendation}</p>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                        ← Back
                      </button>
                      <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        Confirm
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Running AI prediction model...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && !submitted && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Confirm & Submit
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Food</span>
                    <span className="text-white font-medium">{form.food_description}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Quantity</span>
                    <span className="text-white font-medium">{form.quantity_kg} kg</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">AI Predicted</span>
                    <span className="text-violet-400 font-medium">{prediction?.predicted_kg} kg</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Expiry</span>
                    <span className="text-white font-medium">{form.expiry_hours} hours</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-slate-400">Est. Meals</span>
                    <span className="text-green-400 font-bold">~{form.quantity_kg * 5} meals</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Impact Value</span>
                    <span className="text-amber-400 font-bold">₹{(form.quantity_kg * 100).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 mb-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-semibold text-green-400 mb-1">What happens next:</p>
                      <ul className="space-y-1 text-slate-400">
                        <li>1. AI assigns nearest available NGO (est. 30 seconds)</li>
                        <li>2. Nearest driver gets notification (est. 1 minute)</li>
                        <li>3. Driver arrives for pickup (est. 15-20 minutes)</li>
                        <li>4. Food delivered to NGO (est. 25-35 minutes total)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        🚀 Submit & Rescue
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {submitted && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 md:p-12 text-center glow-green"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="text-7xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Food Rescue Initiated!</h2>
              <p className="text-slate-400 mb-6">
                AI has assigned <span className="text-green-400 font-semibold">Akshaya Patra Foundation</span> and 
                driver <span className="text-cyan-400 font-semibold">Rajesh Kumar</span> is on the way!
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                <div className="text-center">
                  <Leaf className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">{form.quantity_kg} kg</div>
                  <div className="text-xs text-slate-500">Food Saved</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">~{form.quantity_kg * 5}</div>
                  <div className="text-xs text-slate-500">Meals</div>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">~25</div>
                  <div className="text-xs text-slate-500">Min ETA</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setSubmitted(false); setStep(1); setForm({ food_description: '', quantity_kg: 0, food_category: 'mixed', expiry_hours: 4, photo_url: '' }); setPrediction(null); }}
                  className="btn-secondary"
                >
                  Mark Another
                </button>
                <a href="/tracking" className="btn-primary flex items-center gap-2">
                  Track Delivery
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
