import requests
import json
import time

# Load the generation IDs from the file
with open("./generation_ids.json", "r") as file:
    generation_data = json.load(file)

# Define a function to fetch and save the generated video
def fetch_generation(generation_id, retry_interval=10):
    while True:
        response = requests.get(
            f"https://api.stability.ai/v2beta/image-to-video/result/{generation_id}",
            headers={
                'accept': "video/*",  # Use 'application/json' to receive base64 encoded JSON if needed
                'authorization': f"Bearer sk-HgC9n4y8lPQb3QhhLSJHDPJvkeU5O49ixTdJKquOvLzS48wf"  # Replace with your actual API key
            }
        )

        if response.status_code == 202:
            print(f"Generation in-progress for ID {generation_id}, retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)  # Wait before trying again
        elif response.status_code == 200:
            print(f"Generation complete for ID {generation_id}!")
            video_filename = f"/Users/j/Desktop/BlenderBender/Minds/MTV/Ai_Hal_Lucy_Nation/Ai_50_1024x576/video/{generation_id}.mp4"
            with open(video_filename, 'wb') as file:
                file.write(response.content)
            print(f"Video saved as {video_filename}")
            break
        else:
            raise Exception(f"Failed to fetch generation {generation_id}: {response.json()}")

# Loop through each generation ID and fetch the corresponding video
for generation in generation_data:
    generation_id = generation["generation_id"]
    fetch_generation(generation_id)

print("All videos have been fetched and saved.")