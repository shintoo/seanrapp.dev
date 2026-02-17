"""Fetch the 300 brightest stars near the Summer Triangle from Gaia DR3."""
import json
import urllib.request
import urllib.parse
import csv
import io

QUERY = """
SELECT TOP 1500
  source_id, ra, dec, phot_g_mean_mag, pmra, pmdec, bp_rp
FROM gaiadr3.gaia_source
WHERE 1=CONTAINS(
  POINT('ICRS', ra, dec),
  CIRCLE('ICRS', 296.25, 30.9, 80)
)
AND phot_g_mean_mag IS NOT NULL
AND pmra IS NOT NULL
AND pmdec IS NOT NULL
ORDER BY phot_g_mean_mag ASC
"""

params = urllib.parse.urlencode({
    "REQUEST": "doQuery",
    "LANG": "ADQL",
    "FORMAT": "csv",
    "QUERY": QUERY.strip(),
})

url = "https://gea.esac.esa.int/tap-server/tap/sync?" + params
print("Querying Gaia archive...")
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=120) as resp:
    text = resp.read().decode("utf-8")

reader = csv.DictReader(io.StringIO(text))
stars = []
for row in reader:
    stars.append({
        "source_id": row["source_id"],
        "ra": float(row["ra"]),
        "dec": float(row["dec"]),
        "mag": float(row["phot_g_mean_mag"]),
        "pmra": float(row["pmra"]),
        "pmdec": float(row["pmdec"]),
        "bp_rp": float(row["bp_rp"]) if row.get("bp_rp") else None,
    })

print(f"Got {len(stars)} stars")
print(f"Magnitude range: {stars[0]['mag']:.2f} to {stars[-1]['mag']:.2f}")

with open("static/data/stars.json", "w") as f:
    json.dump(stars, f, separators=(",", ":"))

print("Saved to static/data/stars.json")
