import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for the backend API
BASE_URL = "http://localhost:5000"

class TutorAPIClient:
    """Client for interacting with the Tutor AI backend API"""
    
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session_id = None
        self.user_id = None
    
    def create_user(self, name, education_level):
        """Create a new user profile"""
        response = requests.post(
            f"{self.base_url}/api/user",
            json={
                "name": name,
                "education_level": education_level
            }
        )
        if response.status_code == 200:
            data = response.json()
            self.user_id = data.get("user_id")
            return data
        return {"error": "Failed to create user", "status_code": response.status_code}
    
    def get_user(self, user_id=None):
        """Get user profile and progress"""
        user_id = user_id or self.user_id
        if not user_id:
            return {"error": "No user ID provided"}
        
        response = requests.get(f"{self.base_url}/api/user/{user_id}")
        if response.status_code == 200:
            return response.json()
        return {"error": "Failed to get user", "status_code": response.status_code}
    
    def get_subjects(self):
        """Get list of available subjects"""
        response = requests.get(f"{self.base_url}/api/subjects")
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_topics(self, subject):
        """Get topics for a specific subject"""
        response = requests.get(f"{self.base_url}/api/subjects/{subject}/topics")
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_content(self, subject, topic, level="beginner"):
        """Get educational content for a subject and topic"""
        response = requests.get(
            f"{self.base_url}/api/content/{subject}/{topic}",
            params={"level": level}
        )
        if response.status_code == 200:
            return response.json()
        return {"error": "Content not found"}
    
    def send_message(self, message, subject, topic=""):
        """Send a message to the AI tutor and get a response"""
        if not self.session_id:
            # Create a new session if one doesn't exist
            self.session_id = f"session_{os.urandom(4).hex()}"
        
        response = requests.post(
            f"{self.base_url}/api/chat/message",
            json={
                "user_id": self.user_id or "anonymous",
                "message": message,
                "subject": subject,
                "topic": topic,
                "session_id": self.session_id
            }
        )
        
        if response.status_code == 200:
            return response.json()
        return {"error": "Failed to get response", "response": "I'm having trouble processing your request right now."}
    
    def get_chat_history(self):
        """Get the history of the current chat session"""
        if not self.session_id:
            return {"error": "No active session"}
        
        response = requests.get(f"{self.base_url}/api/chat/{self.session_id}/history")
        if response.status_code == 200:
            return response.json()
        return {"error": "Failed to get chat history"}
    
    def get_progress(self):
        """Get the user's learning progress"""
        if not self.user_id:
            return {"error": "No user ID provided"}
        
        response = requests.get(f"{self.base_url}/api/progress/{self.user_id}")
        if response.status_code == 200:
            return response.json()
        return {"error": "Failed to get progress"}

# Create a singleton instance for use throughout the app
api_client = TutorAPIClient()
