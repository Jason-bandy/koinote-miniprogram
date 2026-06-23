#!/usr/bin/env python3
"""Generate Material Icons style tab bar icons for WeChat mini program (81x81)."""
import subprocess
import os

# Material Icons style - outline for inactive, filled for active
ICONS = {
    # Home: house outline vs filled
    "home": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
  <path d="M9 22V12h6v10"/>
</svg>""",
    "home-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="none">
  <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
  <path d="M9 22V12h6v10" fill="#FFFFFF"/>
</svg>""",
    # Library/Grid: grid outline vs filled
    "library": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="7" height="7" x="3" y="3" rx="1"/>
  <rect width="7" height="7" x="14" y="3" rx="1"/>
  <rect width="7" height="7" x="14" y="14" rx="1"/>
  <rect width="7" height="7" x="3" y="14" rx="1"/>
</svg>""",
    "library-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="none">
  <rect width="7" height="7" x="3" y="3" rx="1"/>
  <rect width="7" height="7" x="14" y="3" rx="1"/>
  <rect width="7" height="7" x="14" y="14" rx="1"/>
  <rect width="7" height="7" x="3" y="14" rx="1"/>
</svg>""",
    # Search: magnifying glass outline vs filled
    "search": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.3-4.3"/>
</svg>""",
    "search-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="none">
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.3-4.3" stroke="#FFFFFF" stroke-width="2"/>
</svg>""",
    # Profile/Person: person outline vs filled
    "profile": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="8" r="5"/>
  <path d="M20 21a8 8 0 0 0-16 0"/>
</svg>""",
    "profile-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="none">
  <circle cx="12" cy="8" r="5"/>
  <path d="M20 21a8 8 0 0 0-16 0"/>
</svg>""",
}

OUTPUT_DIR = "src/assets/icons"

def svg_to_png(svg_content, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    svg_path = os.path.join(OUTPUT_DIR, filename.replace('.png', '.svg'))
    with open(svg_path, "w") as f:
        f.write(svg_content)
    cmd = [
        "magick",
        "-background", "none",
        "-density", "300",
        svg_path,
        "-resize", "81x81",
        filepath
    ]
    subprocess.run(cmd, check=True)
    os.remove(svg_path)
    print(f"Created {filepath}")

for name, svg in ICONS.items():
    svg_to_png(svg, f"{name}.png")

print("All icons generated!")
