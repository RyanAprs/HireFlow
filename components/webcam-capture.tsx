"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, X, RotateCcw, Hand } from "lucide-react"

export default function WebcamCapture({
  onCapture,
  onClose,
}: {
  onCapture: (photoUrl: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [gestureDetected, setGestureDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError("Unable to access webcam. Please grant camera permissions.")
      console.error("Webcam error:", err)
    }
  }

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  // Simple gesture detection (detects significant changes in video frame)
  const detectGesture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Simple brightness detection in center region (simulating hand detection)
    let brightPixels = 0
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const regionSize = 100

    for (let y = centerY - regionSize; y < centerY + regionSize; y++) {
      for (let x = centerX - regionSize; x < centerX + regionSize; x++) {
        const i = (y * canvas.width + x) * 4
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (brightness > 150) brightPixels++
      }
    }

    const threshold = regionSize * regionSize * 0.3
    if (brightPixels > threshold && !gestureDetected) {
      setGestureDetected(true)
      startCountdown()
    }
  }, [gestureDetected])

  // Start countdown before capture
  const startCountdown = () => {
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval)
          capturePhoto()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  // Capture photo from video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const photoUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCapturedPhoto(photoUrl)
    setGestureDetected(false)
  }

  // Manual capture
  const handleManualCapture = () => {
    capturePhoto()
  }

  // Confirm and use photo
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
      stopWebcam()
    }
  }

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null)
    setGestureDetected(false)
  }

  // Close modal
  const handleClose = () => {
    stopWebcam()
    onClose()
  }

  // Initialize webcam
  useEffect(() => {
    startWebcam()
    return () => stopWebcam()
  }, [])

  // Gesture detection loop
  useEffect(() => {
    if (!capturedPhoto && stream) {
      const interval = setInterval(detectGesture, 100)
      return () => clearInterval(interval)
    }
  }, [capturedPhoto, stream, detectGesture])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Take Profile Photo</CardTitle>
              <CardDescription>
                {capturedPhoto
                  ? "Review your photo"
                  : "Position yourself in the frame or wave your hand to trigger capture"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">{error}</div>}

          {!capturedPhoto ? (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-gray-900" />
              <canvas ref={canvasRef} className="hidden" />

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
                </div>
              )}

              {/* Gesture Indicator */}
              {gestureDetected && countdown === null && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                  <Hand className="h-5 w-5" />
                  <span>Gesture detected!</span>
                </div>
              )}

              {/* Center Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-dashed border-white/50 rounded-full w-64 h-64"></div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img src={capturedPhoto || "/placeholder.svg"} alt="Captured" className="w-full rounded-lg" />
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!capturedPhoto ? (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleManualCapture} className="flex-1 gap-2">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleRetake} className="flex-1 gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Use This Photo
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          {!capturedPhoto && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Gesture Capture:</strong> Wave your hand in the center of the frame to automatically trigger a
                3-second countdown, or click &quot;Take Photo&quot; to capture manually.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
