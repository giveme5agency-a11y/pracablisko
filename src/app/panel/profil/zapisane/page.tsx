import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Building2, Clock, Banknote } from "lucide-react"
import { JOB_TYPE_LABELS } from "@/types"
import { RemoveSavedJobButton } from "./RemoveSavedJobButton"

export default async function SavedJobsPage() {
  const session = await auth()

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session!.user.id },
  })

  if (!jobSeeker) {
    redirect("/")
  }

  const savedJobs = await prisma.savedJob.findMany({
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Zapisane oferty</h1>
        <p className="text-muted-foreground">
          Oferty pracy, które zapisałeś do przejrzenia później
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak zapisanych ofert</h3>
            <p className="text-muted-foreground text-center mb-4">
              Nie masz jeszcze żadnych zapisanych ofert pracy
            </p>
            <Button asChild>
              <Link href="/">Przeglądaj oferty</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <Card key={saved.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/oferta/${saved.job.id}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {saved.job.title}
                      </Link>
                      <Badge variant="secondary">
                        {JOB_TYPE_LABELS[saved.job.jobType as keyof typeof JOB_TYPE_LABELS]}
                      </Badge>
                      {saved.job.status !== "ACTIVE" && (
                        <Badge variant="destructive">Nieaktywna</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {saved.job.employer.companyName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {saved.job.location.city}
                      </div>
                      {saved.job.salaryMin && (
                        <div className="flex items-center gap-1">
                          <Banknote className="h-4 w-4" />
                          {String(saved.job.salaryMin)}
                          {saved.job.salaryMax && ` - ${String(saved.job.salaryMax)}`} zł
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Zapisano: {new Date(saved.createdAt).toLocaleDateString("pl-PL")}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {saved.job.description}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <RemoveSavedJobButton jobId={saved.job.id} />
                    <Button size="sm" asChild>
                      <Link href={`/oferta/${saved.job.id}`}>Zobacz</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
