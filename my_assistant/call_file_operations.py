import requests

def call_file_operations(file_path, operation, content=None):
    url = "http://0.0.0.0:8000/access_local_files"
    payload = {
        "file_path": file_path,
        "operation": operation,
        "content": content
    }
    response = requests.post(url, json=payload)
    return response.json()

# Example usage:
if __name__ == "__main__":
    result = call_file_operations("C:\\projects\\otoh\\otoh\\somefile.txt", "read")
    print(result)
