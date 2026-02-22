import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Users,
  MapPin,
  Eye,
  Plus,
  TrendingUp,
  Clock,
} from "lucide-react"

export default async function EmployerDashboard() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
    include: {
      jobs: {
        include: {
          _count: {
            select: { applications: true },
          },
        },
      },
      locations: true,
    },
  })

  if (!employer) {
    return <div>Nie znaleziono profilu pracodawcy</div>
  }

  const activeJobs = employer.jobs.filter((j) => j.status === "ACTIVE")
  const totalApplications = employer.jobs.reduce(
    (sum, job) => sum + job._count.applications,
    0
  )
  const totalViews = employer.jobs.reduce((sum, job) => sum + job.views, 0)
  const pendingApplications = await prisma.application.count({
    where: {
      job: { employerId: employer.id },
      status: "PENDING",
    },
  })

  const recentApplications = await prisma.application.findMany({
    where: { job: { employerId: employer.id } },
    include: {
      job: { select: { title: true } },
      jobSeeker: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Witaj, {employer.companyName}!</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi ofertami pracy i aplikacjami
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/pracodawca/oferty/nowa">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj ofertę
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktywne oferty</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              z {employer.jobs.length} wszystkich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aplikacje</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {pendingApplications} oczekujących
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wyświetlenia</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">łącznie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lokalizacje</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employer.locations.length}</div>
            <p className="text-xs text-muted-foreground">
              miejsc pracy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ostatnie aplikacje
            </CardTitle>
            <CardDescription>
              Najnowsze aplikacje na Twoje oferty
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Brak aplikacji
              </p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {app.jobSeeker.user.name || app.jobSeeker.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {app.job.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={app.status === "PENDING" ? "secondary" : "outline"}
                      >
                        {app.status === "PENDING" ? "Nowa" : app.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(app.createdAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/panel/pracodawca/aplikacje">
                Zobacz wszystkie aplikacje
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Aktywne oferty
            </CardTitle>
            <CardDescription>
              Twoje obecnie publikowane ogłoszenia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Nie masz aktywnych ofert
                </p>
                <Button asChild>
                  <Link href="/panel/pracodawca/oferty/nowa">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj pierwszą ofertę
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <Link
                        href={`/panel/pracodawca/oferty/${job.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {job._count.applications} aplikacji
                        <Eye className="h-3 w-3 ml-2" />
                        {job.views} wyświetleń
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {job.expiresAt
                        ? new Date(job.expiresAt).toLocaleDateString("pl-PL")
                        : "Bez limitu"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/panel/pracodawca/oferty">
                Zarządzaj ofertami
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
