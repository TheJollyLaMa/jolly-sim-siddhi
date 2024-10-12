generation_id="61477b9aba4dc49f4151a617c583e16a5deca0912214dff05de1f3e896b28d57"
url="https://api.stability.ai/v2beta/image-to-video/result/$generation_id"
http_status=$(curl -sS -f -o "./output.mp4" -w '%{http_code}' \
  -H "authorization: Bearer sk-HgC9n4y8lPQb3QhhLSJHDPJvkeU5O49ixTdJKquOvLzS48wf" \
  -H 'accept: video/*' \
  "$url")

case $http_status in
    202)
        echo "Still processing. Retrying in 10 seconds..."
        ;;
    200)
        echo "Download complete!"
        ;;
    4*|5*)
        mv "./output.mp4" "./error.json"
        echo "Error: Check ./error.json for details."
        exit 1
        ;;
esac