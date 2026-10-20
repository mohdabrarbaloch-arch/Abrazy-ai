import sqlite3

con = sqlite3.connect("dev.db")
cur = con.cursor()
tables = [r[0] for r in cur.execute("SELECT tbl_name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    if not t.startswith("sqlite_"):
        count = cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"{t}: {count} rows")
