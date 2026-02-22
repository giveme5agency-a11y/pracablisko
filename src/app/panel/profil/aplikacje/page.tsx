import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, Calendar, Building2, ExternalLink } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Oczekuje",
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

export default async function MyApplicationsPage() {
  const session = await auth()

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session!.user.id },
  })

  if (!jobSeeker) {
    redirect("/")
  }

  const applications = await prisma.application.findMany({
    where: { jobSeekerId: jobSeeker.id },
    include: {
      job: {
        include: {
          employer: {
            select: {
              companyName: true,
            },
          },
          location: {
            select: {
              city: true,
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
    hired: applications.filter((a) => a.status === "HIRED").length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moje aplikacje</h1>
        <p className="text-muted-foreground">
          Historia Twoich aplikacji na oferty pracy
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Oczekujące</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">W shortliście</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.shortlisted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Zatrudniono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          </CardContent>
        </Card>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak aplikacji</h3>
            <p className="text-muted-foreground text-center mb-4">
              Jeszcze nie aplikowałeś na żadną ofertę pracy
            </p>
            <Button asChild>
              <Link href="/">Przeglądaj oferty</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/oferta/${application.job.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {application.job.title}
                      </Link>
                      <Badge variant={STATUS_VARIANTS[application.status]}>
                        {STATUS_LABELS[application.status]}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {application.job.employer.companyName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.job.location.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Aplikowano: {new Date(application.createdAt).toLocaleDateString("pl-PL")}
                      </div>
                    </div>

                    {application.coverLetter && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/oferta/${application.job.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Zobacz ofertę
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
