import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { JobForm } from "../JobForm"

export default async function NewJobPage() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
    include: {
      locations: true,
    },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  if (employer.locations.length === 0) {
    redirect("/panel/pracodawca/lokalizacje?info=first")
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
        <h1 className="text-2xl font-bold">Dodaj nową ofertę</h1>
        <p className="text-muted-foreground">
          Wypełnij formularz aby opublikować ogłoszenie o pracę
        </p>
      </div>

      <JobForm
        locations={employer.locations}
        categories={categories}
        skills={skills}
      />
    </div>
  )
}
