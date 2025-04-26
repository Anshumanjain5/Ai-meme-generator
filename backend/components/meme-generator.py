import os
from openai import OpenAI
from dotenv import load_dotenv
import base64

# Load environment variables from .env file
load_dotenv()

token = os.environ["GITHUB_TOKEN"]
endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4.1"

image_path = r"C:\Users\anshuman\Downloads\ChatGPT Image Apr 18, 2025, 08_57_13 PM.png"  # Change to your local image
with open(image_path, "rb") as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

response = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "",
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is this image about?",
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{image_base64}",
                    },
                }
            ],
        }
    ],
    temperature=1,
    top_p=1,
    model=model
)

print(response.choices[0].message.content)

