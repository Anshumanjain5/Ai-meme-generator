"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as fabric from "fabric"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Send } from "lucide-react"
import { EditPanel } from "./edit-panel"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

// Define the type for our rectangle objects
type AnnotationRectangle = {
  id: string
  left: number
  top: number
  width: number
  height: number
  angle: number
  fabricObject?: fabric.Group
}

export function ImageAnnotator() {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [rectangles, setRectangles] = useState<AnnotationRectangle[]>([])
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return

    // Create a new canvas
    const canvas = new fabric.Canvas("annotation-canvas", {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: "#f0f0f0",
    })

    canvasRef.current = canvas

    // Handle selection events
    canvas.on("selection:created", (e) => {
      const selectedObject = e.selected?.[0]
      if (selectedObject && selectedObject.data?.id) {
        setSelectedRectId(selectedObject.data.id)
      }
    })

    canvas.on("selection:updated", (e) => {
      const selectedObject = e.selected?.[0]
      if (selectedObject && selectedObject.data?.id) {
        setSelectedRectId(selectedObject.data.id)
      }
    })

    canvas.on("selection:cleared", () => {
      setSelectedRectId(null)
    })

    // Handle object modifications
    canvas.on("object:modified", (e) => {
      const modifiedObject = e.target
      if (modifiedObject && modifiedObject.data?.id) {
        updateRectangleFromCanvas(modifiedObject)
      }
    })

    // Handle object moving
    canvas.on("object:moving", (e) => {
      const movingObject = e.target
      if (movingObject && movingObject.data?.id) {
        updateRectangleFromCanvas(movingObject)
      }
    })

    // Handle object scaling
    canvas.on("object:scaling", (e) => {
      const scalingObject = e.target
      if (scalingObject && scalingObject.data?.id) {
        updateRectangleFromCanvas(scalingObject)
      }
    })

    // Handle object rotation
    canvas.on("object:rotating", (e) => {
      const rotatingObject = e.target
      if (rotatingObject && rotatingObject.data?.id) {
        updateRectangleFromCanvas(rotatingObject)
      }
    })

    // Clean up
    return () => {
      canvas.dispose()
    }
  }, [])

  // Update rectangle from canvas object
  const updateRectangleFromCanvas = (fabricObject: fabric.Object) => {
    if (!fabricObject.data?.id) return

    setRectangles((prevRectangles) => {
      return prevRectangles.map((rect) => {
        if (rect.id === fabricObject.data.id) {
          return {
            ...rect,
            left: fabricObject.left || 0,
            top: fabricObject.top || 0,
            width: fabricObject.getScaledWidth(),
            height: fabricObject.getScaledHeight(),
            angle: fabricObject.angle || 0,
          }
        }
        return rect
      })
    })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvasRef.current) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string

      // Store the original image URL
      setOriginalImageUrl(imgUrl)

      // Create a native Image object to get the actual dimensions
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Clear the canvas
        canvasRef.current?.clear()
        setRectangles([])
        setSelectedRectId(null)

        // Create a fabric.Image object
        const fabricImage = new fabric.Image(img, {
          selectable: false,
          evented: false,
        })

        // Calculate the scale to fit the image within the canvas
        const canvasWidth = canvasRef.current?.getWidth() || 800
        const canvasHeight = canvasRef.current?.getHeight() || 600

        const imgWidth = img.width
        const imgHeight = img.height

        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight
        const scale = Math.min(scaleX, scaleY)

        fabricImage.scale(scale)

        // Center the image
        fabricImage.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
        })

        canvasRef.current?.add(fabricImage)
        canvasRef.current?.renderAll()
        setImageLoaded(true)
      }
      img.src = imgUrl
    }
    reader.readAsDataURL(file)
  }

  // Add a new rectangle
  const addRectangle = () => {
    if (!canvasRef.current || !imageLoaded) return

    const id = `rect_${Date.now()}`
    const newRect: AnnotationRectangle = {
      id,
      left: 100,
      top: 100,
      width: 150,
      height: 80,
      angle: 0,
    }

    createFabricRectangle(newRect)
    setRectangles((prev) => [...prev, newRect])
    setSelectedRectId(id)
  }

  // Create a fabric rectangle
  const createFabricRectangle = (rect: AnnotationRectangle) => {
    if (!canvasRef.current) return

    // Create the rectangle
    const fabricRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
      fill: "rgba(255, 255, 255, 0.5)",
      stroke: "#2563eb",
      strokeWidth: 2,
      rx: 5,
      ry: 5,
    })

    // Group the rectangle
    const group = new fabric.Group([fabricRect], {
      left: rect.left,
      top: rect.top,
      angle: rect.angle,
      hasControls: true,
      hasBorders: true,
      lockUniScaling: false,
      data: { id: rect.id, type: "annotation" },
    })

    canvasRef.current.add(group)
    canvasRef.current.setActiveObject(group)
    canvasRef.current.renderAll()

    // Store the fabric object reference
    setRectangles((prevRects) =>
      prevRects.map((r) => {
        if (r.id === rect.id) {
          return { ...r, fabricObject: group }
        }
        return r
      }),
    )
  }

  // Update a rectangle
  const updateRectangle = (updatedRect: Partial<AnnotationRectangle>) => {
    if (!selectedRectId || !canvasRef.current) return

    setRectangles((prevRects) => {
      const newRects = prevRects.map((rect) => {
        if (rect.id === selectedRectId) {
          const updated = { ...rect, ...updatedRect }

          // Find and update the fabric object
          const fabricObject = canvasRef.current
            ?.getObjects()
            .find((obj) => obj.data?.id === selectedRectId) as fabric.Group

          if (fabricObject) {
            // Update position and size
            if (updatedRect.left !== undefined) fabricObject.set({ left: updatedRect.left })
            if (updatedRect.top !== undefined) fabricObject.set({ top: updatedRect.top })
            if (updatedRect.width !== undefined || updatedRect.height !== undefined) {
              const rect = fabricObject.getObjects()[0] as fabric.Rect

              if (updatedRect.width !== undefined) {
                rect.set({ width: updatedRect.width })
              }

              if (updatedRect.height !== undefined) {
                rect.set({ height: updatedRect.height })
              }

              fabricObject.setCoords()
            }

            if (updatedRect.angle !== undefined) fabricObject.set({ angle: updatedRect.angle })

            canvasRef.current?.renderAll()
          }

          return updated
        }
        return rect
      })

      return newRects
    })
  }

  // Delete a rectangle
  const deleteRectangle = () => {
    if (!selectedRectId || !canvasRef.current) return

    // Remove from canvas
    const objectToRemove = canvasRef.current.getObjects().find((obj) => obj.data?.id === selectedRectId)

    if (objectToRemove) {
      canvasRef.current.remove(objectToRemove)
      canvasRef.current.renderAll()
    }

    // Remove from state
    setRectangles((prevRects) => prevRects.filter((rect) => rect.id !== selectedRectId))
    setSelectedRectId(null)
  }

  // Get canvas as image data URL
  const getCanvasImage = (): string | null => {
    if (!canvasRef.current) return null

    // Temporarily deselect any selected object to get a clean image
    const activeObject = canvasRef.current.getActiveObject()
    if (activeObject) {
      canvasRef.current.discardActiveObject()
      canvasRef.current.renderAll()
    }

    // Get the image data URL
    const dataUrl = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    })

    // Restore selection if there was one
    if (activeObject) {
      canvasRef.current.setActiveObject(activeObject)
      canvasRef.current.renderAll()
    }

    return dataUrl
  }

  // Convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })
  }

  // Calculate right-bottom coordinates for a rectangle
  const calculateRightBottom = (rect: AnnotationRectangle) => {
    // For simplicity, we're ignoring rotation in this calculation
    // In a real application, you would need to account for rotation
    return {
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
    }
  }

  // Prepare rectangle data for submission
  const prepareRectangleData = () => {
    return rectangles.map((rect) => {
      const rightBottom = calculateRightBottom(rect)
      return {
        id: rect.id,
        leftTop: {
          x: rect.left,
          y: rect.top,
        },
        rightBottom: {
          x: rightBottom.right,
          y: rightBottom.bottom,
        },
        width: rect.width,
        height: rect.height,
        angle: rect.angle,
      }
    })
  }

  // Submit the images and rectangle data to the server
  const submitToServer = async () => {
    if (!canvasRef.current || !imageLoaded || !originalImageUrl) return

    if (rectangles.length === 0) {
      alert("Please add at least one rectangle before submitting.")
      return
    }

    setIsSubmitting(true)

    try {
      // Get the annotated image data URL
      const annotatedImageDataUrl = getCanvasImage()
      if (!annotatedImageDataUrl) {
        alert("Error: Could not capture the annotated image.")
        setIsSubmitting(false)
        return
      }

      // Save the image URL for preview in case of error
      setPreviewImageUrl(annotatedImageDataUrl)

      // Convert to blobs for sending
      const annotatedImageBlob = dataURLtoBlob(annotatedImageDataUrl)
      const originalImageBlob = dataURLtoBlob(originalImageUrl)

      // Prepare rectangle data
      const rectangleData = prepareRectangleData()

      // Create FormData and append the images and data
      const formData = new FormData()
      formData.append("annotatedImage", annotatedImageBlob, "annotated-image.png")
      formData.append("originalImage", originalImageBlob, "original-image.png")
      formData.append("rectangleData", JSON.stringify(rectangleData))

      // Send to server
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(3000), // 3 second timeout
      })

      if (response.ok) {
        alert("Images and data submitted successfully!")
      } else {
        throw new Error(`Server responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error submitting data:", error)
      // Show the image preview dialog
      setImageDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the selected rectangle
  const selectedRectangle = rectangles.find((rect) => rect.id === selectedRectId)

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload size={16} />
              Upload Image
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <Button onClick={addRectangle} disabled={!imageLoaded} variant="outline">
              Add Rectangle
            </Button>
            <Button onClick={deleteRectangle} disabled={!selectedRectId} variant="destructive">
              Delete Selected
            </Button>
            <div className="ml-auto">
              <Button
                onClick={submitToServer}
                disabled={!imageLoaded || rectangles.length === 0 || isSubmitting}
                variant="default"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={16} />
                    Submit to Server
                  </>
                )}
              </Button>
            </div>
          </div>
          <div
            ref={canvasContainerRef}
            className={cn(
              "border rounded-md overflow-hidden bg-gray-100",
              !imageLoaded && "flex items-center justify-center min-h-[400px]",
            )}
          >
            {!imageLoaded && (
              <div className="text-center p-8 text-gray-500">
                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                <p>Upload an image to get started</p>
              </div>
            )}
            <canvas id="annotation-canvas" />
          </div>
        </Card>
      </div>

      <div className="w-full lg:w-80">
        <EditPanel rectangle={selectedRectangle} updateRectangle={updateRectangle} />
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Server Connection Failed</DialogTitle>
            <DialogDescription>
              Could not connect to localhost:8000. In a real environment, the following data would be sent to the
              server:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Annotated Image:</h3>
              <div className="flex justify-center p-4 bg-gray-100 rounded-md">
                {previewImageUrl && (
                  <img
                    src={previewImageUrl || "/placeholder.svg"}
                    alt="Annotated image"
                    className="max-w-full max-h-[30vh] object-contain border rounded shadow-sm"
                  />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Original Image:</h3>
              <div className="flex justify-center p-4 bg-gray-100 rounded-md">
                {originalImageUrl && (
                  <img
                    src={originalImageUrl || "/placeholder.svg"}
                    alt="Original image"
                    className="max-w-full max-h-[30vh] object-contain border rounded shadow-sm"
                  />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Rectangle Data:</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">{JSON.stringify(prepareRectangleData(), null, 2)}</pre>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
