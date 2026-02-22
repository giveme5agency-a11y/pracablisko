import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EmployerSettingsForm } from "./EmployerSettingsForm"

export default async function SettingsPage() {
  const session = await auth()

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ustawienia</h1>
        <p className="text-muted-foreground">
          Zarządzaj danymi swojej firmy
        </p>
      </div>

      <EmployerSettingsForm
        initialData={{
          companyName: employer.companyName,
          description: employer.description || "",
          website: employer.website || "",
          phone: employer.phone || "",
          userName: employer.user.name || "",
          email: employer.user.email,
        }}
      />
    </div>
  )
}
