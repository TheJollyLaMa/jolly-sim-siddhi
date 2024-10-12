import os
from PIL import Image

# Folder containing the images
image_folder = "/Users/j/DevTree/jolly-sim-siddhi/vishnu"  # Replace with the path to your folder with images
output_folder = "/Users/j/DevTree/jolly-sim-siddhi/vishnu"  # Folder to save resized images

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

# Target size for resizing (change according to API requirements)
target_size = (1024, 576)  # Resize to 1024x576 or any other required size (e.g., 576x1024 or 768x768)

# Get a list of all image files in the folder
image_files = [f for f in os.listdir(image_folder) if os.path.isfile(os.path.join(image_folder, f)) and f.lower().endswith(('.png', '.jpg', '.jpeg'))]

# Loop through each image and resize it
for image_file in image_files:
    try:
        # Open the image file
        img_path = os.path.join(image_folder, image_file)
        with Image.open(img_path) as img:
            # Resize the image using high-quality resampling
            resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # Save the resized image to the output folder
            output_path = os.path.join(output_folder, image_file)
            resized_img.save(output_path)
            
            print(f"Resized {image_file} to {target_size} and saved to {output_folder}")
    
    except Exception as e:
        print(f"Error resizing {image_file}: {e}")

print("All images resized successfully.")