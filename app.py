import streamlit as st
from streamlit_chat import message
from streamlit_drawable_canvas import st_canvas
import json
import time
from datetime import datetime
import os
import threading

# Import our API client to communicate with the backend
from api_client import api_client

# Check if the backend is running and start it if not
def ensure_backend_running():
    import subprocess
    import socket
    import time
    
    def is_port_in_use(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    # Check if the backend is already running
    if not is_port_in_use(5000):
        # Start the backend in a separate process
        subprocess.Popen(['python', 'backend.py'], 
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE)
        
        # Wait for backend to start
        max_attempts = 10
        attempts = 0
        while not is_port_in_use(5000) and attempts < max_attempts:
            time.sleep(1)
            attempts += 1

# Start backend in a separate thread to avoid blocking the Streamlit UI
backend_thread = threading.Thread(target=ensure_backend_running)
backend_thread.daemon = True
backend_thread.start()

# Page config
st.set_page_config(
    page_title="Tutor AI",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main .block-container {
        padding-top: 2rem;
        max-width: 1200px;
    }
    .stTextArea > div > div > textarea {
        min-height: 100px;
    }
    .stButton > button {
        width: 100%;
    }
    .progress-bar {
        height: 10px;
        background-color: #f0f2f6;
        border-radius: 5px;
        margin: 10px 0;
    }
    .progress {
        height: 100%;
        background-color: #00cc66;
        border-radius: 5px;
        transition: width 0.3s;
    }
    .tool-button {
        margin: 2px !important;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state variables
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'whiteboard_mode' not in st.session_state:
    st.session_state.whiteboard_mode = False
if 'show_equation_editor' not in st.session_state:
    st.session_state.show_equation_editor = False
if 'session_start' not in st.session_state:
    st.session_state.session_start = datetime.now()
    
# Initialize session timer
session_time = "00:00"
if 'session_start' in st.session_state:
    elapsed_time = datetime.now() - st.session_state.session_start
    minutes, seconds = divmod(elapsed_time.seconds, 60)
    session_time = f"{minutes:02d}:{seconds:02d}"

# Initialize API client and user session if needed
def initialize_session():
    # Check if user has been created
    if 'user_id' not in st.session_state:
        # Get user info from session state or default values
        name = st.session_state.get('student_name', 'New Student')
        education_level = st.session_state.get('education_level', 'Beginner')
        
        # Create user in backend
        try:
            user_data = api_client.create_user(name, education_level)
            if 'user_id' in user_data:
                st.session_state.user_id = user_data['user_id']
                st.session_state.user_created = True
        except Exception as e:
            st.error(f"Could not connect to backend service. Please make sure it's running. Error: {e}")

# Function to get AI response via the backend API
def get_ai_response(question, subject, topic=""):
    try:
        # Send the message to the backend
        response_data = api_client.send_message(
            message=question,
            subject=subject,
            topic=topic
        )
        
        # Extract the AI response from the returned data
        ai_response = response_data.get('response', "I'm having trouble processing your request right now.")
        return ai_response
    except Exception as e:
        # Fallback response if API call fails
        st.error(f"Could not get response from backend. Error: {e}")
        return "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later."

# Sidebar
with st.sidebar:
    st.title("🎓 Tutor AI")
    
    # Student Profile
    with st.expander("👤 Student Profile", expanded=True):
        st.text_input("Name", value="Alex Johnson", key="student_name")
        st.selectbox("Education Level", 
                    ["High School", "Undergraduate", "Graduate", "Professional"],
                    key="education_level")
    
    # Subject/Topic Selection
    with st.expander("📚 Subjects", expanded=True):
        subject = st.selectbox("Select Subject", 
                            ["Mathematics", "Physics", "Computer Science", "Chemistry", "Biology"])
        topic = st.text_input("Specific Topic", placeholder="e.g., Linear Algebra, Quantum Mechanics")
    
    # Learning Progress
    with st.expander("📊 Progress", expanded=True):
        # Use the pre-calculated session time
        # (already calculated above during initialization)
        st.caption(f"Session Time: {session_time}")
        
        st.caption("Course Completion")
        st.markdown("""
            <div class="progress-bar">
                <div class="progress" style="width: 65%;"></div>
            </div>
        """, unsafe_allow_html=True)
        st.caption("65% Complete")
        
    # Tools
    with st.expander("🛠️ Tools", expanded=True):
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📝 Whiteboard", key="whiteboard_toggle"):
                st.session_state.whiteboard_mode = not st.session_state.whiteboard_mode
        with col2:
            if st.button("∑ Equation", key="equation_toggle"):
                st.session_state.show_equation_editor = not st.session_state.show_equation_editor
        
        uploaded_file = st.file_uploader("Upload Materials", type=['pdf', 'docx', 'txt'])
        if uploaded_file is not None:
            st.success(f"Uploaded: {uploaded_file.name}")
        
    # Settings
    with st.expander("⚙️ Settings", expanded=False):
        st.toggle("Dark Mode", value=False, key="dark_mode")
        st.slider("Text Size", 12, 24, 16, key="text_size")
        st.toggle("Enable Sound", value=True, key="sound_enabled")

# Main Content Area
tab1, tab2, tab3 = st.tabs(["💬 Chat", "📊 Learning Analytics", "📚 Resources"])

with tab1:
    st.header(f"Learning Session: {subject}")
    
    # Whiteboard (if enabled)
    if st.session_state.whiteboard_mode:
        st.subheader("Interactive Whiteboard")
        canvas_result = st_canvas(
            fill_color="rgba(255, 165, 0, 0.3)",
            stroke_width=2,
            stroke_color="#000000",
            background_color="#ffffff",
            height=300,
            drawing_mode="freedraw",
            key="canvas",
        )
        st.divider()
    
    # Equation Editor (if enabled)
    if st.session_state.show_equation_editor:
        st.subheader("Equation Editor")
        col1, col2 = st.columns([3, 2])
        with col1:
            equation = st.text_area("Enter LaTeX equation:", height=100,
                                placeholder="E = mc^2")
        with col2:
            if equation:
                st.latex(equation)
        st.divider()
    
    # Chat Display
    chat_container = st.container()
    with chat_container:
        if not st.session_state.messages:
            st.info("👋 Hello! I'm your Tutor AI assistant. How can I help you with your learning today?")
        else:
            for i, msg in enumerate(st.session_state.messages):
                if msg["role"] == "ai":
                    message(msg["content"], is_user=False, key=f"ai_{i}")
                else:
                    message(msg["content"], is_user=True, key=f"user_{i}")
    
    # Chat Input
    st.divider()
    with st.form(key="chat_form", clear_on_submit=True):
        user_input = st.text_area("Ask your question:", key="input", height=100)
        
        col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
        with col1:
            submit = st.form_submit_button("Send Message", use_container_width=True)
        with col2:
            explain_more = st.form_submit_button("Explain More", use_container_width=True)
        with col3:
            give_example = st.form_submit_button("Give Example", use_container_width=True)
        with col4:
            practice = st.form_submit_button("Practice Problem", use_container_width=True)
    
    # Initialize the session on first load
    initialize_session()
    
    # Get the current selected subject and topic
    current_subject = subject  # From the sidebar selectbox
    current_topic = topic      # From the sidebar text input
    
    # Process input
    if submit and user_input:
        # Add user message to chat
        st.session_state.messages.append({"role": "user", "content": user_input})
        
        # Get AI response via backend with loading indicator
        with st.spinner("Thinking..."):
            ai_response = get_ai_response(
                question=user_input,
                subject=current_subject,
                topic=current_topic
            )
            st.session_state.messages.append({"role": "ai", "content": ai_response})
        
        # Force a rerun to show the new message
        st.rerun()
    
    # Quick action buttons
    if explain_more:
        query = "Can you explain this in more detail?"
        st.session_state.messages.append({"role": "user", "content": query})
        with st.spinner("Thinking..."):
            ai_response = get_ai_response(
                question=query,
                subject=current_subject,
                topic=current_topic
            )
            st.session_state.messages.append({"role": "ai", "content": ai_response})
        st.rerun()
        
    if give_example:
        query = "Can you give me an example?"
        st.session_state.messages.append({"role": "user", "content": query})
        with st.spinner("Thinking..."):
            ai_response = get_ai_response(
                question=query,
                subject=current_subject,
                topic=current_topic
            )
            st.session_state.messages.append({"role": "ai", "content": ai_response})
        st.rerun()
        
    if practice:
        query = "Give me a practice problem to solve."
        st.session_state.messages.append({"role": "user", "content": query})
        with st.spinner("Thinking..."):
            ai_response = get_ai_response(
                question=query,
                subject=current_subject,
                topic=current_topic
            )
            st.session_state.messages.append({"role": "ai", "content": ai_response})
        st.rerun()

with tab2:
    st.header("Learning Analytics")
    
    # Subject Progress
    st.subheader("Progress by Subject")
    progress_data = {
        "Mathematics": 75,
        "Physics": 60,
        "Computer Science": 90,
        "Chemistry": 45,
        "Biology": 30
    }
    
    st.bar_chart(progress_data)
    
    # Session Metrics
    st.subheader("Session Metrics")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Questions Asked", str(len([m for m in st.session_state.messages if m["role"] == "user"])))
    with col2:
        st.metric("Session Length", f"{minutes:02d}:{seconds:02d}")
    with col3:
        st.metric("Topics Covered", "3")
    
    # Recent Activity
    st.subheader("Recent Activities")
    st.table({
        "Date": ["2025-05-05", "2025-05-04", "2025-05-03"],
        "Subject": ["Mathematics", "Physics", "Computer Science"],
        "Duration": ["45 min", "30 min", "60 min"],
        "Performance": ["Good", "Excellent", "Needs Improvement"]
    })

with tab3:
    st.header("Learning Resources")
    
    # Recommended Materials
    st.subheader("Recommended Resources")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        **Introduction to Linear Algebra**
        - ✅ Video tutorials
        - ✅ Interactive exercises
        - ✅ Practice quizzes
        """)
        st.button("Open Resource", key="resource1")
    
    with col2:
        st.markdown("""
        **Advanced Calculus Guide**
        - ✅ Comprehensive text
        - ✅ Problem sets
        - ✅ Visual explanations
        """)
        st.button("Open Resource", key="resource2")
    
    with col3:
        st.markdown("""
        **Physics Problem Solver**
        - ✅ Step-by-step solutions
        - ✅ Formula sheets
        - ✅ Interactive simulations
        """)
        st.button("Open Resource", key="resource3")
    
    # Downloadable Materials
    st.subheader("Downloadable Materials")
    col1, col2 = st.columns(2)
    
    with col1:
        st.download_button(
            label="Download Study Guide (PDF)",
            data=b"Sample PDF content",
            file_name="study_guide.pdf",
            mime="application/pdf"
        )
    
    with col2:
        st.download_button(
            label="Download Formula Sheet (PDF)",
            data=b"Sample formula sheet content",
            file_name="formula_sheet.pdf",
            mime="application/pdf"
        )

# Footer
st.divider()
st.caption("© 2025 Tutor AI - Your Personal Learning Assistant")
