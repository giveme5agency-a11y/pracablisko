import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ jobId: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await auth()
    const { jobId } = await params

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    await prisma.savedJob.deleteMany({
      where: {
        jobSeekerId: jobSeeker.id,
        jobId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing saved job:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await auth()
    const { jobId } = await params

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId,
        },
      },
    })

    return NextResponse.json({ isSaved: !!savedJob })
  } catch (error) {
    console.error("Error checking saved job:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
