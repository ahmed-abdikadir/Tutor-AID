import os
import json
from flask import Flask, request, jsonify
from datetime import datetime
import cohere
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Initialize Cohere client - securely accessing the API key from environment
# DO NOT hardcode API keys in your code
cohere_api_key = os.getenv("COHERE_API_KEY")
co = cohere.Client(cohere_api_key)

# In-memory storage for MVP (would use a database in production)
users = {}
sessions = {}
content_library = {
    "Mathematics": {
        "Algebra": {
            "beginner": "Algebra is the study of mathematical symbols and the rules for manipulating these symbols. It is a unifying thread of almost all of mathematics.",
            "examples": ["Solving equations like 2x + 3 = 7", "Factoring expressions like x² - 4"],
            "practice": ["Solve for x: 3x - 5 = 10", "Simplify: (2x + 3)(x - 1)"]
        },
        "Calculus": {
            "beginner": "Calculus is the mathematical study of continuous change. The two major branches are differential calculus and integral calculus.",
            "examples": ["Finding the derivative of f(x) = x²", "Calculating the integral of g(x) = 2x"],
            "practice": ["Find the derivative of h(x) = 3x² + 2x - 1", "Evaluate ∫x·dx from 0 to 3"]
        }
    },
    "Physics": {
        "Mechanics": {
            "beginner": "Mechanics is the study of motion and the forces that cause motion.",
            "examples": ["A ball thrown upward with velocity 20 m/s", "A block sliding down an inclined plane"],
            "practice": ["Calculate the time it takes for an object to fall 100m", "Find the force needed to accelerate a 2kg mass at 3 m/s²"]
        }
    },
    "Computer Science": {
        "Algorithms": {
            "beginner": "Algorithms are step-by-step procedures for calculations or problem-solving operations.",
            "examples": ["Binary search algorithm", "Bubble sort implementation"],
            "practice": ["Write pseudocode for finding the maximum value in an array", "Trace the execution of a merge sort algorithm"]
        }
    }
}

# Routes for User Management
@app.route('/api/user', methods=['POST'])
def create_user():
    data = request.json
    user_id = data.get('user_id', str(len(users) + 1))
    users[user_id] = {
        'name': data.get('name', 'Student'),
        'education_level': data.get('education_level', 'Beginner'),
        'created_at': datetime.now().isoformat(),
        'progress': {},
        'session_count': 0
    }
    return jsonify({'user_id': user_id, 'status': 'created'})

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    if user_id in users:
        return jsonify(users[user_id])
    return jsonify({'error': 'User not found'}), 404

# Routes for Content
@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    return jsonify(list(content_library.keys()))

@app.route('/api/subjects/<subject>/topics', methods=['GET'])
def get_topics(subject):
    if subject in content_library:
        return jsonify(list(content_library[subject].keys()))
    return jsonify({'error': 'Subject not found'}), 404

@app.route('/api/content/<subject>/<topic>', methods=['GET'])
def get_content(subject, topic):
    level = request.args.get('level', 'beginner')
    if subject in content_library and topic in content_library[subject]:
        content = content_library[subject][topic]
        return jsonify({
            'subject': subject,
            'topic': topic,
            'content': content.get(level, content.get('beginner')),
            'examples': content.get('examples', []),
            'practice': content.get('practice', [])
        })
    return jsonify({'error': 'Content not found'}), 404

# Chat and AI Interaction
@app.route('/api/chat/message', methods=['POST'])
def process_message():
    data = request.json
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '')
    subject = data.get('subject', 'General')
    topic = data.get('topic', '')
    session_id = data.get('session_id', f"session_{len(sessions) + 1}")
    
    # Store the message in session history
    if session_id not in sessions:
        sessions[session_id] = {
            'user_id': user_id,
            'subject': subject,
            'topic': topic,
            'messages': [],
            'start_time': datetime.now().isoformat()
        }
    
    sessions[session_id]['messages'].append({
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat()
    })
    
    # Use Cohere to understand the question type
    try:
        classification = co.classify(
            model='embed-english-v3.0',
            inputs=[message],
            examples=[
                {"text": "Can you explain how to solve quadratic equations?", "label": "explanation"},
                {"text": "Give me an example of Newton's second law", "label": "example"},
                {"text": "I need a practice problem on linked lists", "label": "practice"},
                {"text": "What is the definition of a derivative?", "label": "definition"},
                {"text": "How do I calculate the area of a circle?", "label": "how-to"}
            ]
        )
        question_type = classification.classifications[0].prediction
    except Exception as e:
        # Fallback if Cohere API fails
        print(f"Cohere classification error: {e}")
        if "explain" in message.lower() or "what is" in message.lower():
            question_type = "explanation"
        elif "example" in message.lower():
            question_type = "example"
        elif "practice" in message.lower() or "problem" in message.lower():
            question_type = "practice"
        else:
            question_type = "explanation"
    
    # Generate response based on question type and context
    context = f"The student is learning about {subject}, specifically {topic}. "
    context += f"Their education level is {users.get(user_id, {}).get('education_level', 'Beginner')}. "
    context += f"They asked: '{message}'"
    
    try:
        # Use Cohere's generation capabilities
        response_prompt = f"""
        You are a helpful AI tutor specialized in {subject}.
        {context}
        
        The student is asking for a {question_type}.
        
        Please provide a clear, concise, and educational response that is appropriate for their level.
        """
        
        generation = co.generate(
            model='command',
            prompt=response_prompt,
            max_tokens=300,
            temperature=0.7,
        )
        ai_response = generation.generations[0].text.strip()
    except Exception as e:
        # Fallback responses if Cohere API fails
        print(f"Cohere generation error: {e}")
        fallback_responses = {
            "explanation": f"I'd be happy to explain about {topic} in {subject}. This is a fundamental concept where...",
            "example": f"Here's an example related to {topic}: Consider a scenario where...",
            "practice": f"Try solving this {topic} problem: [Sample problem related to the topic]",
            "definition": f"The definition of {topic} is: [Brief definition]",
            "how-to": f"To solve problems related to {topic}, follow these steps: 1. First... 2. Then..."
        }
        ai_response = fallback_responses.get(question_type, "I understand your question. Let me help you with that.")
    
    # Store AI response in session history
    sessions[session_id]['messages'].append({
        'role': 'ai',
        'content': ai_response,
        'timestamp': datetime.now().isoformat(),
        'question_type': question_type
    })
    
    # Update user progress
    if user_id in users:
        if subject not in users[user_id]['progress']:
            users[user_id]['progress'][subject] = {}
        if topic not in users[user_id]['progress'][subject]:
            users[user_id]['progress'][subject][topic] = {
                'interactions': 0,
                'last_interaction': None
            }
        
        users[user_id]['progress'][subject][topic]['interactions'] += 1
        users[user_id]['progress'][subject][topic]['last_interaction'] = datetime.now().isoformat()
    
    return jsonify({
        'response': ai_response,
        'session_id': session_id,
        'question_type': question_type
    })

@app.route('/api/chat/<session_id>/history', methods=['GET'])
def get_chat_history(session_id):
    if session_id in sessions:
        return jsonify(sessions[session_id])
    return jsonify({'error': 'Session not found'}), 404

# Progress Tracking
@app.route('/api/progress/<user_id>', methods=['GET'])
def get_progress(user_id):
    if user_id in users:
        # Calculate overall progress
        progress_data = users[user_id]['progress']
        subjects = progress_data.keys()
        
        subject_progress = {}
        total_interactions = 0
        topics_touched = 0
        
        for subject in subjects:
            topics = progress_data[subject].keys()
            subject_interactions = 0
            subject_topics = len(topics)
            topics_touched += subject_topics
            
            for topic in topics:
                topic_interactions = progress_data[subject][topic]['interactions']
                subject_interactions += topic_interactions
                total_interactions += topic_interactions
            
            # Simple progress calculation - can be more sophisticated
            progress_percentage = min(100, subject_interactions * 5)  # 5% per interaction, max 100%
            subject_progress[subject] = progress_percentage
        
        return jsonify({
            'user_id': user_id,
            'total_interactions': total_interactions,
            'topics_touched': topics_touched,
            'subject_progress': subject_progress,
            'overall_progress': min(100, total_interactions * 2)  # 2% per interaction, max 100%
        })
    
    return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
