import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Banknote,
  Building2,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import {
  JOB_TYPE_LABELS,
  WORK_SCHEDULE_LABELS,
  SALARY_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/types"
import { ApplyButton } from "./ApplyButton"
import { SaveJobButton } from "./SaveJobButton"

interface Props {
  params: Promise<{ id: string }>
}

export default async function JobPage({ params }: Props) {
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: {
        select: {
          id: true,
          companyName: true,
          description: true,
          logo: true,
          verified: true,
          phone: true,
          website: true,
        },
      },
      location: true,
      category: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  if (!job) {
    notFound()
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null

    const type = job.salaryType ? SALARY_TYPE_LABELS[job.salaryType] : ""
    const min = job.salaryMin ? Number(job.salaryMin) : null
    const max = job.salaryMax ? Number(job.salaryMax) : null

    if (min && max) {
      return `${min} - ${max} zł ${type}`
    }
    if (min) {
      return `od ${min} zł ${type}`
    }
    if (max) {
      return `do ${max} zł ${type}`
    }
    return null
  }

  const salary = formatSalary()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 sm:mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do listy ofert
        </Link>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Building2 className="h-5 w-5" />
                      <span className="text-lg">{job.employer.companyName}</span>
                      {job.employer.verified && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {job.location.street}, {job.location.city}
                      </span>
                    </div>
                  </div>

                  {salary && (
                    <div className="flex items-center gap-2 text-primary text-xl font-bold">
                      <Banknote className="h-6 w-6" />
                      {salary}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {JOB_TYPE_LABELS[job.jobType]}
                  </Badge>
                  <Badge variant="outline">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {WORK_SCHEDULE_LABELS[job.workSchedule]}
                  </Badge>
                  <Badge variant="outline">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}
                  </Badge>
                  {job.category && (
                    <Badge variant="secondary">{job.category.name}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Opis stanowiska</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-line">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Wymagania</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {job.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Obowiązki</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Oferujemy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {job.benefits}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Wymagane umiejętności</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((js) => (
                      <Badge
                        key={js.skill.id}
                        variant={js.required ? "default" : "secondary"}
                      >
                        {js.skill.name}
                        {js.required && " *"}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    * wymagane
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <ApplyButton jobId={job.id} />
                  <SaveJobButton jobId={job.id} />
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Dodano:{" "}
                      {new Date(job.createdAt).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                  {job.expiresAt && (
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Wygasa:{" "}
                        {new Date(job.expiresAt).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  O pracodawcy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold">{job.employer.companyName}</span>
                  {job.employer.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Zweryfikowany
                    </Badge>
                  )}
                </div>
                {job.employer.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {job.employer.description}
                  </p>
                )}
                {job.employer.website && (
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {job.employer.website}
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokalizacja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{job.location.name}</p>
                <p className="text-muted-foreground">
                  {job.location.street}
                  <br />
                  {job.location.postalCode} {job.location.city}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
