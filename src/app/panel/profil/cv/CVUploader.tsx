"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Trash2, Loader2, Download, CheckCircle } from "lucide-react"

interface CVUploaderProps {
  initialCvUrl: string | null
}

export function CVUploader({ initialCvUrl }: CVUploaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(initialCvUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setSuccess("")
    setIsUploading(true)

    const formData = new FormData()
    formData.append("cv", file)

    try {
      const response = await fetch("/api/jobseeker/cv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Błąd podczas uploadu")
        return
      }

      setCvUrl(data.cvUrl)
      setSuccess("CV zostało dodane pomyślnie!")
      router.refresh()
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.")
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć swoje CV?")) return

    setError("")
    setSuccess("")
    setIsDeleting(true)

    try {
      const response = await fetch("/api/jobseeker/cv", {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Błąd podczas usuwania")
        return
      }

      setCvUrl(null)
      setSuccess("CV zostało usunięte")
      router.refresh()
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getFileName = (url: string) => {
    const parts = url.split("/")
    return parts[parts.length - 1]
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {cvUrl ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{getFileName(cvUrl)}</p>
                <p className="text-xs text-muted-foreground">
                  Twoje aktualne CV
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Pobierz
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Nie masz jeszcze dodanego CV
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
        variant={cvUrl ? "outline" : "default"}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Przesyłanie...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {cvUrl ? "Zmień CV" : "Dodaj CV"}
          </>
        )}
      </Button>
    </div>
  )
}
