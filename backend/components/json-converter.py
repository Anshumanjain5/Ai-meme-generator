import requests
import json
import os
from dotenv import load_dotenv
load_dotenv()
key = os.environ["HF_token"]

with open(os.path.join(os.getcwd(), 'backend' ,'config',"prompt.json")) as f:
    prompt = json.load(f)

system_prompt = prompt["system_prompt_json"]

def convert_to_json(raw_text, base_64):
    url = "https://router.huggingface.co/nebius/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36"
    }

    payload = {
        "model": "google/gemma-3-27b-it-fast",
        "messages": [
            {
                "role": "system",
                "content": system_prompt
    },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": raw_text
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base_64
                        }
                    }
                ]
            }
        ],
        "temperature": 0.5,
        "top_p": 0.7,
        "stream": True
    }

    content = ""

    with requests.post(url, headers=headers, data=json.dumps(payload), stream=True) as response:
        for line in response.iter_lines():
            if line:
                try:
                    text = json.loads(line.decode("utf-8").split("data: ")[1]).get("choices")[0].get("delta").get("content")
                    # print(text, end="")
                    content += text
                except:
                    pass

    return content
