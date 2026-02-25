"""End-to-end test for the full order lifecycle."""
import requests

BASE = "http://localhost:8000/api/v1"

def main():
    # 1. Register restaurant user
    print("=== TEST 1: Register restaurant user ===")
    r = requests.post(f"{BASE}/auth/register", json={
        "username": "testrest2", "email": "rest2@test.com", "password": "Test123!",
        "role": "restaurant", "full_name": "Test Restaurant", "phone": "+919876543210",
        "address": "Mumbai", "lat": 19.076, "lng": 72.877,
        "cuisine_type": "Indian", "capacity_kg": 100.0
    })
    print(f"  Status: {r.status_code}")
    if r.ok:
        print(f"  User ID: {r.json().get('id')}, Role: {r.json().get('role')}")
    else:
        print(f"  Error: {r.text[:200]}")

    # 2. Login
    print("\n=== TEST 2: Login ===")
    r = requests.post(f"{BASE}/auth/login", json={"email": "rest2@test.com", "password": "Test123!"})
    print(f"  Status: {r.status_code}")
    token = r.json().get("access_token", "") if r.ok else ""
    headers = {"Authorization": f"Bearer {token}"}
    if token:
        print("  Token obtained ✓")
    else:
        print(f"  Error: {r.text[:200]}")

    # 3. Create surplus with temperature data
    print("\n=== TEST 3: Create surplus with temperature ===")
    r = requests.post(f"{BASE}/surplus", json={
        "food_description": "Leftover Dal Rice",
        "quantity_kg": 10.0,
        "food_category": "rice",
        "expiry_hours": 4,
        "donor_lat": 19.076,
        "donor_lng": 72.877,
        "temperature_celsius": 72.5,
        "food_condition": "hot"
    }, headers=headers)
    print(f"  Status: {r.status_code}")
    surplus = {}
    if r.ok:
        surplus = r.json()
        print(f"  Order ID: {surplus.get('id')}")
        print(f"  Status: {surplus.get('status')}")
        print(f"  Temperature: {surplus.get('temperature_celsius')}°C")
        print(f"  Food Condition: {surplus.get('food_condition')}")
        print(f"  Temp OK: {surplus.get('temperature_ok')}")
        print(f"  Temp Safety Alert: {surplus.get('temp_safety_alert')}")
        print(f"  NGO: {surplus.get('ngo_name')}")
        print(f"  Driver: {surplus.get('driver_name')}")
    else:
        print(f"  Error: {r.text[:300]}")

    # 3b. Create surplus with UNSAFE temperature (cold food at 15°C)
    print("\n=== TEST 3b: Create surplus with unsafe temperature ===")
    r = requests.post(f"{BASE}/surplus", json={
        "food_description": "Cold Raita and Salad",
        "quantity_kg": 5.0,
        "food_category": "veg",
        "expiry_hours": 2,
        "donor_lat": 19.076,
        "donor_lng": 72.877,
        "temperature_celsius": 15.0,
        "food_condition": "cold"
    }, headers=headers)
    print(f"  Status: {r.status_code}")
    if r.ok:
        s2 = r.json()
        print(f"  Order ID: {s2.get('id')}")
        print(f"  Temperature: {s2.get('temperature_celsius')}°C")
        print(f"  Food Condition: {s2.get('food_condition')}")
        print(f"  Temp OK: {s2.get('temperature_ok')}")
        print(f"  Temp Safety Alert: {s2.get('temp_safety_alert')} {'✓ CORRECT — unsafe temp detected!' if s2.get('temp_safety_alert') else '✗ WRONG — should be True'}")
    else:
        print(f"  Error: {r.text[:200]}")

    # 4. Get my orders
    print("\n=== TEST 4: My orders ===")
    r = requests.get(f"{BASE}/surplus/my-orders", headers=headers)
    print(f"  Status: {r.status_code}")
    if r.ok:
        orders = r.json()
        print(f"  Count: {len(orders)}")
        for o in orders:
            print(f"    #{o.get('id')} - {o.get('status')} - {o.get('food_description')}")

    sid = surplus.get("id")
    if not sid:
        print("\nSkipping status updates (no surplus created)")
        return

    # 5. Update to picked_up
    print("\n=== TEST 5: Update to picked_up ===")
    r = requests.patch(f"{BASE}/surplus/{sid}/status", json={"new_status": "picked_up"}, headers=headers)
    print(f"  Status: {r.status_code}")
    if r.ok:
        print(f"  New status: {r.json().get('status')}")
    else:
        print(f"  Error: {r.text[:200]}")

    # 6. Update to in_transit
    print("\n=== TEST 6: Update to in_transit ===")
    r = requests.patch(f"{BASE}/surplus/{sid}/status", json={"new_status": "in_transit"}, headers=headers)
    print(f"  Status: {r.status_code}")
    if r.ok:
        print(f"  New status: {r.json().get('status')}")
    else:
        print(f"  Error: {r.text[:200]}")

    # 7. Update to delivered
    print("\n=== TEST 7: Update to delivered ===")
    r = requests.patch(f"{BASE}/surplus/{sid}/status", json={
        "new_status": "delivered", "quality_rating": 5, "feedback_note": "Great food"
    }, headers=headers)
    print(f"  Status: {r.status_code}")
    if r.ok:
        print(f"  New status: {r.json().get('status')}")
    else:
        print(f"  Error: {r.text[:200]}")

    # 8. Impact dashboard
    print("\n=== TEST 8: Impact dashboard ===")
    r = requests.get(f"{BASE}/impact/dashboard")
    print(f"  Status: {r.status_code}")
    if r.ok:
        d = r.json()
        print(f"  Total kg saved: {d.get('total_kg_saved')}")
        print(f"  Total meals: {d.get('total_meals_served')}")
        print(f"  CO2 saved: {d.get('total_co2_saved_kg')}")
        print(f"  Water saved: {d.get('total_water_saved_liters')}")
        print(f"  Money saved: {d.get('total_money_saved_inr')}")

    # 9. Tracking
    print("\n=== TEST 9: Tracking endpoints ===")
    r = requests.get(f"{BASE}/tracking/active-jobs")
    print(f"  Active jobs: {r.status_code}, Count: {len(r.json()) if r.ok else 0}")
    r = requests.get(f"{BASE}/tracking/all-locations")
    if r.ok:
        locs = r.json()
        print(f"  Restaurants: {len(locs.get('restaurants', []))}")
        print(f"  NGOs: {len(locs.get('ngos', []))}")
        print(f"  Drivers: {len(locs.get('drivers', []))}")

    # 10. List all surplus
    print("\n=== TEST 10: List all surplus ===")
    r = requests.get(f"{BASE}/surplus")
    if r.ok:
        orders = r.json()
        print(f"  Total orders: {len(orders)}")
        for o in orders:
            print(f"    #{o.get('id')} [{o.get('status')}] {o.get('food_description')} - {o.get('quantity_kg')}kg")

    print("\n=== ALL TESTS COMPLETE ===")

if __name__ == "__main__":
    main()
