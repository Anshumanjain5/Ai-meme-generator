from huggingface_hub import InferenceClient

client = InferenceClient(
	provider="nebius",
	api_key="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"
)

messages = [
    {
        "role": "system",
        "content":"You will be provided with a raw text, extract all text lines intended for placement in the designated rectangles of a meme template. For each rectangle, identify the corresponding line(s) of text and return the result in a structured JSON format. Label the rectangles sequentially as `'rectangle_1'`, `'rectangle_2'`, etc., and represent each as a list of strings (to allow multiline text where applicable). **If a portion of the text is already embedded in the meme image itself (i.e. part of the background or visual elements), do not include it in the output list.**\n\n**Expected JSON structure:**\n```json\n{\n  'rectangle_1': ['Line 1', 'Line 2'],\n  'rectangle_2': ['Line 1'],\n  'rectangle_3': []\n}\n```\n\nOnly include rectangle keys that are relevant to the specific meme template. Exclude any text that is part of the static image content. Specially do not manipulate data or add anything yours."
    },
	{
		"role": "user",
		"content": "",
		"images": [
			"data:image/png;base64,"
		]
	}
]

stream = client.chat.completions.create(
	model="google/gemma-3-27b-it", 
	messages=messages, 
	temperature=0.5,
	max_tokens=2048,
	top_p=0.7,
	stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")