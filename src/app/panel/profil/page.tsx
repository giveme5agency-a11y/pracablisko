import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth()

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  if (!jobSeeker) {
    redirect("/")
  }

  const allSkills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mój profil</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoimi danymi i umiejętnościami
        </p>
      </div>

      <ProfileForm
        initialData={{
          name: jobSeeker.user.name || "",
          email: jobSeeker.user.email,
          phone: jobSeeker.phone || "",
          bio: jobSeeker.bio || "",
          skills: jobSeeker.skills.map((s) => s.skillId),
        }}
        allSkills={allSkills}
      />
    </div>
  )
}
