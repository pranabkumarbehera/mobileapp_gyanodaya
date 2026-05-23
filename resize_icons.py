import os
from PIL import Image

def scale_image(file_path, scale_factor=1.3):
    try:
        with Image.open(file_path) as img:
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            w, h = img.size
            new_w = int(w * scale_factor)
            new_h = int(h * scale_factor)
            
            # Resize
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Crop center back to original size
            left = (new_w - w) // 2
            top = (new_h - h) // 2
            right = left + w
            bottom = top + h
            
            final_img = resized.crop((left, top, right, bottom))
            final_img.save(file_path, 'PNG')
            print(f"Successfully scaled {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

res_dir = os.path.join("android", "app", "src", "main", "res")
target_files = [
    "ic_launcher.png", 
    "ic_launcher_round.png", 
    "ic_launcher_foreground.png", 
    "ic_launcher_adaptive_fore.png"
]

for root, dirs, files in os.walk(res_dir):
    for file in files:
        if file in target_files:
            full_path = os.path.join(root, file)
            scale_image(full_path, 1.25) # Scale up by 25%

print("Finished scaling icons.")
