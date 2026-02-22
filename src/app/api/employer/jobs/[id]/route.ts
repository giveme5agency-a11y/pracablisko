import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    })

    if (!employer) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    // Sprawdź czy oferta należy do pracodawcy
    const job = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    })

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 })
    }

    // Usuń powiązane dane
    await prisma.jobSkill.deleteMany({ where: { jobId: id } })
    await prisma.savedJob.deleteMany({ where: { jobId: id } })
    await prisma.application.deleteMany({ where: { jobId: id } })
    await prisma.job.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    })

    if (!employer) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    const job = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    })

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 })
    }

    const body = await request.json()

    // Aktualizuj ofertę
    await prisma.job.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        requirements: body.requirements || null,
        responsibilities: body.responsibilities || null,
        benefits: body.benefits || null,
        locationId: body.locationId,
        categoryId: body.categoryId || null,
        jobType: body.jobType,
        workSchedule: body.workSchedule,
        experienceLevel: body.experienceLevel,
        salaryMin: body.salaryMin || null,
        salaryMax: body.salaryMax || null,
        salaryType: body.salaryType || null,
        status: body.status,
      },
    })

    // Aktualizuj umiejętności
    if (body.skills) {
      await prisma.jobSkill.deleteMany({ where: { jobId: id } })
      if (body.skills.length > 0) {
        await prisma.jobSkill.createMany({
          data: body.skills.map((s: { skillId: string; required: boolean }) => ({
            jobId: id,
            skillId: s.skillId,
            required: s.required,
          })),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
