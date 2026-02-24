"""
Food Rescue Platform — ML Service
──────────────────────────────────
Three intelligent models for the hackathon demo:

1. SurplusPredictor   — XGBoost-style multi-feature surplus estimation
2. RouteOptimizer     — OR-Tools inspired nearest-neighbor + 2-opt VRP solver
3. FoodClassifier     — IndicBERT-style keyword NLP classifier

All models are deterministic mocks that mirror real ML outputs (confidence
intervals, feature importance, shelf-life, CO₂ estimates).
"""
import math
import random
import hashlib
from typing import List, Dict, Tuple
from config import settings


# ═══════════════════════════════════════════════════
#  1.  SURPLUS PREDICTOR
# ═══════════════════════════════════════════════════
class SurplusPredictor:
    """Simulates an XGBoost regressor trained on 10K historical records."""

    MODEL_VERSION = settings.SURPLUS_MODEL_VERSION

    DAY_WEIGHTS = {0: 0.78, 1: 0.82, 2: 0.88, 3: 0.93, 4: 1.10, 5: 1.32, 6: 1.22}
    EVENT_WEIGHTS = {"normal": 1.0, "wedding": 2.6, "festival": 2.1, "corporate": 1.55, "birthday": 1.35}
    WEATHER_WEIGHTS = {"clear": 1.0, "rain": 1.35, "hot": 0.88, "cold": 1.12}
    FEATURE_IMPORTANCE = {
        "guest_count": 0.28,
        "day_of_week": 0.18,
        "event_type": 0.22,
        "weather": 0.12,
        "base_surplus": 0.10,
        "historical_mean": 0.06,
        "month_seasonality": 0.04,
    }

    # Realistic category distribution per cuisine style
    CATEGORY_TEMPLATES = {
        "default": {"veg_curry": 0.35, "rice": 0.22, "bread": 0.13, "snacks_sweets": 0.12, "other": 0.18},
        "biryani":  {"veg_curry": 0.15, "rice": 0.50, "bread": 0.05, "snacks_sweets": 0.10, "other": 0.20},
        "thali":    {"veg_curry": 0.40, "rice": 0.18, "bread": 0.15, "snacks_sweets": 0.15, "other": 0.12},
    }

    def predict(
        self,
        day_of_week: int,
        guest_count: int,
        event_type: str,
        weather: str,
        base_surplus: float = 15.0,
        cuisine_hint: str = "default",
    ) -> dict:
        day_w = self.DAY_WEIGHTS.get(day_of_week, 1.0)
        event_w = self.EVENT_WEIGHTS.get(event_type, 1.0)
        weather_w = self.WEATHER_WEIGHTS.get(weather, 1.0)
        guest_factor = guest_count / 100.0

        raw = base_surplus * day_w * event_w * weather_w * guest_factor
        # Tiny deterministic noise based on inputs (no true randomness for reproducibility)
        seed = int(hashlib.md5(f"{day_of_week}{guest_count}{event_type}{weather}".encode()).hexdigest()[:8], 16)
        rng = random.Random(seed)
        noise = rng.uniform(-1.8, 1.8)
        predicted_kg = max(round(raw + noise, 1), 0.5)

        confidence = round(min(0.96, 0.78 + 0.003 * guest_count / 10 + rng.uniform(0, 0.06)), 2)
        margin = round(predicted_kg * (1 - confidence) * 1.2, 1)

        # Category breakdown
        tpl = self.CATEGORY_TEMPLATES.get(cuisine_hint, self.CATEGORY_TEMPLATES["default"])
        breakdown = {k: round(predicted_kg * v, 1) for k, v in tpl.items()}

        # Recommendation engine
        if predicted_kg > 80:
            rec = "🔴 Critical surplus! Reduce prep 25%, pre-alert 5+ NGOs, deploy 3 vans."
        elif predicted_kg > 40:
            rec = "🟠 High surplus. Reduce prep 15%, pre-alert 2-3 NGOs, assign 2 drivers."
        elif predicted_kg > 20:
            rec = "🟡 Moderate surplus. 1-2 NGOs can absorb. Consider batch-cooking reduction."
        else:
            rec = "🟢 Low surplus. Standard single-NGO pickup will suffice."

        return {
            "predicted_kg": predicted_kg,
            "confidence": confidence,
            "confidence_interval": {"lower": max(0, round(predicted_kg - margin, 1)), "upper": round(predicted_kg + margin, 1)},
            "category_breakdown": breakdown,
            "recommendation": rec,
            "feature_importance": self.FEATURE_IMPORTANCE,
            "model_version": self.MODEL_VERSION,
        }


# ═══════════════════════════════════════════════════
#  2.  ROUTE OPTIMIZER  (VRP solver)
# ═══════════════════════════════════════════════════
class RouteOptimizer:
    """Nearest-neighbor heuristic with 2-opt local search improvement."""

    SOLVER_NAME = settings.ROUTE_SOLVER
    AVG_SPEED_KMH = settings.DRIVER_SPEED_KMH
    FUEL_RATE_PER_KM = 3.5   # INR
    CO2_PER_KM = 0.12        # kg CO₂ per km (bike / auto average)

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Return distance in km between two geo-coordinates."""
        R = 6371.0
        la1, lo1, la2, lo2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat, dlon = la2 - la1, lo2 - lo1
        a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a))

    # ── 2-opt improvement ────────────────────────
    def _two_opt(self, route: list) -> list:
        """Apply 2-opt local search to shorten an ordered route."""
        improved = True
        best = route[:]
        while improved:
            improved = False
            for i in range(1, len(best) - 1):
                for j in range(i + 1, len(best)):
                    new = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                    if self._total_distance(new) < self._total_distance(best):
                        best = new
                        improved = True
            # Only one pass for demo speed
            break
        return best

    def _total_distance(self, stops: list) -> float:
        d = 0.0
        for a, b in zip(stops, stops[1:]):
            d += self.haversine_distance(a["lat"], a["lng"], b["lat"], b["lng"])
        return d

    def optimize_route(
        self,
        driver_lat: float,
        driver_lng: float,
        pickups: list,
        dropoffs: list,
    ) -> dict:
        # Build stop nodes
        all_stops = []
        for p in (pickups if isinstance(pickups, list) else [pickups]):
            p = p if isinstance(p, dict) else p.model_dump()
            all_stops.append({"type": "pickup", "lat": p["lat"], "lng": p["lng"],
                              "name": p.get("name", "Restaurant"), "order_id": p.get("order_id", 0)})
        for d in (dropoffs if isinstance(dropoffs, list) else [dropoffs]):
            d = d if isinstance(d, dict) else d.model_dump()
            all_stops.append({"type": "dropoff", "lat": d["lat"], "lng": d["lng"],
                              "name": d.get("name", "NGO"), "order_id": d.get("order_id", 0)})

        # Nearest-neighbour initial tour (pickups first)
        current = {"lat": driver_lat, "lng": driver_lng}
        remaining = all_stops[:]
        ordered: list = []

        while remaining:
            pick_rem = [s for s in remaining if s["type"] == "pickup"]
            pool = pick_rem if pick_rem else remaining
            nearest = min(pool, key=lambda s: self.haversine_distance(current["lat"], current["lng"], s["lat"], s["lng"]))
            ordered.append(nearest)
            current = nearest
            remaining.remove(nearest)

        # 2-opt improvement
        ordered = self._two_opt(ordered)

        # Build response with cumulative stats
        route_out = []
        prev_lat, prev_lng = driver_lat, driver_lng
        cum_km, cum_min = 0.0, 0.0
        for stop in ordered:
            seg_km = self.haversine_distance(prev_lat, prev_lng, stop["lat"], stop["lng"])
            seg_min = seg_km / self.AVG_SPEED_KMH * 60
            cum_km += seg_km
            cum_min += seg_min
            route_out.append({
                "type": stop["type"],
                "lat": stop["lat"],
                "lng": stop["lng"],
                "name": stop["name"],
                "order_id": stop.get("order_id", 0),
                "distance_from_prev_km": round(seg_km, 2),
                "eta_mins": round(seg_min, 1),
                "cumulative_km": round(cum_km, 2),
                "cumulative_mins": round(cum_min, 1),
            })
            prev_lat, prev_lng = stop["lat"], stop["lng"]

        total_km = round(cum_km, 2)
        total_min = round(cum_min, 1)
        return {
            "optimized_route": route_out,
            "total_distance_km": total_km,
            "total_time_mins": total_min,
            "fuel_cost_inr": round(total_km * self.FUEL_RATE_PER_KM, 0),
            "co2_emission_kg": round(total_km * self.CO2_PER_KM, 2),
            "solver": self.SOLVER_NAME,
        }


# ═══════════════════════════════════════════════════
#  3.  FOOD CLASSIFIER  (NLP)
# ═══════════════════════════════════════════════════
class FoodClassifier:
    """Keyword-based NLP classifier simulating a fine-tuned IndicBERT model."""

    MODEL_VERSION = settings.CLASSIFIER_MODEL

    CATEGORY_KEYWORDS: Dict[str, List[str]] = {
        "veg": ["paneer", "sabzi", "dal", "vegetable", "aloo", "gobi", "palak",
                "chole", "rajma", "bhindi", "matar", "mushroom", "soya", "tofu"],
        "non_veg": ["chicken", "mutton", "fish", "egg", "prawn", "kebab",
                    "tikka", "tandoori chicken", "butter chicken", "keema"],
        "rice": ["rice", "pulao", "biryani", "jeera rice", "fried rice",
                 "khichdi", "tahiri", "curd rice"],
        "bread": ["roti", "naan", "paratha", "chapati", "puri", "bread",
                  "pav", "kulcha", "bhatura", "phulka"],
        "curry": ["curry", "gravy", "masala", "korma", "kadai", "rogan josh",
                  "vindaloo", "makhani", "butter"],
        "snacks": ["samosa", "pakora", "bhaji", "vada", "chaat", "bhel",
                   "pani puri", "dahi vada", "kachori", "dhokla"],
        "sweets": ["gulab jamun", "rasgulla", "halwa", "kheer", "jalebi",
                   "ladoo", "barfi", "rasmalai", "sandesh", "payasam"],
    }

    VEG_INDICATORS = {"paneer", "sabzi", "dal", "vegetable", "aloo", "gobi",
                      "palak", "chole", "rajma", "veg", "tofu", "soya", "mushroom"}
    NON_VEG_INDICATORS = {"chicken", "mutton", "fish", "egg", "prawn", "kebab", "keema"}

    SHELF_LIFE: Dict[str, int] = {
        "veg": 6, "non_veg": 3, "rice": 5, "bread": 8,
        "curry": 5, "snacks": 10, "sweets": 12, "mixed": 4,
    }
    STORAGE: Dict[str, str] = {
        "veg": "Refrigerate below 5 °C; reheat before serving.",
        "non_veg": "Refrigerate immediately; consume within 3 h for safety.",
        "rice": "Keep covered at room temp up to 2 h, then refrigerate.",
        "bread": "Room temperature in airtight bag; lasts 6-8 h.",
        "curry": "Hot-hold above 65 °C or refrigerate below 5 °C.",
        "snacks": "Room temperature; avoid moisture.",
        "sweets": "Cool, dry place; refrigerate cream-based items.",
        "mixed": "Separate veg/non-veg; refrigerate perishable items.",
    }

    def classify(self, description: str) -> str:
        """Return primary category string (backward-compatible)."""
        result = self.classify_detailed(description)
        return result["primary_category"]

    def classify_detailed(self, description: str) -> dict:
        """Full classification with confidence scores, diet info, storage advice."""
        desc = description.lower()
        tokens = set(desc.replace(",", " ").replace("(", " ").replace(")", " ").split())

        scores: Dict[str, Dict] = {}
        for cat, keywords in self.CATEGORY_KEYWORDS.items():
            matched = [kw for kw in keywords if kw in desc]
            score = len(matched)
            if score > 0:
                # Confidence: base + bonus per match, capped at 0.98
                conf = min(0.98, 0.40 + score * 0.15)
            else:
                conf = 0.05
            scores[cat] = {"score": score, "confidence": round(conf, 2), "matched": matched}

        # Sort descending by score then confidence
        ranked = sorted(scores.items(), key=lambda x: (x[1]["score"], x[1]["confidence"]), reverse=True)
        primary = ranked[0][0] if ranked[0][1]["score"] > 0 else "mixed"
        primary_conf = ranked[0][1]["confidence"] if ranked[0][1]["score"] > 0 else 0.30

        # Vegetarian check
        has_veg = any(t in self.VEG_INDICATORS for t in tokens) or any(t in desc for t in self.VEG_INDICATORS)
        has_nonveg = any(t in self.NON_VEG_INDICATORS for t in tokens) or any(t in desc for t in self.NON_VEG_INDICATORS)
        is_veg = has_veg and not has_nonveg

        all_scores = [
            {"category": cat, "confidence": data["confidence"], "matched_keywords": data["matched"]}
            for cat, data in ranked if data["score"] > 0
        ]
        # Always include at least one entry
        if not all_scores:
            all_scores = [{"category": "mixed", "confidence": 0.30, "matched_keywords": []}]

        return {
            "description": description,
            "primary_category": primary,
            "confidence": primary_conf,
            "all_scores": all_scores,
            "is_vegetarian": is_veg,
            "shelf_life_hours": self.SHELF_LIFE.get(primary, 4),
            "storage_recommendation": self.STORAGE.get(primary, self.STORAGE["mixed"]),
            "model_version": self.MODEL_VERSION,
        }


# ── Singleton instances ──────────────────────────
surplus_predictor = SurplusPredictor()
route_optimizer = RouteOptimizer()
food_classifier = FoodClassifier()
