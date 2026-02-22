import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    const body = await request.json()
    const validated = profileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    // Aktualizuj dane użytkownika
    if (data.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      })
    }

    // Aktualizuj dane szukającego pracy
    await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: {
        phone: data.phone || null,
        bio: data.bio || null,
      },
    })

    // Aktualizuj umiejętności
    if (data.skills) {
      await prisma.jobSeekerSkill.deleteMany({
        where: { jobSeekerId: jobSeeker.id },
      })

      if (data.skills.length > 0) {
        await prisma.jobSeekerSkill.createMany({
          data: data.skills.map((skillId) => ({
            jobSeekerId: jobSeeker.id,
            skillId,
          })),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
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
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    return NextResponse.json({
      name: jobSeeker.user.name,
      email: jobSeeker.user.email,
      phone: jobSeeker.phone,
      bio: jobSeeker.bio,
      skills: jobSeeker.skills.map((s) => ({
        id: s.skillId,
        name: s.skill.name,
      })),
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
