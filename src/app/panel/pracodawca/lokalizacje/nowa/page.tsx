import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LocationForm } from "../LocationForm"

export default async function NewLocationPage() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dodaj lokalizację</h1>
        <p className="text-muted-foreground">
          Wprowadź dane nowej lokalizacji firmy
        </p>
      </div>

      <LocationForm />
    </div>
  )
}
