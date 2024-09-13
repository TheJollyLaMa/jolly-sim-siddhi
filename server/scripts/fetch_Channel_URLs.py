import youtube_dl

# Replace with the URL of the YouTube channel
channel_url = 'https://www.youtube.com/@WisdomoftheSages/videos'

# Define the output file
output_file = 'video_urls.txt'

# Define options for youtube_dl
ydl_opts = {
    'quiet': True,
    'extract_flat': True,
    'skip_download': True,
    'force_generic_extractor': True,
}

# Use youtube_dl to fetch video URLs
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    result = ydl.extract_info(channel_url, download=False)
    
    if 'entries' in result:
        video_urls = [entry['url'] for entry in result['entries'] if 'url' in entry]
        
        # Save the URLs to a file
        with open(output_file, 'w') as file:
            for url in video_urls:
                file.write(f"https://www.youtube.com/watch?v={url}\n")

print(f'URLs have been saved to {output_file}')