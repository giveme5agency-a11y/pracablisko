import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { JobForm } from "../JobForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
    include: {
      locations: true,
    },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  const job = await prisma.job.findFirst({
    where: { id, employerId: employer.id },
    include: {
      skills: true,
    },
  })

  if (!job) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const skills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edytuj ofertę</h1>
        <p className="text-muted-foreground">
          Zmień dane oferty &quot;{job.title}&quot;
        </p>
      </div>

      <JobForm
        locations={employer.locations}
        categories={categories}
        skills={skills}
        initialData={{
          id: job.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          benefits: job.benefits,
          locationId: job.locationId,
          categoryId: job.categoryId,
          jobType: job.jobType,
          workSchedule: job.workSchedule,
          experienceLevel: job.experienceLevel,
          salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
          salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
          salaryType: job.salaryType,
          status: job.status,
          skills: job.skills.map((s) => ({
            skillId: s.skillId,
            required: s.required,
          })),
        }}
      />
    </div>
  )
}
