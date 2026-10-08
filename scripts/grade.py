"""Apply Kaa's firelight grade to a folder of photos.

usage:  python scripts/grade.py <input-folder> <output-folder>
needs:  pip install Pillow

Night photography lit by fire: blacks settle into warm soot (never pure black,
never grey), midtones get a firm S-curve, highlights turn amber-cream, and
saturation is eased back a touch so mixed stock reads as one shoot.
Caps width at 2200px.
"""
import os
import sys

from PIL import Image, ImageEnhance

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)


def lut(lo, hi, warm_sh, warm_hl, contrast=0.55):
    out = []
    for i in range(256):
        t = i / 255.0
        s = t * t * (3 - 2 * t)
        t = contrast * s + (1 - contrast) * t
        v = lo + t * (hi - lo) + warm_sh * (1 - t) ** 3 * t * 4 + warm_hl * t ** 2
        out.append(max(0, min(255, int(round(v)))))
    return out


# soot blacks (15,12,10) -> amber-cream whites (250,238,220)
R = lut(15, 246, 6, 4)
G = lut(12, 236, 1, 2)
B = lut(10, 222, -4, -2)


def grade(img):
    img = ImageEnhance.Color(img).enhance(0.86)
    r, g, b = img.split()
    return Image.merge("RGB", (r.point(R), g.point(G), b.point(B)))


for f in sorted(os.listdir(src)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    im = Image.open(os.path.join(src, f)).convert("RGB")
    if im.width > 2200:
        im = im.resize((2200, round(im.height * 2200 / im.width)), Image.LANCZOS)
    out = os.path.splitext(f)[0] + ".jpg"
    grade(im).save(os.path.join(dst, out), "JPEG", quality=80, optimize=True, progressive=True)
