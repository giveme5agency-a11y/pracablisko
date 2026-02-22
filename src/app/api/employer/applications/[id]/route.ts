import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
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

    // Sprawdź czy aplikacja należy do oferty tego pracodawcy
    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId: employer.id },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Nie znaleziono aplikacji" }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"].includes(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
    }

    await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: Props) {
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

    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId: employer.id },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        jobSeeker: {
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
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Nie znaleziono aplikacji" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
