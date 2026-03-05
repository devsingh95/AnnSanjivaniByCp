"""Wipe all data from the database."""
import sqlite3
conn = sqlite3.connect('food_rescue.db')
c = conn.cursor()
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'").fetchall()]
for t in tables:
    c.execute(f'DELETE FROM {t}')
conn.commit()
print(f'Wiped {len(tables)} tables: {tables}')
c.execute('SELECT COUNT(*) FROM users')
print(f'Users remaining: {c.fetchone()[0]}')
conn.close()
