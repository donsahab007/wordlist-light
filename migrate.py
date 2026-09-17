import sqlite3, json

SRC_DB = r"D:\Learn\Code\Voyager\WordList_2\data\wordlist.db"
OUT = r"D:\Learn\Code\Voyager\wordlist-lite\words.json"

conn = sqlite3.connect(SRC_DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT COUNT(*) as c FROM words WHERE example IS NOT NULL AND example != ''")
print("rows with non-empty example:", cur.fetchone()[0])

rows = cur.execute("SELECT * FROM words ORDER BY word COLLATE NOCASE").fetchall()
print("total rows:", len(rows))

result = []
for r in rows:
    d = dict(r)
    result.append({
        "word": d.get("word") or "",
        "meaning": d.get("meaning") or "",
        "partOfSpeech": d.get("partOfSpeech") or "",
        "example": d.get("example") or "",
        "synonyms": d.get("synonyms") or "",
        "antonyms": d.get("antonyms") or "",
        "hindiMeaning": d.get("hindiMeaning") or "",
        "difficulty": d.get("difficulty") or "medium",
        "category": d.get("category") or "General",
    })

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, separators=(",", ":"))

print("wrote", len(result), "words to", OUT)
