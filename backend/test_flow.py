"""Comprehensive auth flow test."""
import requests

BASE = 'http://localhost:5173/api/v1'

print('=' * 50)
print('STEP 1: Register')
r = requests.post(f'{BASE}/auth/register', json={
    'email': 'Devsingh95577@gmail.com',
    'password': 'Dev@12345',
    'full_name': 'Dev Singh',
    'role': 'restaurant'
})
print(f'  Status: {r.status_code}')
data = r.json()
if r.status_code == 200:
    token = data['access_token']
    user = data['user']
    print(f'  User ID: {user["id"]}')
    print(f'  Email: {user["email"]}')
    print(f'  Token: {token[:20]}...')
else:
    print(f'  Error: {data}')
    exit(1)

print()
print('STEP 2: Login with same credentials')
r2 = requests.post(f'{BASE}/auth/login', json={
    'email': 'Devsingh95577@gmail.com',
    'password': 'Dev@12345'
})
print(f'  Status: {r2.status_code}')
data2 = r2.json()
if r2.status_code == 200:
    user2 = data2['user']
    token2 = data2['access_token']
    print(f'  User: {user2["full_name"]}')
    print(f'  Token: {token2[:20]}...')
else:
    print(f'  Error: {data2}')

print()
print('STEP 3: Get /auth/me')
r3 = requests.get(f'{BASE}/auth/me', headers={'Authorization': f'Bearer {token2}'})
print(f'  Status: {r3.status_code}')
if r3.status_code == 200:
    me = r3.json()
    print(f'  ID: {me["id"]} Email: {me["email"]} Role: {me["role"]}')
else:
    print(f'  Error: {r3.text}')

print()
print('STEP 4: Duplicate register (should fail with 400)')
r4 = requests.post(f'{BASE}/auth/register', json={
    'email': 'Devsingh95577@gmail.com',
    'password': 'Dev@12345',
    'full_name': 'Dev Singh',
    'role': 'restaurant'
})
print(f'  Status: {r4.status_code}')
print(f'  Body: {r4.text}')

print()
print('=' * 50)
all_pass = (r.status_code == 200 and r2.status_code == 200
            and r3.status_code == 200 and r4.status_code == 400)
print('ALL TESTS PASSED!' if all_pass else 'SOME TESTS FAILED')
