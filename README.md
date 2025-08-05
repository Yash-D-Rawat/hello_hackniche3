# AI-Powered Collaborative Content Creation Platform

This project is a feature-rich collaborative text editor designed to enhance the writing process by integrating a suite of powerful AI tools directly into a real-time, shared editing environment. It functions like an advanced version of Google Docs, allowing multiple users to collaborate seamlessly while leveraging AI to improve, analyze, and enrich their content.

---

## Key Features

### Collaborative Real-Time Text Editor

- **Live Syncing**  
  Built with WebSockets, all changes are instantly broadcast to every user in the document room for a seamless, real-time editing experience.

- **Rich Text Formatting**  
  Powered by Quill.js, the editor supports a full range of formatting options, including headers, lists, fonts, colors, image embedding, and more.

- **PDF Export**  
  Download documents as clean, well-formatted PDFs for offline access or sharing.

---

### AI-Powered Writing Assistant

- **Automatic Suggestions**  
  As you type, the AI proactively suggests enhanced phrasing for the previous line, which can be accepted with a single click.

- **Content Enhancement**  
  Refine selected text or the entire document to make it more professional, engaging, or clear.

- **Sentiment Analysis**  
  Instantly assess the emotional tone of your writing.

- **Poetic & Script Analysis**  
  Transform your text into poetic form or reformat it as a professional screenplay.

- **Text-to-Image Generation**  
  Generate images directly from your text using an integrated AI model.

---

### Speech-to-Text with AI Enhancement

- **Live Transcription**  
  Convert speech to text in real-time using the browser's Speech Recognition API.

- **AI-Powered Refinement**  
  Clean up and enhance transcribed text using AI tools.

---

### Version Control and Document Management

- **Version History**  
  Manually save important versions and view a timestamped history with custom notes.

- **Restore Previous Versions**  
  Easily restore any previous version from the history.

---

## Tech Stack & Architecture

This project uses a modern full-stack JavaScript setup along with a Python backend for AI functionalities.

### Frontend

- React.js  
- Quill.js  
- Socket.io-client  
- Tailwind CSS  

### Backend (Main)

- Node.js  
- Express  
- Socket.io  

### Database

- MongoDB (with Mongoose)

### Backend (AI)

- Python  
- FastAPI & Flask  
- Google Gemini API

