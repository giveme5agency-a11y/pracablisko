import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Eye,
  Users,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Pause,
  Play,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS } from "@/types"
import { JobStatusActions } from "./JobStatusActions"

export default async function EmployerJobsPage() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
  })

  if (!employer) {
    return <div>Nie znaleziono profilu pracodawcy</div>
  }

  const jobs = await prisma.job.findMany({
    where: { employerId: employer.id },
    include: {
      location: true,
      category: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "DRAFT":
        return "secondary"
      case "PAUSED":
        return "outline"
      case "EXPIRED":
      case "CLOSED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moje oferty</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi ogłoszeniami o pracę
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/pracodawca/oferty/nowa">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj ofertę
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nie masz jeszcze żadnych ofert pracy
            </p>
            <Button asChild>
              <Link href="/panel/pracodawca/oferty/nowa">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pierwszą ofertę
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stanowisko</TableHead>
                <TableHead>Lokalizacja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aplikacje</TableHead>
                <TableHead className="text-center">Wyświetlenia</TableHead>
                <TableHead>Data dodania</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/panel/pracodawca/oferty/${job.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {JOB_TYPE_LABELS[job.jobType]}
                        {job.category && ` • ${job.category.name}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {job.location.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {JOB_STATUS_LABELS[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {job._count.applications}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {job.views}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString("pl-PL")}
                  </TableCell>
                  <TableCell>
                    <JobStatusActions job={job} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
