import math

W, H = 512, 512
# Official Renner Green: #016836
bg_color = (1, 104, 54)
fg_color = (255, 255, 255)

# Coordinate scaling factor to 512x512 from 200x200
def sx(x): return x * (W / 200.0)
def sy(y): return y * (H / 200.0)

# Rasterizer: Point in Polygon test
def point_in_poly(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# Build smooth polygons
# 1. Top-Left
poly_tl = [(sx(22), sy(16)), (sx(88), sy(16)), (sx(88), sy(76)), (sx(22), sy(46))]

# 2. Middle-Left
poly_ml = [(sx(22), sy(60)), (sx(88), sy(90)), (sx(88), sy(134)), (sx(22), sy(104))]

# 3. Bottom-Left (with rounded corner)
poly_bl = []
# Top diagonal
poly_bl.append((sx(22), sy(118)))
poly_bl.append((sx(88), sy(148)))
poly_bl.append((sx(88), sy(184)))
poly_bl.append((sx(52), sy(184)))
# Rounded corner from (52, 184) to (22, 154)
for a in range(90, 181, 10):
    rad = math.radians(a)
    cx = sx(52) + sx(30) * math.cos(rad)
    cy = sy(154) - sy(30) * math.sin(rad)
    poly_bl.append((cx, cy))
poly_bl.append((sx(22), sy(154)))

# 4. Upper Bowl
poly_ub = []
poly_ub.append((sx(104), sy(16)))
poly_ub.append((sx(144), sy(16)))
# Curve around top-right
for a in range(90, -30, -10):
    rad = math.radians(a)
    cx = sx(144) + sx(38) * math.cos(rad)
    cy = sy(52) - sy(36) * math.sin(rad)
    poly_ub.append((cx, cy))
poly_ub.append((sx(104), sy(76)))

# 5. Lower Bowl
poly_lb = []
poly_lb.append((sx(104), sy(90)))
# Upper cut edge
poly_lb.append((sx(162), sy(68)))
for a in range(20, -70, -15):
    rad = math.radians(a)
    cx = sx(146) + sx(28) * math.cos(rad)
    cy = sy(96) - sy(20) * math.sin(rad)
    poly_lb.append((cx, cy))
poly_lb.append((sx(104), sy(134)))

# 6. Leg
poly_leg = [
    (sx(104), sy(148)),
    (sx(148), sy(127)),
    (sx(182), sy(184)),
    (sx(138), sy(184))
]

polys = [poly_tl, poly_ml, poly_bl, poly_ub, poly_lb, poly_leg]

# Render image with 2x supersampling antialiasing
pixels = bytearray(W * H * 3)

for y in range(H):
    for x in range(W):
        # 2x2 subpixel sampling
        hits = 0
        for sub_y in (y + 0.25, y + 0.75):
            for sub_x in (x + 0.25, x + 0.75):
                hit = False
                for p in polys:
                    if point_in_poly(sub_x, sub_y, p):
                        hit = True
                        break
                if hit:
                    hits += 1
        
        alpha = hits / 4.0
        r = int(bg_color[0] * (1 - alpha) + fg_color[0] * alpha)
        g = int(bg_color[1] * (1 - alpha) + fg_color[1] * alpha)
        b = int(bg_color[2] * (1 - alpha) + fg_color[2] * alpha)
        
        idx = (y * W + x) * 3
        pixels[idx] = r
        pixels[idx + 1] = g
        pixels[idx + 2] = b

ppm_header = f"P6\n{W} {H}\n255\n".encode('ascii')
with open('/tmp/renner_gen.ppm', 'wb') as f:
    f.write(ppm_header)
    f.write(pixels)

print("PPM generated successfully")
