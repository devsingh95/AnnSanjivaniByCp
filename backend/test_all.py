"""Full integration test: ML models, Auth, Surplus flow"""
import requests
import json
import sys

BASE = "http://localhost:8000/api/v1"

def test_ml():
    print("=" * 60)
    print("TEST 1: ML Surplus Prediction (XGBoost)")
    print("=" * 60)
    r = requests.post(f"{BASE}/ml/predict-surplus", json={
        "day_of_week": 5, "guest_count": 150, "event_type": "wedding",
        "weather": "clear", "base_surplus_kg": 30, "cuisine": "Unknown", "time_of_day": 14
    })
    assert r.status_code == 200, f"FAIL: status {r.status_code} - {r.text}"
    d = r.json()
    print(f"  Predicted: {d['predicted_kg']} kg")
    print(f"  Confidence: {d['confidence']}")
    print(f"  Model Version: {d['model_version']}")
    print(f"  Breakdown: {d['category_breakdown']}")
    print(f"  Recommendation: {d['recommendation'][:80]}...")
    assert d["predicted_kg"] > 0, "Prediction should be > 0"
    assert "fallback" not in d["model_version"], "Model should use real XGBoost, not fallback!"
    print("  -> PASSED (Real XGBoost model working!)\n")

    # Test with different params
    for event in ["normal", "festival", "corporate"]:
        r2 = requests.post(f"{BASE}/ml/predict-surplus", json={
            "day_of_week": 3, "guest_count": 80, "event_type": event,
            "weather": "rain", "base_surplus_kg": 20
        })
        d2 = r2.json()
        print(f"  {event}: {d2['predicted_kg']} kg (conf: {d2['confidence']})")
    print()

    print("=" * 60)
    print("TEST 2: Route Optimization (2-opt VRP)")
    print("=" * 60)
    r = requests.post(f"{BASE}/ml/optimize-route", json={
        "driver_lat": 19.0596, "driver_lng": 72.8295,
        "pickups": [
            {"lat": 18.9220, "lng": 72.8347, "name": "Restaurant A"},
            {"lat": 18.9588, "lng": 72.8340, "name": "Restaurant B"},
        ],
        "dropoffs": [
            {"lat": 19.0989, "lng": 72.8264, "name": "NGO Alpha"},
            {"lat": 19.0650, "lng": 72.8694, "name": "NGO Beta"},
        ],
    })
    assert r.status_code == 200, f"FAIL: status {r.status_code} - {r.text}"
    d = r.json()
    print(f"  Total Distance: {d['total_distance_km']} km")
    print(f"  Total Time: {d['total_time_mins']} min")
    print(f"  Fuel Cost: Rs {d['fuel_cost_inr']}")
    print(f"  CO2: {d['co2_emission_kg']} kg")
    print(f"  Solver: {d['solver']}")
    for i, stop in enumerate(d["optimized_route"]):
        print(f"    Stop {i+1}: [{stop['type']}] {stop['name']} ({stop['distance_from_prev_km']}km, {stop['eta_mins']}min)")
    assert d["total_distance_km"] > 0
    assert len(d["optimized_route"]) == 4
    print("  -> PASSED\n")

    print("=" * 60)
    print("TEST 3: Food Classification (NLP)")
    print("=" * 60)
    tests = [
        ("Paneer butter masala with naan and jeera rice", True),
        ("Chicken biryani with raita", False),
        ("Gulab jamun and rasgulla desserts", True),
        ("Samosa pakora bhel chaat snacks", True),
    ]
    for desc, expected_veg in tests:
        r = requests.post(f"{BASE}/ml/classify-food", json={"description": desc})
        assert r.status_code == 200
        d = r.json()
        print(f"  '{desc}'")
        print(f"    -> Category: {d['primary_category']} (conf: {d['confidence']})")
        print(f"    -> Veg: {d['is_vegetarian']}, Shelf: {d['shelf_life_hours']}h")
        print(f"    -> Storage: {d['storage_recommendation'][:60]}...")
        assert d["is_vegetarian"] == expected_veg, f"Veg mismatch for {desc}"
        assert d["primary_category"] in ["veg", "non_veg", "rice", "bread", "curry", "snacks", "sweets", "mixed"]
    print("  -> ALL CLASSIFICATIONS PASSED\n")


def test_auth():
    print("=" * 60)
    print("TEST 4: User Registration")
    print("=" * 60)
    # Register a restaurant user
    r = requests.post(f"{BASE}/auth/register", json={
        "email": "testrestaurant@test.com",
        "password": "test123456",
        "full_name": "Test Restaurant Owner",
        "phone": "+919876543210",
        "role": "restaurant"
    })
    if r.status_code == 400 and "already registered" in r.text:
        print("  User already exists, testing login instead...")
    else:
        assert r.status_code == 200, f"FAIL: {r.status_code} - {r.text}"
        d = r.json()
        print(f"  Registered: {d['user']['full_name']} ({d['user']['email']})")
        print(f"  Role: {d['user']['role']}")
        print(f"  Token: {d['access_token'][:30]}...")
        assert d["user"]["role"] == "restaurant"
    print("  -> PASSED\n")

    print("=" * 60)
    print("TEST 5: User Login")
    print("=" * 60)
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "testrestaurant@test.com",
        "password": "test123456"
    })
    assert r.status_code == 200, f"FAIL: {r.status_code} - {r.text}"
    d = r.json()
    token = d["access_token"]
    print(f"  Logged in: {d['user']['full_name']}")
    print(f"  Token: {token[:30]}...")
    print("  -> PASSED\n")

    print("=" * 60)
    print("TEST 6: Auth /me endpoint")
    print("=" * 60)
    r = requests.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, f"FAIL: {r.status_code} - {r.text}"
    d = r.json()
    print(f"  User: {d['full_name']} | Email: {d['email']} | Role: {d['role']}")
    print("  -> PASSED\n")

    # Test invalid token
    r = requests.get(f"{BASE}/auth/me", headers={"Authorization": "Bearer invalidtoken123"})
    assert r.status_code == 401, f"Should reject invalid token, got {r.status_code}"
    print("  Invalid token correctly rejected (401)")

    # Test wrong password
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "testrestaurant@test.com", "password": "wrongpassword"
    })
    assert r.status_code == 401
    print("  Wrong password correctly rejected (401)")
    print("  -> AUTH SECURITY PASSED\n")

    # Register NGO user
    print("=" * 60)
    print("TEST 7: Register NGO User")
    print("=" * 60)
    r = requests.post(f"{BASE}/auth/register", json={
        "email": "testngo@test.com",
        "password": "test123456",
        "full_name": "Test NGO Foundation",
        "phone": "+919876543211",
        "role": "ngo"
    })
    if r.status_code == 400:
        print("  NGO user already exists, skipping")
    else:
        assert r.status_code == 200
        print(f"  Registered NGO: {r.json()['user']['full_name']}")
    print("  -> PASSED\n")

    # Register Driver user
    r = requests.post(f"{BASE}/auth/register", json={
        "email": "testdriver@test.com",
        "password": "test123456",
        "full_name": "Test Driver",
        "phone": "+919876543212",
        "role": "driver"
    })
    if r.status_code == 400:
        print("  Driver user already exists, skipping")
    else:
        assert r.status_code == 200
        print(f"  Registered Driver: {r.json()['user']['full_name']}")
    print()

    return token


def test_surplus(token):
    print("=" * 60)
    print("TEST 8: Create Surplus Request (authenticated)")
    print("=" * 60)
    headers = {"Authorization": f"Bearer {token}"}

    # Create surplus entry
    r = requests.post(f"{BASE}/surplus", json={
        "food_description": "Dal Makhani with Jeera Rice and Naan",
        "food_category": "curry",
        "quantity_kg": 25.0,
        "expiry_hours": 4,
    }, headers=headers)
    assert r.status_code == 200, f"FAIL: {r.status_code} - {r.text}"
    d = r.json()
    surplus_id = d["id"]
    print(f"  Created surplus #{surplus_id}")
    print(f"  Food: {d['food_description']}")
    print(f"  Quantity: {d['quantity_kg']} kg")
    print(f"  Predicted: {d['predicted_quantity_kg']} kg")
    print(f"  Category: {d['food_category']}")
    print(f"  Status: {d['status']}")
    print(f"  Restaurant: {d['restaurant_name']}")
    if d.get("ngo_id"):
        print(f"  Auto-assigned NGO ID: {d['ngo_id']}")
    if d.get("driver_id"):
        print(f"  Auto-assigned Driver ID: {d['driver_id']}")
    print("  -> PASSED\n")

    # Create another surplus
    print("=" * 60)
    print("TEST 9: Create Second Surplus (different food)")
    print("=" * 60)
    r = requests.post(f"{BASE}/surplus", json={
        "food_description": "Chicken Biryani with Raita, 80 servings",
        "food_category": "rice",
        "quantity_kg": 18.0,
        "expiry_hours": 2,
    }, headers=headers)
    assert r.status_code == 200, f"FAIL: {r.status_code} - {r.text}"
    d = r.json()
    print(f"  Created surplus #{d['id']}: {d['food_description']}")
    print(f"  Status: {d['status']}, Predicted: {d['predicted_quantity_kg']} kg")
    print("  -> PASSED\n")

    # List all surplus
    print("=" * 60)
    print("TEST 10: List All Surplus Requests")
    print("=" * 60)
    r = requests.get(f"{BASE}/surplus")
    assert r.status_code == 200
    items = r.json()
    print(f"  Total surplus entries: {len(items)}")
    for item in items:
        print(f"    #{item['id']}: {item['food_description'][:40]} | {item['quantity_kg']}kg | {item['status']}")
    print("  -> PASSED\n")

    # Check impact dashboard reflects the data
    print("=" * 60)
    print("TEST 11: Impact Dashboard (should reflect surplus data)")
    print("=" * 60)
    r = requests.get(f"{BASE}/impact/dashboard")
    assert r.status_code == 200
    d = r.json()
    print(f"  Total Food Saved: {d.get('total_food_saved_kg', 0)} kg")
    print(f"  Total Meals: {d.get('total_meals_served', 0)}")
    print(f"  Active Restaurants: {d.get('active_restaurants', 0)}")
    print("  -> PASSED\n")

    # Test unauthenticated surplus creation should fail
    print("=" * 60)
    print("TEST 12: Surplus without auth should fail")
    print("=" * 60)
    r = requests.post(f"{BASE}/surplus", json={
        "food_description": "Should fail", "quantity_kg": 10,
    })
    assert r.status_code in [401, 403], f"Should reject unauthenticated, got {r.status_code}"
    print(f"  Correctly rejected unauthenticated request ({r.status_code})")
    print("  -> PASSED\n")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  ANN-SANJIVANI AI — FULL INTEGRATION TEST SUITE")
    print("=" * 60 + "\n")

    try:
        test_ml()
        token = test_auth()
        test_surplus(token)
        print("=" * 60)
        print("  ALL 12 TESTS PASSED!")
        print("=" * 60)
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
