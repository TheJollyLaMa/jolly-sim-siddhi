#!/bin/bash

# Define the vector store ID
vector_store_id="vs_iOXCtOTR7eyVUhY8KHwUxGMK"
uploadFile="true"
createNewVectorStoreName="WOTS_Transcriptions_02"

# Temp file to store updated URLs
temp_file="video_urls_temp.txt"
progress_saved=false

# Function to handle cleanup and save progress when the script is interrupted
cleanup() {
    echo ""
    echo "Caught signal. Saving progress..."
    mv "$temp_file" video_urls.txt
    progress_saved=true
    echo "Progress saved. Exiting..."
    exit 0
}

# Trap SIGINT (Ctrl+C) and call the cleanup function
trap cleanup SIGINT

# Read the URLs from the file and loop through each
while IFS= read -r url; do
    # Skip URLs that have already been processed (contain "DONE")
    if [[ "$url" == *"DONE"* ]]; then
        echo "Skipping already processed URL: $url"
        echo "$url" >> "$temp_file"
        continue
    fi

    # Make the curl request
    response=$(curl -s -X POST http://localhost:3330/api/transcribeAndStore \
         -H "Content-Type: application/json" \
         -d "{\"url\": \"$url\"}")

    # print a waiting message with the URL
    echo "Waiting for transcription to complete for $url"

    # Check if the transcription was successful
    if [[ "$response" == *"Transcription completed"* ]]; then
        # Parse response for the episode name
        transcriptionFileName=$(echo "$response" | jq -r '.transcriptionFileName')  
        # Extract the episode title from the file name
        echo "Transcription succeeded for $url"
        echo "✅ $transcriptionFileName DONE $url" >> "$temp_file"
    else
        echo "Transcription failed for $url"
        echo "🚨 $url " >> "$temp_file"
    fi

    # Optional: Wait for a few seconds before processing the next URL
    sleep 2

done < video_urls.txt

# Save progress when all URLs have been processed
if [ "$progress_saved" = false ]; then
    echo "Saving final progress..."
    mv "$temp_file" video_urls.txt
    echo "All transcriptions completed."
fi