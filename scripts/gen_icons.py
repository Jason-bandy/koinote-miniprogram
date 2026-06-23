#!/usr/bin/env python3
"""Generate tab bar icons for WeChat mini program (81x81 outline style)."""
import subprocess
import os

ICONS = {
    "home": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="3 10 12 3 21 10 21 20 17 20 17 14 7 14 7 20 3 20"/>
</svg>""",
    "home-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="3 10 12 3 21 10 21 20 17 20 17 14 7 14 7 20 3 20"/>
</svg>""",
    "library": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="4" height="16"/>
  <rect x="10" y="4" width="4" height="16"/>
  <rect x="17" y="4" width="4" height="16"/>
</svg>""",
    "library-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="4" height="16"/>
  <rect x="10" y="4" width="4" height="16"/>
  <rect x="17" y="4" width="4" height="16"/>
</svg>""",
    "search": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="7"/>
  <line x1="16" y1="16" x2="21" y2="21"/>
</svg>""",
    "search-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="7"/>
  <line x1="16" y1="16" x2="21" y2="21"/>
</svg>""",
    "profile": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
</svg>""",
    "profile-active": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F172A" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
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
