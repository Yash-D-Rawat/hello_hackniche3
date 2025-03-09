from flask import Flask, request, jsonify
from langchain_google_genai import GoogleGenerativeAI
import os
from dotenv import load_dotenv
from flask_cors import CORS
# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Gemini model using LangChain
gemini = GoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

@app.route("/api/content/enhance", methods=["POST"])
def enhance_content():
    try:
        data = request.json
        content = data.get("content")

        if not content:
            return jsonify({"error": "Content is required"}), 400

        # Refinement prompt
        prompt = f"Review and refine the following content to make it more engaging and professional. Provide only one improved version:\n\n{content}"

        # Get response from Gemini
        response = gemini.invoke(prompt)

        return jsonify({"enhancedContent": response})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to enhance content"}), 500
    
@app.route("/api/content/poetic-analysis", methods=["POST"])
def poetic_analysis():
    """Analyzes and enhances the poetic elements of the text."""
    try:
        data = request.json
        content = data.get("content")

        if not content:
            return jsonify({"error": "Content is required"}), 400

        prompt = f"Analyze the following text for poetic elements such as rhythm, figures of speech, and structure. Then, rewrite it poetically while keeping the original meaning. Provide only one enhanced poetic version:\n\n{content}"
        poetic_content = gemini.invoke(prompt)

        return jsonify({"poeticContent": poetic_content})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to analyze poetic content"}), 500


@app.route("/api/content/sentiment-analysis", methods=["POST"])
def sentiment_analysis():
    """Performs sentiment analysis on the text."""
    try:
        data = request.json
        content = data.get("content")

        if not content:
            return jsonify({"error": "Content is required"}), 400

        prompt = f"Analyze the sentiment of the following text and classify it.Sentiment should basically give the emotions of the given content.Just give the emotions, dont explain them.:\n\n{content}"
        sentiment = gemini.invoke(prompt)

        return jsonify({"sentiment": sentiment})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to analyze sentiment"}), 500
    
@app.route("/api/script/format", methods=["POST"])
def format_script():
    try:
        data = request.json
        script = data.get("script")

        if not script:
            return jsonify({"error": "Script is required"}), 400

        prompt = f"Format the following text into a properly structured screenplay:\n\n{script}"
        formatted_script = gemini.invoke(prompt)

        return jsonify({"formattedScript": formatted_script})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to format script"}), 500
    
@app.route("/api/story/analyze-arc", methods=["POST"])
def analyze_story_arc():
    try:
        data = request.json
        story = data.get("story")

        if not story:
            return jsonify({"error": "Story content is required"}), 400

        prompt = f"Break down the following story into Exposition, Rising Action, Climax, and Resolution:\n\n{story}"
        arc_analysis = gemini.invoke(prompt)

        return jsonify({"arcAnalysis": arc_analysis})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to analyze story arc"}), 500

@app.route("/api/content/suggest-edits", methods=["POST"])
def suggest_edits():
    try:
        data = request.json
        content = data.get("content")

        if not content:
            return jsonify({"error": "Content is required"}), 400

        prompt = f"Suggest three alternative phrasings for the following text:\n\n{content}"
        suggestions = gemini.invoke(prompt)

        return jsonify({"suggestions": suggestions.split("\n\n")[:3]})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to suggest edits"}), 500

@app.route("/api/film/scene-suggestions", methods=["POST"])
def scene_suggestions():
    try:
        data = request.json
        scene = data.get("scene")

        if not scene:
            return jsonify({"error": "Scene description is required"}), 400

        prompt = f"Suggest vivid descriptions and sound effects for the following scene:\n\n{scene}"
        response = gemini.invoke(prompt)

        return jsonify({"sceneDetails": response})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to generate scene suggestions"}), 500

if __name__ == "__main__":
    app.run(debug=True,  port=4000)