import requests
import json
import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"

image_path = r"C:\Users\anshuman\Downloads\32.png"
image_base64 = image_to_base64(image_path)

url = "https://router.huggingface.co/nebius/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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",
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36"
}

payload = {
    "model": "google/gemma-3-27b-it-fast",
    "messages": [
        {
            "role": "system",
            "content": """You will be provided with a raw text, extract all text lines intended for placement in the designated rectangles of a meme template.
For each rectangle, identify the corresponding line(s) of text and return the result in a structured JSON format. Label the rectangles
sequentially as 'rectangle_1', 'rectangle_2', etc., and represent each as a list of strings (to allow multiline text where applicable).
**If a portion of the text is already embedded in the meme image itself (i.e. part of the background or visual elements), do not include it
in the output list.**

**Expected JSON structure:**
```json
{
  'rectangle_1': ['Line 1', 'Line 2'],
  'rectangle_2': ['Line 1'],
  'rectangle_3': []
}
````

Only include rectangle keys that are relevant to the specific meme template. Exclude any text that is part of the static image content.
Specially do not manipulate data or add anything yours."""
},
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": """Ayyyyy gotcha now bro 💀 — you want:

* A short, funny **top caption** (like “Me in group projects”)
* Then a punchline that starts with **“I am once again asking…”** in the red meme box.

Here come 5 🔥 relatable and hilarious ones, your style:

---

**1.**
**Le me in group projects**
**I am once again asking why I’m doing everything alone**

---

**2.**
**When exam is tomorrow**
**I am once again asking if osmosis can transfer knowledge too**

---

**3.**
**Friend after 2 years**
**I am once again asking “who dis?”**

---

**4.**
**When mom finds my earphones**
**I am once again asking how that proves I’m a bad student**

---

**5.**
**When teacher says “surprise test”**
**I am once again asking why you hate peace**

---

Need 5 more of these gold-tier memes? I got a whole meme factory ready 😎
"""
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_base64
                    }
                }
            ]
        }
    ],
    "temperature": 0.5,
    "top_p": 0.7,
    "stream": True
}

with requests.post(url, headers=headers, data=json.dumps(payload), stream=True) as response:
    for line in response.iter_lines():
        if line:
            try:
                print(json.loads(line.decode("utf-8").split("data: ")[1]).get("choices")[0].get("delta").get("content"), end="")
            except:
                pass
