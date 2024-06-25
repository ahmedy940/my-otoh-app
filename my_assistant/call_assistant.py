import os
import openai
from dotenv import load_dotenv

# Load environment variables from .env file in the parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Load the API key from the environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("API key not found. Please set the OPENAI_API_KEY environment variable.")

# Initialize the OpenAI client
openai.api_key = api_key

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

# Example usage
if __name__ == "__main__":
    result = call_assistant("C:\\projects\\otoh\\otoh\\somefile.txt", "read")
    print(result)
