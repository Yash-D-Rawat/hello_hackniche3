from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
import io
import os
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError


# Load environment variables
load_dotenv()

API_URL = "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image"
API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
headers = {"Authorization": f"Bearer {API_TOKEN}"}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def query(payload):
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        if response.status_code != 200:
            print(f"API Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Error generating image from API")
        return response.content
    except requests.exceptions.Timeout:
        print("Error: Request to the Hugging Face API timed out.")
        raise HTTPException(status_code=504, detail="API request timed out")
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the API")

@app.get("/generate-image")
async def generate_image(prompt: str):
    try:
        if not prompt or prompt.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        image_bytes = query({"inputs": prompt})
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except UnidentifiedImageError:
            print("Error: Unable to identify image format from API response.")
            raise HTTPException(status_code=500, detail="Invalid image data received")

        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        return StreamingResponse(img_io, media_type="image/png")
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")
