import requests
import random
import json
import os

# Folder containing the images
image_folder = "/Users/j/Desktop/BlenderBender/Minds/MTV/Ai_Hal_Lucy_Nation/Ai_50_1024x576"  # Replace with the path to your folder with images

# Get a list of all image files in the folder
image_files = [f for f in os.listdir(image_folder) if os.path.isfile(os.path.join(image_folder, f)) and f.lower().endswith(('.png', '.jpg', '.jpeg'))]

# Open a file to save the generation IDs
with open("./generation_ids.json", "w") as file:
    generation_data = []

    # Loop through each image and send a request
    for i, image_file in enumerate(image_files):
        if i >= 10 and i < 20:  # Limit to 10 requests (modify as needed)
            # Generate a random motion bucket ID between 80 and 180
            motion_bucket_id = random.randint(80, 90)
            # Set the seed to the current iteration value
            seed = 8
            
            # Path to the current image file
            image_path = os.path.join(image_folder, image_file)
            
            # Make the request with the updated seed and motion bucket ID
            response = requests.post(
                "https://api.stability.ai/v2beta/image-to-video",
                headers={
                    "authorization": f"Bearer sk-HgC9n4y8lPQb3QhhLSJHDPJvkeU5O49ixTdJKquOvLzS48wf"  # Replace with your actual API key
                },
                files={
                    "image": open(image_path, "rb")
                },
                data={
                    "seed": seed,
                    "cfg_scale": 1.7,
                    "motion_bucket_id": motion_bucket_id
                },
            )

            # Print the response for debugging
            print(response.json())

            # Get the generation ID from the response
            generation_id = response.json().get('id')
            
            # Store generation data
            generation_data.append({
                "generation_id": generation_id,
                "seed": seed,
                "motion_bucket_id": motion_bucket_id,
                "image_file": image_file
            })
            
            print(f"Iteration {i+1} - Generation ID:", generation_id)
            print(f"Image: {image_file}, Seed: {seed}, Motion Bucket ID: {motion_bucket_id}")
    
    # Write the generation data to the file
    json.dump(generation_data, file, indent=4)

print("All generation IDs saved to generation_ids.json")