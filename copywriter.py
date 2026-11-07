import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load the API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found. Check your .env file.")
    raise SystemExit

client = genai.Client(api_key=api_key)
MODEL = "gemini-2.5-flash"

# Step 2 + 3: each platform has its own rules AND its own creativity level
PLATFORMS = {
    "linkedin": {
        "rules": (
            "Write a LinkedIn post. Start with a strong hook line. "
            "Use short paragraphs. Maximum 150 words. "
            "End with a question or call to action. "
            "Use at most 3 hashtags. No emojis."
        ),
        "temperature": 0.5,  # balanced
    },
    "instagram": {
        "rules": (
            "Write an Instagram caption. Catchy first line, casual and punchy. "
            "Maximum 60 words. Use 3 to 5 emojis and 5 to 8 hashtags at the end."
        ),
        "temperature": 1.0,  # more creative
    },
    "email": {
        "rules": (
            "Write a marketing email. Format: a 'Subject:' line, then a body "
            "of 80 to 120 words, then one call-to-action button text in square brackets."
        ),
        "temperature": 0.3,  # more predictable
    },
}

TONES = ["professional", "funny", "luxury"]


# Step 4: keep asking until the input is valid
def ask(label, options=None):
    while True:
        value = input(label).strip()
        if not value:
            print("This cannot be empty. Try again.")
            continue
        if options and value.lower() not in options:
            print("Please choose one of:", ", ".join(options))
            continue
        return value


# 1. Collect the variables
product_name = ask("Product name: ")
description = ask("Product description: ")
platform = ask("Platform (linkedin / instagram / email): ", list(PLATFORMS)).lower()
tone = ask("Tone (professional / funny / luxury): ", TONES).lower()

settings = PLATFORMS[platform]

# 2. Build the prompt from a template
prompt = f"""You are a professional marketing copywriter.

{settings["rules"]}
Tone: {tone}

Product name: {product_name}
Product description: {description}

Return only the final copy. No explanations, no placeholders like [link].
"""

# 3. Send to Gemini with platform-specific creativity
try:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=settings["temperature"],
            top_p=0.9,
        ),
    )
    print(f"\n--- {platform.title()} copy ({tone}) | temperature={settings['temperature']} ---\n")
    print(response.text)

except Exception as e:
    print(f"\nError: {e}")
    print("Please try again.")