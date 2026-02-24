import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Heart, Truck, Brain, BarChart3, Shield,
  ArrowRight, ChevronDown, Globe2, Leaf, Users, Zap,
  MapPin, Clock, TrendingUp, Star, Play, Sparkles,
  Building2, HeartHandshake, Route, Cpu, Cloud, GitBranch,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CountUpNumber from '../components/CountUpNumber';

const HERO_STATS = [
  { label: 'Food Saved', value: 4850, suffix: ' kg', icon: Leaf },
  { label: 'Meals Served', value: 24250, suffix: '+', icon: Heart },
  { label: 'CO₂ Prevented', value: 12125, suffix: ' kg', icon: Globe2 },
  { label: 'Restaurants', value: 10, suffix: '+', icon: Building2 },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    description: 'XGBoost ML models predict surplus food quantities before they happen, enabling proactive rescue operations.',
    color: 'from-violet-500 to-purple-600',
    delay: 0,
  },
  {
    icon: Route,
    title: 'Smart Route Optimization',
    description: 'Google OR-Tools VRP solver finds optimal pickup and delivery routes, minimizing time and maximizing freshness.',
    color: 'from-cyan-500 to-blue-600',
    delay: 0.1,
  },
  {
    icon: MapPin,
    title: 'Real-Time GPS Tracking',
    description: 'WebSocket-powered live tracking lets everyone monitor food rescue missions from pickup to delivery.',
    color: 'from-emerald-500 to-green-600',
    delay: 0.2,
  },
  {
    icon: Zap,
    title: '2-Minute Auto Assignment',
    description: 'AI instantly matches surplus food with the nearest available NGO and driver for lightning-fast response.',
    color: 'from-amber-500 to-orange-600',
    delay: 0.3,
  },
  {
    icon: Cloud,
    title: 'Cloud-Native Architecture',
    description: 'GCP Cloud Run + Kubernetes ensures 99.9% uptime with auto-scaling from 0 to 1000+ instances.',
    color: 'from-sky-500 to-blue-600',
    delay: 0.4,
  },
  {
    icon: Shield,
    title: 'Food Safety Compliance',
    description: 'Temperature tracking, photo verification, and FSSAI-compliant quality checks at every step.',
    color: 'from-rose-500 to-red-600',
    delay: 0.5,
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Utensils,
    title: 'Restaurant Marks Surplus',
    description: 'AI predicts quantity → Restaurant confirms → Photo uploaded → Expiry time set',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Assigns NGO + Driver',
    description: 'ML model finds nearest NGO with capacity → Assigns closest available driver in 2 minutes',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Real-Time Delivery',
    description: 'Driver navigates to restaurant → Temperature check → Photo proof → Live GPS tracking',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    step: '04',
    icon: HeartHandshake,
    title: 'Food Reaches People',
    description: 'NGO receives food → Quality verified → Meals served → Impact metrics updated instantly',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
];

const TECH_STACK = [
  { name: 'React 18', category: 'Frontend', icon: '⚛️' },
  { name: 'TypeScript', category: 'Frontend', icon: '📘' },
  { name: 'TailwindCSS', category: 'Frontend', icon: '🎨' },
  { name: 'FastAPI', category: 'Backend', icon: '⚡' },
  { name: 'PostgreSQL', category: 'Database', icon: '🐘' },
  { name: 'Redis', category: 'Cache', icon: '🔴' },
  { name: 'XGBoost', category: 'ML', icon: '🤖' },
  { name: 'OR-Tools', category: 'ML', icon: '🗺️' },
  { name: 'Docker', category: 'DevOps', icon: '🐳' },
  { name: 'GCP Cloud Run', category: 'Cloud', icon: '☁️' },
  { name: 'Kubernetes', category: 'Cloud', icon: '⎈' },
  { name: 'GitHub Actions', category: 'CI/CD', icon: '🔄' },
];

const TESTIMONIALS = [
  {
    quote: "We used to throw away 50kg daily. Now it feeds 250 people every night.",
    author: "Chef Rajiv Menon",
    role: "Taj Palace Kitchen, Mumbai",
    avatar: "👨‍🍳",
  },
  {
    quote: "Response time went from 2 hours to 15 minutes. AI assignment is revolutionary.",
    author: "Priya Sharma",
    role: "Robin Hood Army Coordinator",
    avatar: "👩‍💼",
  },
  {
    quote: "Best logistics platform I've used. Route optimization saves me 40% fuel.",
    author: "Amit Kumar",
    role: "Delivery Partner, Mumbai",
    avatar: "🚗",
  },
];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center particles-bg">
        {/* Animated background blobs */}
        <div className="absolute top-20 -left-40 w-96 h-96 blob-green" />
        <div className="absolute top-60 -right-40 w-80 h-80 blob-blue" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 blob-purple" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Stack Sprint Hackathon 2026 — Cloud-Native × AI/ML × Full-Stack × DevOps
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-display tracking-tight mb-6 leading-[1.1]"
          >
            <span className="block text-white">Rescue Food.</span>
            <span className="block text-sm md:text-base text-slate-500 font-medium mt-1">by Team CoderPirate</span>
            <span className="block mt-2">
              <span className="gradient-text">Save Lives.</span>
            </span>
            <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl text-slate-400 font-semibold">
              Powered by <span className="gradient-text-cool">AI</span> &{' '}
              <span className="gradient-text-warm">Real-Time Logistics</span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            India wastes <span className="text-orange-400 font-semibold">68 million tonnes</span> of food annually 
            while <span className="text-rose-400 font-semibold">189 million</span> go hungry. Our AI-powered platform 
            connects surplus food from restaurants to NGOs in under{' '}
            <span className="text-green-400 font-semibold">15 minutes</span> — turning waste into meals.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/dashboard" className="btn-primary text-lg group flex items-center gap-2">
              <Play className="w-5 h-5" />
              Live Dashboard
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/ai-demo" className="btn-secondary text-lg group flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Demo
              <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/tracking" className="btn-secondary text-lg group flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Live Map
            </Link>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {HERO_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass-card-hover p-4 md:p-6 text-center"
              >
                <stat.icon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <CountUpNumber end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-col items-center text-slate-500"
          >
            <span className="text-xs mb-2">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ==================== PROBLEM STATEMENT ==================== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-red-950/10 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              The <span className="text-red-400">Crisis</span> We're Solving
            </h2>
            <p className="section-subtitle">
              Every day in India, enough food to feed millions is wasted while people go hungry.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: '68M',
                unit: 'tonnes/year',
                label: 'Food Wasted in India',
                description: 'Restaurants, hotels, and caterers waste ~40% of food prepared daily.',
                color: 'text-red-400',
                bg: 'from-red-500/20 to-red-600/5',
                icon: '🗑️',
              },
              {
                stat: '189M',
                unit: 'people',
                label: 'Undernourished Indians',
                description: 'India has the highest number of undernourished people globally.',
                color: 'text-amber-400',
                bg: 'from-amber-500/20 to-amber-600/5',
                icon: '😔',
              },
              {
                stat: '₹92K',
                unit: 'crore/year',
                label: 'Economic Loss',
                description: 'Food waste causes massive environmental and economic damage.',
                color: 'text-orange-400',
                bg: 'from-orange-500/20 to-orange-600/5',
                icon: '💸',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center group hover:border-red-500/30 transition-all duration-500"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className={`text-5xl font-extrabold ${item.color} mb-1`}>{item.stat}</div>
                <div className="text-sm text-slate-500 mb-3">{item.unit}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Arrow transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center my-12"
          >
            <div className="bg-gradient-to-r from-red-500 to-green-500 p-[1px] rounded-full">
              <div className="bg-slate-950 rounded-full p-4">
                <ArrowRight className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </motion.div>

          {/* Solution preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center glow-green"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Our Solution</span>
            </h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              An AI-powered platform that <span className="text-green-400 font-semibold">predicts surplus</span>, 
              {' '}<span className="text-cyan-400 font-semibold">auto-assigns</span> the nearest NGO & driver, 
              and delivers food in <span className="text-amber-400 font-semibold">under 30 minutes</span> — 
              turning India&apos;s food waste crisis into a zero-hunger movement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-emerald-950/10 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              How <span className="gradient-text">Food Rescue</span> Works
            </h2>
            <p className="section-subtitle">
              From surplus detection to delivery — fully automated in 4 simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative glass-card p-6 border ${step.bg} hover:scale-105 transition-all duration-500`}
              >
                {/* Step number */}
                <div className={`text-6xl font-extrabold ${step.color} opacity-20 absolute top-2 right-4`}>
                  {step.step}
                </div>
                <step.icon className={`w-10 h-10 ${step.color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
                
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-24 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              Powered by <span className="gradient-text-cool">Cutting-Edge Tech</span>
            </h2>
            <p className="section-subtitle">
              Enterprise-grade architecture built for scale — from hackathon to production.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                className="glass-card-hover p-6 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TECH STACK ==================== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              <span className="gradient-text-warm">Tech Stack</span> That Scales
            </h2>
            <p className="section-subtitle">12+ technologies working in harmony</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="glass-card p-4 text-center cursor-pointer hover:border-green-500/30 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="text-sm font-semibold text-white">{tech.name}</div>
                <div className="text-xs text-slate-500">{tech.category}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-24 relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              Voices of <span className="gradient-text">Impact</span>
            </h2>
          </motion.div>

          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">{TESTIMONIALS[activeTestimonial].avatar}</div>
                <p className="text-xl md:text-2xl text-slate-200 italic mb-6 leading-relaxed">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <div className="text-green-400 font-semibold">{TESTIMONIALS[activeTestimonial].author}</div>
                <div className="text-sm text-slate-500">{TESTIMONIALS[activeTestimonial].role}</div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'bg-green-400 w-8' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SCALE SECTION ==================== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              Built to <span className="gradient-text">Scale</span>
            </h2>
            <p className="section-subtitle">From 1 city to 100 cities — 1 million meals per year</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                phase: 'Hackathon',
                timeline: 'Now',
                cities: '1 City',
                restaurants: '10 Restaurants',
                daily: '100 kg/day',
                color: 'border-green-500/30',
                highlight: 'bg-green-500/10',
                badge: '🏆 Current',
              },
              {
                phase: 'Scale 1',
                timeline: '3 Months',
                cities: '10 Cities',
                restaurants: '100 Restaurants',
                daily: '1 MT/day',
                color: 'border-cyan-500/30',
                highlight: 'bg-cyan-500/10',
                badge: '🚀 Growth',
              },
              {
                phase: 'Scale 2',
                timeline: '1 Year',
                cities: '100 Cities',
                restaurants: '1,000 Restaurants',
                daily: '10 MT/day',
                color: 'border-violet-500/30',
                highlight: 'bg-violet-500/10',
                badge: '🌟 Vision',
              },
            ].map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card p-8 border-2 ${phase.color} ${i === 0 ? 'ring-2 ring-green-500/20' : ''}`}
              >
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${phase.highlight} text-white mb-4`}>
                  {phase.badge}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{phase.phase}</h3>
                <p className="text-slate-500 text-sm mb-6">{phase.timeline}</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cities</span>
                    <span className="text-white font-semibold">{phase.cities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Restaurants</span>
                    <span className="text-white font-semibold">{phase.restaurants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Capacity</span>
                    <span className="text-green-400 font-semibold">{phase.daily}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6 animate-wave inline-block">🍽️</div>
            <h2 className="text-4xl md:text-6xl font-extrabold font-display mb-6">
              <span className="text-white">Ready to</span>{' '}
              <span className="gradient-text">Rescue Food?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Join the movement. Every meal rescued is a life touched. 
              Start making an impact today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary text-lg px-12 py-4">
                Launch Dashboard →
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-12 py-4">
                Join as Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold font-display">Food Rescue</span>
                <span className="text-xs text-slate-500 font-medium ml-1">by CoderPirate</span>
              </div>
              <p className="text-sm text-slate-500">
                AI-powered platform connecting surplus food to those in need. 
                Built by Team CoderPirate for Stack Sprint Hackathon 2026.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <Link to="/dashboard" className="block hover:text-green-400 transition-colors">Dashboard</Link>
                <Link to="/tracking" className="block hover:text-green-400 transition-colors">Live Tracking</Link>
                <Link to="/impact" className="block hover:text-green-400 transition-colors">Impact Stats</Link>
                <Link to="/ai-demo" className="block hover:text-green-400 transition-colors">AI Demo</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Stack</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p>React + TypeScript</p>
                <p>FastAPI + PostgreSQL</p>
                <p>XGBoost + OR-Tools</p>
                <p>GCP Cloud Run + Docker</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Hackathon Areas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Cloud className="w-3 h-3 text-cyan-400" /> <span className="text-slate-500">Cloud-Native</span></div>
                <div className="flex items-center gap-2"><GitBranch className="w-3 h-3 text-green-400" /> <span className="text-slate-500">DevOps</span></div>
                <div className="flex items-center gap-2"><Brain className="w-3 h-3 text-violet-400" /> <span className="text-slate-500">AI/ML</span></div>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-400" /> <span className="text-slate-500">Full-Stack</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>© 2026 Food Rescue Platform by <span className="text-green-400 font-semibold">Team CoderPirate</span>. Built with ❤️ for Stack Sprint Hackathon.</p>
            <p className="mt-1">Saving food. Serving humanity. One meal at a time. 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
