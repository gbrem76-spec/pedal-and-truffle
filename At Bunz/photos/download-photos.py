"""
Pedal & Truffle — Photo Downloader
===================================
Run this script to download all sourced photos into the correct folders.

HOW TO RUN:
  1. Open a terminal / command prompt
  2. Navigate to this folder
  3. Run:  python download-photos.py

Requires Python 3.6+ (no extra libraries needed)
"""

import urllib.request
import os
import time

BASE = os.path.dirname(os.path.abspath(__file__))

PHOTOS = [
    # (url, subfolder, filename, credit)

    # ── ATTACK OF THE BUNS ───────────────────────────────────────────────
    ("https://images.unsplash.com/photo-a3bQOBdZXAQ?w=1600&q=80",
     "attack-of-the-buns", "gravel-cyclists.jpg",
     "Unsplash / Getty Images — Free commercial use"),

    ("https://images.unsplash.com/photo-y9cnff1yDag?w=1600&q=80",
     "attack-of-the-buns", "couple-on-dirt-road.jpg",
     "Unsplash — Free commercial use"),

    ("https://images.unsplash.com/photo-pe6_dJGx6ZI?w=1600&q=80",
     "attack-of-the-buns", "winding-forest-road.jpg",
     "Unsplash / Benjamin Ashton — Free commercial use"),

    # ── BRAIDWOOD ────────────────────────────────────────────────────────
    ("https://upload.wikimedia.org/wikipedia/commons/5/5a/BraidwoodCourthouse.JPG",
     "braidwood", "braidwood-courthouse.jpg",
     "Wikimedia Commons — Public Domain"),

    ("https://images.unsplash.com/photo-wGIyghfT9z4?w=1600&q=80",
     "braidwood", "tablelands-dirt-road.jpg",
     "Unsplash — Free commercial use"),

    # ── MONGARLOWE ───────────────────────────────────────────────────────
    ("https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Mongarlowe_-_Bridge_over_Mongarlowe_River_%28Jan_2021%29.jpg/1280px-Mongarlowe_-_Bridge_over_Mongarlowe_River_%28Jan_2021%29.jpg",
     "mongarlowe", "mongarlowe-river-bridge.jpg",
     "Wikimedia Commons — Creative Commons"),

    ("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/House_in_Mongarlowe%2C_New_South_Wales.jpg/1280px-House_in_Mongarlowe%2C_New_South_Wales.jpg",
     "mongarlowe", "mongarlowe-village-house.jpg",
     "Wikimedia Commons — Creative Commons"),

    ("https://images.unsplash.com/photo-ulq3GvvGRmk?w=1600&q=80",
     "mongarlowe", "rural-road-with-fence.jpg",
     "Unsplash — Free commercial use"),

    # ── NOWRA ────────────────────────────────────────────────────────────
    ("https://images.unsplash.com/photo-OYGO50LHFA4?w=1600&q=80",
     "nowra", "aerial-road-through-trees.jpg",
     "Unsplash — Free commercial use"),

    ("https://images.unsplash.com/photo-U3lV0oAPnE8?w=1600&q=80",
     "nowra", "kangaroo-green-field.jpg",
     "Unsplash — Free commercial use"),

    # ── BUDAWANG NATIONAL PARK ───────────────────────────────────────────
    ("https://images.unsplash.com/photo-Uha6ogFcuto?w=1600&q=80",
     "budawang-national-park", "forest-dirt-road.jpg",
     "Unsplash / Jackie Alexander — Free commercial use"),

    ("https://images.unsplash.com/photo-AmBS9frh9qg?w=1600&q=80",
     "budawang-national-park", "rocky-mountain-waterfall.jpg",
     "Unsplash — Free commercial use"),

    # ── MORTON NATIONAL PARK ─────────────────────────────────────────────
    ("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Beautiful_Fitzroy_Falls.jpg/960px-Beautiful_Fitzroy_Falls.jpg",
     "morton-national-park", "fitzroy-falls.jpg",
     "Wikimedia Commons — Public Domain"),

    ("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/CSIRO_ScienceImage_4650_Fitzroy_Falls_near_Moss_Vale_NSW_1998.jpg/960px-CSIRO_ScienceImage_4650_Fitzroy_Falls_near_Moss_Vale_NSW_1998.jpg",
     "morton-national-park", "fitzroy-falls-aerial.jpg",
     "Wikimedia Commons / CSIRO — Public Domain"),

    # ── TIANJARA FALLS ───────────────────────────────────────────────────
    ("https://images.unsplash.com/photo-7sQis1kcLj0?w=1600&q=80",
     "tianjara-falls", "gorge-stream.jpg",
     "Unsplash — Free commercial use"),

    ("https://images.unsplash.com/photo-AmBS9frh9qg?w=1600&q=80",
     "tianjara-falls", "waterfall-sandstone.jpg",
     "Unsplash — Free commercial use"),
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

def download(url, folder, filename, credit):
    dest_dir = os.path.join(BASE, folder)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, filename)

    if os.path.exists(dest):
        size = os.path.getsize(dest)
        if size > 10000:
            print(f"  SKIP  {folder}/{filename} (already exists, {size//1024}KB)")
            return True

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as response:
            data = response.read()
        with open(dest, 'wb') as f:
            f.write(data)
        size = len(data)
        print(f"  OK    {folder}/{filename}  ({size//1024}KB)  — {credit}")
        return True
    except Exception as e:
        print(f"  FAIL  {folder}/{filename}  — {e}")
        return False


def main():
    print("=" * 60)
    print("  Pedal & Truffle — Photo Downloader")
    print("=" * 60)
    print(f"\nSaving to: {BASE}\n")

    ok = 0
    fail = 0
    failed_items = []

    for url, folder, filename, credit in PHOTOS:
        result = download(url, folder, filename, credit)
        if result:
            ok += 1
        else:
            fail += 1
            failed_items.append((folder, filename, url))
        time.sleep(0.4)   # polite delay between requests

    print("\n" + "=" * 60)
    print(f"  Done — {ok} downloaded, {fail} failed")
    print("=" * 60)

    if failed_items:
        print("\nFailed downloads — save these manually:")
        for folder, filename, url in failed_items:
            print(f"\n  Folder:  {folder}")
            print(f"  File:    {filename}")
            print(f"  URL:     {url}")

    print("\nAll files saved to the photos/ subfolders.")
    print("Open the website at: ../website/pedal-and-truffle.html\n")


if __name__ == "__main__":
    main()
