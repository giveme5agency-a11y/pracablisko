"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  UserCheck,
  Loader2,
  FileText,
} from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Nowa",
  REVIEWED: "Przejrzana",
  SHORTLISTED: "W shortliście",
  REJECTED: "Odrzucona",
  HIRED: "Zatrudniono",
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  REVIEWED: "outline",
  SHORTLISTED: "default",
  REJECTED: "destructive",
  HIRED: "default",
}

export function ApplicationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] || "secondary"}>
      {STATUS_LABELS[status] || status}
    </Badge>
  )
}

interface Application {
  id: string
  status: string
  coverLetter: string | null
  jobSeeker: {
    user: {
      name: string | null
      email: string
    }
    phone: string | null
    bio: string | null
  }
}

export function ApplicationActions({
  application,
}: {
  application: Application
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const updateStatus = async (status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/employer/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Szczegóły
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {application.status === "PENDING" && (
            <DropdownMenuItem onClick={() => updateStatus("REVIEWED")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Oznacz jako przejrzana
            </DropdownMenuItem>
          )}
          {application.status !== "SHORTLISTED" && application.status !== "HIRED" && (
            <DropdownMenuItem onClick={() => updateStatus("SHORTLISTED")}>
              <Star className="h-4 w-4 mr-2" />
              Dodaj do shortlisty
            </DropdownMenuItem>
          )}
          {application.status !== "HIRED" && (
            <DropdownMenuItem onClick={() => updateStatus("HIRED")}>
              <UserCheck className="h-4 w-4 mr-2" />
              Zatrudnij
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {application.status !== "REJECTED" && (
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => updateStatus("REJECTED")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Odrzuć
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {application.jobSeeker.user.name || "Kandydat"}
            </DialogTitle>
            <DialogDescription>
              Szczegóły aplikacji
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Email</h4>
              <p className="text-sm text-muted-foreground">
                {application.jobSeeker.user.email}
              </p>
            </div>
            {application.jobSeeker.phone && (
              <div>
                <h4 className="font-medium mb-1">Telefon</h4>
                <p className="text-sm text-muted-foreground">
                  {application.jobSeeker.phone}
                </p>
              </div>
            )}
            {application.jobSeeker.bio && (
              <div>
                <h4 className="font-medium mb-1">O kandydacie</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.jobSeeker.bio}
                </p>
              </div>
            )}
            {application.coverLetter && (
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  List motywacyjny
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg">
                  {application.coverLetter}
                </p>
              </div>
            )}
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
