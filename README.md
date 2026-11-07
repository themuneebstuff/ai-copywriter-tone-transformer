# AI Copywriter & Tone Transformer

Turns a raw product description into marketing copy for LinkedIn, Instagram or Email, in a chosen tone. Built with Python and the Google Gemini API.

## How it works
The user enters Product_Name, Description, Platform and Tone. These variables are injected into a dynamic prompt template (f-string). Each platform has its own rules and its own temperature, and the prompt is sent to Gemini.

## Temperature and Top_P
- **Temperature** controls randomness. Low values give safe, predictable text. High values give more creative, varied text. Email uses 0.3 (consistent), LinkedIn 0.5 (balanced), Instagram 1.0 (creative).
- **Top_P** limits the model to the most likely words. It is set to 0.9 for focused but natural output.

## Setup
1. Install: `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and add your Gemini API key
3. Run: `python copywriter.py`

## Tech stack
Python, google-genai, python-dotenv