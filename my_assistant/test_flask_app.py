import requests
import json

# Define the URL of the Flask endpoint
url = "http://127.0.0.1:5000/access_local_files"

# Define the payload
payload = {
    "file_path": "C:\\projects\\otoh\\otoh\\somefile.txt",
    "operation": "read"
}

# Convert payload to JSON format
payload_json = json.dumps(payload)

# Define the headers
headers = {
    "Content-Type": "application/json"
}

# Make the POST request
response = requests.post(url, data=payload_json, headers=headers)

# Print the response
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
