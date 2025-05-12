from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def receive_data(
    annotatedImage: UploadFile = File(...),
    originalImage: UploadFile = File(...),
    rectangleData: str = Form(...)
):
    try:
        # Log for debugging
        print(f"annotatedImage: {annotatedImage.filename}")
        print(f"originalImage: {originalImage.filename}")
        print(f"rectangleData: {rectangleData}")

        rectangle_list = json.loads(rectangleData)

        with open(annotatedImage.filename, "wb") as f:
            f.write(await annotatedImage.read())
        with open(originalImage.filename, "wb") as f:
            f.write(await originalImage.read())
        with open("rectangleData.json", "w") as f:
            json.dump(rectangle_list, f)
            
        return JSONResponse(content={
            "annotatedImage": annotatedImage.filename,
            "originalImage": originalImage.filename,
            "rectangles": rectangle_list
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
