"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"

export function SaveJobButton({ jobId }: { jobId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "JOB_SEEKER") {
      checkIfSaved()
    } else {
      setIsChecking(false)
    }
  }, [session, jobId])

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/jobseeker/saved-jobs/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setIsSaved(data.isSaved)
      }
    } catch (error) {
      console.error("Error checking saved status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleToggleSave = async () => {
    if (!session) {
      router.push("/logowanie")
      return
    }

    if (session.user.role !== "JOB_SEEKER") {
      return
    }

    setIsLoading(true)

    try {
      if (isSaved) {
        const response = await fetch(`/api/jobseeker/saved-jobs/${jobId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setIsSaved(false)
        }
      } else {
        const response = await fetch("/api/jobseeker/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        })
        if (response.ok) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Nie pokazuj dla pracodawców
  if (session?.user?.role === "EMPLOYER") {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleSave}
      disabled={isLoading || isChecking}
      title={isSaved ? "Usuń z zapisanych" : "Zapisz ofertę"}
    >
      {isLoading || isChecking ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
        />
      )}
    </Button>
  )
}
