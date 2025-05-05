# Tutor AI - Cohere-Powered Learning Assistant

This application provides an AI-driven tutoring experience using Streamlit for the frontend UI and a Flask backend powered by Cohere's language AI capabilities.

## Project Structure

- `app.py` - Streamlit frontend application
- `backend.py` - Flask backend server with Cohere API integration
- `api_client.py` - Client library to connect frontend and backend
- `.env` - Environment variables (API keys)
- `requirements.txt` - Project dependencies

## Setup Instructions

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Ensure your Cohere API key is in the `.env` file:
   ```
   COHERE_API_KEY=your_api_key_here
   ```

3. Run the application:
   ```
   streamlit run app.py
   ```
   
   The application will automatically start the Flask backend server if it's not already running.

## Features

- **Interactive Chat Interface**: Ask questions about various subjects and get AI-powered responses
- **Subject & Topic Selection**: Choose specific areas to focus your learning
- **Whiteboard Tool**: Visual drawing area for explanations
- **Equation Editor**: Write and render LaTeX equations
- **Progress Tracking**: Monitor your learning journey across subjects
- **Learning Resources**: Access recommended materials and exercises

## Backend API

The backend provides several API endpoints:

- **User Management**: Create and retrieve user profiles
- **Content Access**: Get subjects, topics, and educational content
- **Chat Processing**: Send messages to the AI tutor and receive responses
- **Progress Tracking**: Monitor learning progress across subjects

## Technology Stack

- **Frontend**: Streamlit, Streamlit-Chat, Streamlit-Drawable-Canvas
- **Backend**: Flask, Cohere API
- **Data Storage**: In-memory (JSON) for the MVP version
- **API Integration**: Python Requests

## Development Notes

This MVP uses in-memory storage for simplicity. In a production environment, you would want to:

1. Use a proper database (PostgreSQL, MongoDB, etc.)
2. Implement authentication and user management
3. Add comprehensive error handling
4. Expand the educational content library
5. Implement more sophisticated learning analytics

## Security Notes

- Never commit your `.env` file with API keys to version control
- For production, implement proper authentication and authorization
- Consider rate limiting to manage API usage costs
