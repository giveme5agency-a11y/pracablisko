import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
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
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ error: "Brak ID oferty" }, { status: 400 })
    }

    // Sprawdź czy oferta istnieje
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 })
    }

    // Sprawdź czy już zapisana
    const existing = await prisma.savedJob.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Oferta już zapisana" }, { status: 400 })
    }

    await prisma.savedJob.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error saving job:", error)
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
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        job: {
          include: {
            employer: {
              select: {
                companyName: true,
              },
            },
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(savedJobs)
  } catch (error) {
    console.error("Error fetching saved jobs:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
