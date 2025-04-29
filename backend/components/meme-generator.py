import os
from openai import OpenAI
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

token = os.environ["GITHUB_TOKEN"]
endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4.1"

with open(os.path.join(os.getcwd(), 'backend' ,'config',"prompt.json")) as f:
    prompt = json.load(f)

system_prompt = prompt["system_prompt_meme"]
text_prompt = prompt["text_prompt_meme"]

client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

def meme_generator(image_base64,n_meme:int):
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a meme line generator. Your task is to create relatable and funny lines for the given meme templates.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Create a funny and relatable meme using this template. Each text box should feel like a real-life situation, dialogue, or inner thought. Match the tone of Gen Z humor — sarcastic, exaggerated, and meme-friendly. If there are multiple boxes, treat them like parts of a conversation or situation. The final line must deliver the punchline, preferably continuing or twisting the setup in a hilarious or unexpected way. Create {n_meme} memes.",
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
        temperature=0.7,
        top_p=1,
        model=model
    )

    # print(response.choices[0].message.content)
    return response.choices[0].message.content

