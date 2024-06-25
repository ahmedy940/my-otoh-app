import os

def access_local_files(file_path, operation, content=None):
    if operation == "read":
        with open(file_path, 'r') as file:
            return file.read()
    elif operation == "write":
        with open(file_path, 'w') as file:
            file.write(content)
            return "File written successfully"
    elif operation == "edit":
        with open(file_path, 'a') as file:
            file.write(content)
            return "File edited successfully"
    else:
        return "Invalid operation"
