import os
from PIL import Image

def optimize_image(file_path):
    try:
        with Image.open(file_path) as img:
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if too large
            w, h = img.size
            if max(w, h) > 800:
                scale = 800 / max(w, h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
            img.save(file_path, 'PNG', optimize=True)
            print(f"Successfully optimized {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

optimize_image(r"e:\GyanodayaPR\GYANODAYA\src\Assets\Images\Logo.png")
