import os
from openai import OpenAI
from dotenv import load_dotenv
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
load_dotenv()

token = os.environ["GITHUB_TOKEN"]
endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4.1"



client = OpenAI(
    base_url=endpoint,
    api_key=token,
)

def meme_generator(image_base64,n_meme:int,n_lines:int):
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
                        "text": f"Create {n_meme} funny and relatable memes based on the provided meme template. Each meme should have {n_lines} lines of text",
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

