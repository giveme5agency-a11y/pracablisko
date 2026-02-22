"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Banknote, Building2, CheckCircle, Heart, Loader2, Send } from "lucide-react"
import { JOB_TYPE_LABELS, WORK_SCHEDULE_LABELS, SALARY_TYPE_LABELS } from "@/types"
import type { JobType, WorkSchedule, SalaryType } from "@/types"

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    jobType: string
    workSchedule: string
    salaryMin: number | null
    salaryMax: number | null
    salaryType: string | null
    distance?: number | null
    employer: {
      companyName: string
      verified: boolean
    }
    location: {
      city: string
      street: string
    }
    category: {
      name: string
    } | null
  }
  isSelected?: boolean
  onSelect?: () => void
}

export function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingSaved, setIsCheckingSaved] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "JOB_SEEKER") {
      checkIfSaved()
    } else {
      setIsCheckingSaved(false)
    }
  }, [session, job.id])

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/jobseeker/saved-jobs/${job.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsSaved(data.isSaved)
      }
    } catch (error) {
      console.error("Error checking saved status:", error)
    } finally {
      setIsCheckingSaved(false)
    }
  }

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!session) {
      router.push("/logowanie")
      return
    }

    if (session.user.role !== "JOB_SEEKER") {
      return
    }

    setIsSaving(true)

    try {
      if (isSaved) {
        const response = await fetch(`/api/jobseeker/saved-jobs/${job.id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setIsSaved(false)
        }
      } else {
        const response = await fetch("/api/jobseeker/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id }),
        })
        if (response.ok) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/oferta/${job.id}`)
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null

    const type = job.salaryType ? SALARY_TYPE_LABELS[job.salaryType as SalaryType] : ""

    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin} - ${job.salaryMax} zł ${type}`
    }
    if (job.salaryMin) {
      return `od ${job.salaryMin} zł ${type}`
    }
    if (job.salaryMax) {
      return `do ${job.salaryMax} zł ${type}`
    }
    return null
  }

  const salary = formatSalary()
  const isJobSeeker = session?.user?.role === "JOB_SEEKER"
  const showSaveButton = !session || isJobSeeker

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/oferta/${job.id}`}
                className="font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-2 sm:truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {job.title}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 sm:mb-2">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{job.employer.companyName}</span>
              {job.employer.verified && (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">
                {job.location.city}
                <span className="hidden sm:inline">, {job.location.street}</span>
              </span>
              {job.distance !== undefined && job.distance !== null && (
                <Badge variant="secondary" className="ml-auto flex-shrink-0 text-xs">
                  {job.distance < 1
                    ? `${Math.round(job.distance * 1000)} m`
                    : `${job.distance.toFixed(1)} km`}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {JOB_TYPE_LABELS[job.jobType as JobType]}
              </Badge>
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                {WORK_SCHEDULE_LABELS[job.workSchedule as WorkSchedule]}
              </Badge>
              {job.category && (
                <Badge variant="secondary" className="text-xs">{job.category.name}</Badge>
              )}
            </div>

            {/* Przycisk Aplikuj */}
            <div className="mt-2 sm:mt-3">
              <Button
                size="sm"
                onClick={handleApply}
                className="gap-1 h-8 text-xs sm:text-sm"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                Aplikuj
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
            {/* Przycisk serca */}
            {showSaveButton && (
              <button
                onClick={handleToggleSave}
                disabled={isSaving || isCheckingSaved}
                className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title={isSaved ? "Usuń z zapisanych" : "Zapisz ofertę"}
              >
                {isSaving || isCheckingSaved ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-400" />
                ) : (
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isSaved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  />
                )}
              </button>
            )}

            {/* Wynagrodzenie */}
            {salary && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">{salary}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
