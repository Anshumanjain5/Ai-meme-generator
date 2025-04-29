from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import json
import os

load_dotenv()

with open(os.path.join(os.getcwd(), 'backend' ,'config',"prompt.json")) as f:
    prompt = json.load(f)

system_prompt = prompt["system_prompt_json"]

client = InferenceClient(
	provider="nebius",
	api_key=os.getenv("HF_token")
)

def str_to_json(raw_text:str, image_base64):
    messages = [
        {
            "role": "system",
            "content":system_prompt
        },
        {
            "role": "user",
            "content": raw_text,
            "images": [
                f"data:image/png;base64,{image_base64}"
            ]
        }
    ]
    messages = messages

    completion = client.chat.completions.create(
        model="google/gemma-3-27b-it", 
        messages=messages, 
        temperature=0.5,
        max_tokens=2048,
        top_p=0.7,
    )

    response = completion.choices[0].message.content
    messages.append({
        "role": "assistant",
        "content": response
    },
    {
        "role": "user",
        "content": "Remove the text that is already existed in the image.",
    })

    completion = client.chat.completions.create(
        model="google/gemma-3-27b-it", 
        messages=messages, 
        temperature=0.5,
        max_tokens=2048,
        top_p=0.7,
    )


    return completion.choices[0].message.content 
