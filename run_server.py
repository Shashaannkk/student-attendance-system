import uvicorn
import sys
import logging

# Configure logging to file
logging.basicConfig(filename='server_app.log', level=logging.INFO, format='%(asctime)s - %(message)s', force=True)

if __name__ == "__main__":
    try:
        logging.info("Starting server programmatically...")
        print("Starting server...", flush=True)
        # Verify imports first
        from main import app
        logging.info("App imported successfully.")
        
        # Start server
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        logging.error(f"Failed to start: {e}")
        print(f"Failed: {e}", flush=True)
