import os
import json
from google.cloud import storage
from google.cloud import aiplatform

PROJECT_ID = "project-36330a6c-5e91-4901-9dd"
LOCATION = "us-central1"

def initialize_vertex_ai():
    print(f"Initializing Vertex AI SDK context for {PROJECT_ID}...")
    aiplatform.init(project=PROJECT_ID, location=LOCATION)

def download_and_process_workflows():
    # Grab the bucket name from the environment variables defined in config.yaml
    bucket_name = os.environ.get("BUCKET_NAME")
    if not bucket_name:
        print("Error: BUCKET_NAME environment variable is not defined.")
        return

    print(f"Connecting to Cloud Storage Bucket: {bucket_name}")
    storage_client = storage.Client(project=PROJECT_ID)
    
    try:
        bucket = storage_client.bucket(bucket_name)
        # Scan the root level of your bucket for any JSON configurations
        blobs = bucket.list_blobs()
        
        json_blobs = [b for b in blobs if b.name.endswith('.json')]
        
        if not json_blobs:
            print("No workflow definition files (.json) discovered in the bucket root.")
            return

        print(f"Identified {len(json_blobs)} JSON definition file(s). Downloading...")
        
        for blob in json_blobs:
            print(f"Downloading processing schema: {blob.name}")
            # Pull the data directly into memory to read it instantly
            file_contents = blob.download_as_text()
            
            try:
                workflow_data = json.loads(file_contents)
                execute_ai_steps(workflow_data)
            except json.JSONDecodeError:
                print(f"Skipping file {blob.name}: Content is not valid JSON format.")
                
    except Exception as e:
        print(f"Failed to access or download files from bucket storage system: {str(e)}")

def execute_ai_steps(workflow_data):
    workflow_name = workflow_data.get("name", "Unnamed Workflow Agent")
    model_name = workflow_data.get("model", "gemini-1.5-flash")
    prompt = workflow_data.get("prompt", "")
    
    print(f"\n==========================================")
    print(f"Running Agent Task: {workflow_name}")
    print(f"Target Infrastructure Model: {model_name}")
    print(f"==========================================")
    
    if not prompt:
        print("Workflow execution skipped: Empty or missing 'prompt' value.")
        return

    try:
        from vertexai.generative_models import GenerativeModel
        print("Invoking Vertex AI Foundation Model API layers...")
        
        model = GenerativeModel(model_name)
        response = model.generate_content(prompt)
        
        print("\n--- Model Response Output ---")
        print(response.text)
        print("-----------------------------\n")
        
    except Exception as e:
        print(f"Runtime execution failure processing AI steps: {str(e)}")

if __name__ == "__main__":
    print("AgentLab Custom Container Engine Initiated.")
    initialize_vertex_ai()
    download_and_process_workflows()
    print("Pipeline sequence complete.")
