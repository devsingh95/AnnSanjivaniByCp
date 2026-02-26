"""Auth E2E Test"""
import requests, json, time

BASE = "http://localhost:8000/api/v1"
UNIQUE = str(int(time.time()))

# 1. Register a new user
print("=== TEST 1: Register ===")
email = f"user{UNIQUE}@example.com"
reg = requests.post(f"{BASE}/auth/register", json={
    "email": email,
    "password": "Test@123",
    "full_name": "Test User",
    "phone": "8279930796",
    "role": "restaurant"
})
print(f"Status: {reg.status_code}")
data = reg.json()
user = data.get("user", {})
print(f"User: {user.get('email')}, ID: {user.get('id')}, Role: {user.get('role')}")
token = data.get("access_token")
print(f"Token received: {bool(token)}")
assert reg.status_code == 200, f"Registration failed: {data}"

# 2. Login with same credentials
print("\n=== TEST 2: Login ===")
login_resp = requests.post(f"{BASE}/auth/login", json={
    "email": email,
    "password": "Test@123"
})
print(f"Status: {login_resp.status_code}")
ld = login_resp.json()
lu = ld.get("user", {})
print(f"User: {lu.get('email')}, Role: {lu.get('role')}")
login_token = ld.get("access_token")
print(f"Token received: {bool(login_token)}")
assert login_resp.status_code == 200, f"Login failed: {ld}"

# 3. Call /me with the token
print("\n=== TEST 3: /auth/me ===")
me = requests.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {login_token}"})
print(f"Status: {me.status_code}")
me_data = me.json()
print(f"User: {me_data.get('email')}, Name: {me_data.get('full_name')}")
assert me.status_code == 200, f"/me failed: {me_data}"
assert me_data["email"] == email

# 4. Try duplicate registration
print("\n=== TEST 4: Duplicate Registration ===")
dup = requests.post(f"{BASE}/auth/register", json={
    "email": email,
    "password": "Test@123",
    "full_name": "Test User",
    "phone": "8279930796",
    "role": "restaurant"
})
print(f"Status: {dup.status_code} - {dup.json().get('detail')}")
assert dup.status_code == 400

# 5. Try login with wrong password
print("\n=== TEST 5: Wrong Password ===")
bad = requests.post(f"{BASE}/auth/login", json={
    "email": email,
    "password": "wrongpass"
})
print(f"Status: {bad.status_code} - {bad.json().get('detail')}")
assert bad.status_code == 401

# 6. Register NGO user (no phone)
print("\n=== TEST 6: Register NGO (no phone) ===")
ngo = requests.post(f"{BASE}/auth/register", json={
    "email": f"ngo{UNIQUE}@example.com",
    "password": "Test@123",
    "full_name": "Test NGO",
    "role": "ngo"
})
print(f"Status: {ngo.status_code}")
assert ngo.status_code == 200
nd = ngo.json()
print(f"NGO User: {nd['user']['email']}, Role: {nd['user']['role']}")

print("\n=== ALL AUTH TESTS PASSED ===")
