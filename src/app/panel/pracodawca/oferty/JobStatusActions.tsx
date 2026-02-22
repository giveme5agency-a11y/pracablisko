"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Pause,
  Play,
  Eye,
  Loader2,
} from "lucide-react"

interface Job {
  id: string
  title: string
  status: string
}

export function JobStatusActions({ job }: { job: Job }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const updateStatus = async (status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/employer/jobs/${job.id}/status`, {
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

  const deleteJob = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/employer/jobs/${job.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting job:", error)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
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
          <DropdownMenuItem asChild>
            <Link href={`/oferta/${job.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Podgląd
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/panel/pracodawca/oferty/${job.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edytuj
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {job.status === "ACTIVE" ? (
            <DropdownMenuItem onClick={() => updateStatus("PAUSED")}>
              <Pause className="h-4 w-4 mr-2" />
              Wstrzymaj
            </DropdownMenuItem>
          ) : job.status === "PAUSED" || job.status === "DRAFT" ? (
            <DropdownMenuItem onClick={() => updateStatus("ACTIVE")}>
              <Play className="h-4 w-4 mr-2" />
              Aktywuj
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę ofertę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Oferta &quot;{job.title}&quot; zostanie
              trwale usunięta wraz ze wszystkimi aplikacjami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteJob}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
