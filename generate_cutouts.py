from PIL import Image, ImageDraw
import os

out_dir = r"d:\SIH\assets"
os.makedirs(out_dir, exist_ok=True)

def create_badge(filename, bg_color, border_color, draw_func):
    size = (512, 512)
    img = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    margin = 32
    draw.rounded_rectangle([margin, margin, size[0]-margin, size[1]-margin], radius=110, fill=bg_color, outline=border_color, width=12)
    draw.rounded_rectangle([margin+20, margin+20, size[0]-margin-20, size[1]-margin-20], radius=90, outline=(255, 255, 255, 120), width=4)
    
    draw_func(draw, size)
    
    out_path = os.path.join(out_dir, filename)
    img.save(out_path, 'PNG')
    print(f"Created {filename}")

# 1. gap_warning_cutout (Amber warning / disconnected legacy system)
def draw_warning(d, s):
    top = (256, 120)
    left = (140, 360)
    right = (372, 360)
    d.polygon([top, left, right], fill=(217, 119, 6, 230), outline=(255, 255, 255, 255))
    d.rounded_rectangle([244, 180, 268, 290], radius=10, fill=(255, 255, 255, 255))
    d.ellipse([244, 310, 268, 334], fill=(255, 255, 255, 255))

create_badge('gap_warning_cutout.png', (254, 243, 199, 240), (217, 119, 6, 255), draw_warning)

# 2. sat_radar_cutout (Satellite & radar dish)
def draw_sat(d, s):
    d.rectangle([216, 216, 296, 296], fill=(2, 132, 199, 255), outline=(255, 255, 255, 255), width=6)
    d.rectangle([110, 236, 200, 276], fill=(14, 165, 233, 240), outline=(255, 255, 255, 255), width=4)
    d.rectangle([312, 236, 402, 276], fill=(14, 165, 233, 240), outline=(255, 255, 255, 255), width=4)
    d.line([(155, 236), (155, 276)], fill=(255, 255, 255, 220), width=3)
    d.line([(357, 236), (357, 276)], fill=(255, 255, 255, 220), width=3)
    d.arc([196, 120, 316, 240], start=30, end=150, fill=(2, 132, 199, 255), width=8)
    d.arc([176, 100, 336, 260], start=40, end=140, fill=(14, 165, 233, 220), width=6)
    d.arc([156, 80, 356, 280], start=50, end=130, fill=(56, 189, 248, 180), width=4)
    d.line([(256, 180), (256, 216)], fill=(255, 255, 255, 255), width=6)
    d.arc([186, 320, 326, 410], start=210, end=330, fill=(2, 132, 199, 240), width=8)

create_badge('sat_radar_cutout.png', (224, 242, 254, 240), (2, 132, 199, 255), draw_sat)

# 3. terrain_mesh_cutout (Mountain slope contour / 3D DEM)
def draw_terrain(d, s):
    d.polygon([(140, 370), (220, 200), (300, 370)], fill=(2, 132, 199, 200), outline=(255, 255, 255, 255), width=6)
    d.polygon([(250, 370), (340, 160), (410, 370)], fill=(14, 165, 233, 220), outline=(255, 255, 255, 255), width=6)
    for y in [260, 295, 330, 365]:
        d.arc([110, y-40, 410, y+40], start=15, end=165, fill=(255, 255, 255, 220), width=5)

create_badge('terrain_mesh_cutout.png', (240, 249, 255, 240), (2, 132, 199, 255), draw_terrain)

# 4. ai_brain_cutout (AI chip / neural network)
def draw_ai(d, s):
    d.rounded_rectangle([170, 170, 342, 342], radius=32, fill=(5, 150, 105, 240), outline=(255, 255, 255, 255), width=8)
    d.rounded_rectangle([210, 210, 302, 302], radius=16, fill=(16, 185, 129, 255))
    for p in [200, 256, 312]:
        d.line([(p, 120), (p, 170)], fill=(5, 150, 105, 255), width=8)
        d.line([(p, 342), (p, 392)], fill=(5, 150, 105, 255), width=8)
        d.line([(120, p), (170, p)], fill=(5, 150, 105, 255), width=8)
        d.line([(342, p), (392, p)], fill=(5, 150, 105, 255), width=8)
    d.ellipse([240, 240, 272, 272], fill=(255, 255, 255, 255))

create_badge('ai_brain_cutout.png', (236, 253, 245, 240), (5, 150, 105, 255), draw_ai)

# 5. simulation_slider_cutout (Slider / factor breakdown)
def draw_slider(d, s):
    d.rounded_rectangle([130, 180, 382, 210], radius=15, fill=(254, 215, 170, 255))
    d.rounded_rectangle([130, 180, 300, 210], radius=15, fill=(217, 119, 6, 255))
    d.ellipse([285, 165, 330, 225], fill=(255, 255, 255, 255), outline=(217, 119, 6, 255), width=8)
    d.rounded_rectangle([130, 290, 382, 320], radius=15, fill=(254, 215, 170, 255))
    d.rounded_rectangle([130, 290, 230, 320], radius=15, fill=(217, 119, 6, 255))
    d.ellipse([215, 275, 260, 335], fill=(255, 255, 255, 255), outline=(217, 119, 6, 255), width=8)

create_badge('simulation_slider_cutout.png', (255, 247, 237, 240), (217, 119, 6, 255), draw_slider)

# 6. rescue_alert_cutout (Emergency Siren / Rescue Broadcast)
def draw_rescue(d, s):
    d.rounded_rectangle([190, 260, 322, 350], radius=20, fill=(220, 38, 38, 255), outline=(255, 255, 255, 255), width=6)
    d.pieslice([190, 160, 322, 290], start=180, end=360, fill=(239, 68, 68, 255), outline=(255, 255, 255, 255), width=6)
    rays = [(-50, -40), (0, -60), (50, -40), (-65, 0), (65, 0)]
    for rx, ry in rays:
        cx, cy = 256 + rx, 200 + ry
        d.line([(256 + rx*0.6, 200 + ry*0.6), (cx, cy)], fill=(220, 38, 38, 255), width=8)

create_badge('rescue_alert_cutout.png', (254, 242, 242, 240), (220, 38, 38, 255), draw_rescue)

# 7. tech_device_cutout (Tablet / Smartphone offline map)
def draw_device(d, s):
    d.rounded_rectangle([150, 130, 362, 382], radius=28, fill=(2, 132, 199, 255), outline=(255, 255, 255, 255), width=6)
    d.rounded_rectangle([168, 150, 344, 340], radius=16, fill=(255, 255, 255, 255))
    d.line([(180, 200), (330, 230)], fill=(2, 132, 199, 200), width=6)
    d.line([(210, 160), (280, 320)], fill=(5, 150, 105, 220), width=6)
    d.ellipse([270, 220, 294, 244], fill=(220, 38, 38, 255))
    d.ellipse([246, 350, 266, 370], fill=(255, 255, 255, 200))

create_badge('tech_device_cutout.png', (224, 242, 254, 240), (2, 132, 199, 255), draw_device)

# 8. operational_ndma_cutout (Operational NDMA shield)
def draw_ndma(d, s):
    d.polygon([(256, 120), (370, 170), (340, 330), (256, 390), (172, 330), (142, 170)], fill=(5, 150, 105, 240), outline=(255, 255, 255, 255), width=8)
    d.line([(200, 256), (240, 296)], fill=(255, 255, 255, 255), width=16)
    d.line([(240, 296), (320, 200)], fill=(255, 255, 255, 255), width=16)

create_badge('operational_ndma_cutout.png', (236, 253, 245, 240), (5, 150, 105, 255), draw_ndma)

# 9. financial_roi_cutout (Financial ROI / Rupee savings)
def draw_roi(d, s):
    d.ellipse([140, 140, 372, 372], fill=(217, 119, 6, 240), outline=(255, 255, 255, 255), width=8)
    d.line([(200, 200), (312, 200)], fill=(255, 255, 255, 255), width=14)
    d.line([(200, 230), (280, 230)], fill=(255, 255, 255, 255), width=14)
    d.arc([190, 200, 270, 280], start=270, end=90, fill=(255, 255, 255, 255), width=14)
    d.line([(220, 270), (290, 340)], fill=(255, 255, 255, 255), width=14)
    d.line([(220, 200), (220, 270)], fill=(255, 255, 255, 255), width=14)

create_badge('financial_roi_cutout.png', (255, 247, 237, 240), (217, 119, 6, 255), draw_roi)

# 10. scale_network_cutout (Pan-India mountain network)
def draw_scale(d, s):
    nodes = [(256, 150), (160, 260), (352, 260), (200, 360), (312, 360)]
    for n1 in nodes:
        for n2 in nodes:
            if n1 != n2:
                d.line([n1, n2], fill=(239, 68, 68, 120), width=4)
    for nx, ny in nodes:
        d.ellipse([nx-26, ny-26, nx+26, ny+26], fill=(220, 38, 38, 255), outline=(255, 255, 255, 255), width=6)

create_badge('scale_network_cutout.png', (254, 242, 242, 240), (220, 38, 38, 255), draw_scale)

# 11. innovation_lightbulb_cutout
def draw_bulb(d, s):
    d.ellipse([180, 130, 332, 282], fill=(2, 132, 199, 255), outline=(255, 255, 255, 255), width=6)
    d.rectangle([216, 260, 296, 330], fill=(2, 132, 199, 255))
    d.rounded_rectangle([216, 330, 296, 360], radius=8, fill=(100, 116, 139, 255))
    d.line([(256, 170), (256, 240)], fill=(255, 255, 255, 255), width=8)
    d.line([(230, 205), (282, 205)], fill=(255, 255, 255, 255), width=8)

create_badge('innovation_lightbulb_cutout.png', (224, 242, 254, 240), (2, 132, 199, 255), draw_bulb)

# 12. impact_safety_cutout
def draw_impact(d, s):
    d.ellipse([140, 140, 372, 372], fill=(5, 150, 105, 240), outline=(255, 255, 255, 255), width=8)
    d.line([(190, 320), (320, 190)], fill=(255, 255, 255, 255), width=18)
    d.line([(240, 190), (320, 190)], fill=(255, 255, 255, 255), width=18)
    d.line([(320, 190), (320, 270)], fill=(255, 255, 255, 255), width=18)

create_badge('impact_safety_cutout.png', (236, 253, 245, 240), (5, 150, 105, 255), draw_impact)

# 13. sources_badge_cutout (Official sources emblem)
def draw_sources(d, s):
    d.ellipse([150, 150, 362, 362], fill=(2, 132, 199, 240), outline=(255, 255, 255, 255), width=8)
    d.arc([170, 170, 342, 342], start=0, end=360, fill=(255, 255, 255, 200), width=6)
    d.ellipse([216, 170, 296, 342], outline=(255, 255, 255, 200), width=5)
    d.line([(150, 256), (362, 256)], fill=(255, 255, 255, 200), width=5)

create_badge('sources_badge_cutout.png', (224, 242, 254, 240), (2, 132, 199, 255), draw_sources)

# 14. research_journal_cutout
def draw_journal(d, s):
    d.polygon([(140, 200), (256, 220), (372, 200), (372, 340), (256, 360), (140, 340)], fill=(217, 119, 6, 240), outline=(255, 255, 255, 255), width=8)
    d.line([(256, 220), (256, 360)], fill=(255, 255, 255, 255), width=6)
    for ly in [250, 280, 310]:
        d.line([(170, ly), (235, ly+5)], fill=(255, 255, 255, 200), width=4)
        d.line([(275, ly+5), (340, ly)], fill=(255, 255, 255, 200), width=4)

create_badge('research_journal_cutout.png', (255, 247, 237, 240), (217, 119, 6, 255), draw_journal)

# 15. accuracy_target_cutout
def draw_target(d, s):
    d.ellipse([140, 140, 372, 372], fill=(5, 150, 105, 240), outline=(255, 255, 255, 255), width=8)
    d.ellipse([180, 180, 332, 332], fill=(236, 253, 245, 255), outline=(5, 150, 105, 255), width=6)
    d.ellipse([220, 220, 292, 292], fill=(5, 150, 105, 255))
    d.ellipse([244, 244, 268, 268], fill=(255, 255, 255, 255))

create_badge('accuracy_target_cutout.png', (236, 253, 245, 240), (5, 150, 105, 255), draw_target)
