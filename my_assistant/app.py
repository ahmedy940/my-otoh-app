from flask import Flask, request, jsonify
import os
import openai
from dotenv import load_dotenv

# Load environment variables from .env file in the parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

app = Flask(__name__)

# Load the API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("API key not found. Please set the OPENAI_API_KEY environment variable.")

# Initialize the OpenAI client
openai.api_key = api_key

@app.route('/access_local_files', methods=['POST'])
def handle_file_operations():
    data = request.json
    file_path = data.get('file_path')
    operation = data.get('operation')
    content = data.get('content', None)

    result = call_assistant(file_path, operation, content)
    return jsonify(result=result)

def call_assistant(file_path, operation, content=None):
    assistant_id = "asst_p06r24CYIlUN2b1sXvSZGUgK"
    function_name = "access_local_files"

    # Prepare the parameters
    parameters = {
        "file_path": file_path,
        "operation": operation
    }

    if content is not None:
        parameters["content"] = content

    # Call the assistant function
    response = openai.Functions.call(
        assistant_id=assistant_id,
        function_name=function_name,
        parameters=parameters
    )

    return response

if __name__ == '__main__':
    # Change the host and port here
    app.run(debug=True, host='0.0.0.0', port=8000)
