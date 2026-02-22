import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const applicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(3000).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    if (session.user.role === "EMPLOYER") {
      return NextResponse.json(
        { error: "Pracodawcy nie mogą aplikować na oferty" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = applicationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane" },
        { status: 400 }
      )
    }

    const { jobId, coverLetter } = validated.data

    // Sprawdź czy oferta istnieje i jest aktywna
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job || job.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Oferta nie istnieje lub jest nieaktywna" },
        { status: 404 }
      )
    }

    // Znajdź profil szukającego pracy
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
    })

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu szukającego pracy" },
        { status: 404 }
      )
    }

    // Sprawdź czy nie aplikował już na tę ofertę
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId: jobSeeker.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "Już aplikowałeś na tę ofertę" },
        { status: 400 }
      )
    }

    // Utwórz aplikację - dołącz CV jeśli kandydat je ma
    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId: jobSeeker.id,
        coverLetter: coverLetter || null,
        cvUrl: jobSeeker.cvUrl || null,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      { message: "Aplikacja wysłana pomyślnie", applicationId: application.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Application error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
    })

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu" },
        { status: 404 }
      )
    }

    const applications = await prisma.application.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        job: {
          include: {
            employer: {
              select: {
                companyName: true,
                verified: true,
              },
            },
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
