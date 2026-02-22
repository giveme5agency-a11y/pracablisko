import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { LocationForm } from "../LocationForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditLocationPage({ params }: Props) {
  const session = await auth()
  const { id } = await params

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  const location = await prisma.location.findFirst({
    where: { id, employerId: employer.id },
  })

  if (!location) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edytuj lokalizację</h1>
        <p className="text-muted-foreground">
          Zmień dane lokalizacji &quot;{location.name}&quot;
        </p>
      </div>

      <LocationForm initialData={location} />
    </div>
  )
}
