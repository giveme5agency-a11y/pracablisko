import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Mail, Phone, Calendar, FileText, Download } from "lucide-react"
import Link from "next/link"
import { ApplicationStatusBadge, ApplicationActions } from "./ApplicationComponents"

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Nowa",
  REVIEWED: "Przejrzana",
  SHORTLISTED: "W shortliście",
  REJECTED: "Odrzucona",
  HIRED: "Zatrudniono",
}

export default async function ApplicationsPage() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  const applications = await prisma.application.findMany({
    where: {
      job: { employerId: employer.id },
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
        },
      },
      jobSeeker: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Aplikacje</h1>
        <p className="text-muted-foreground">
          Przeglądaj i zarządzaj otrzymanymi aplikacjami
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nowe</CardTitle>
            <Badge variant="secondary">{stats.pending}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">W shortliście</CardTitle>
            <Badge variant="default">{stats.shortlisted}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.shortlisted}
            </div>
          </CardContent>
        </Card>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak aplikacji</h3>
            <p className="text-muted-foreground text-center">
              Jeszcze nie otrzymałeś żadnych aplikacji na swoje oferty
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista aplikacji</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kandydat</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[100px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.jobSeeker.user.name || "Anonim"}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {application.jobSeeker.user.email}
                        </div>
                        {application.jobSeeker.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {application.jobSeeker.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/panel/pracodawca/oferty/${application.job.id}`}
                        className="hover:underline"
                      >
                        {application.job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {application.cvUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={application.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            <span className="hidden sm:inline">Pobierz</span>
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Brak</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(application.createdAt).toLocaleDateString(
                          "pl-PL"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ApplicationActions application={application} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
