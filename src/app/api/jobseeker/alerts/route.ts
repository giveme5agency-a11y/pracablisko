import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const alertSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100),
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().min(1).max(50).default(5),
  categoryId: z.string().optional().nullable(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]).optional().nullable(),
  keywords: z.string().max(200).optional().nullable(),
})

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

    const alerts = await prisma.jobAlert.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        notifications: {
          where: { isRead: false },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Dodaj liczbę nieprzeczytanych powiadomień
    const alertsWithCount = alerts.map((alert) => ({
      ...alert,
      unreadCount: alert.notifications.length,
      notifications: undefined,
    }))

    return NextResponse.json(alertsWithCount)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Sprawdź limit alertów (max 10)
    const alertCount = await prisma.jobAlert.count({
      where: { jobSeekerId: jobSeeker.id },
    })

    if (alertCount >= 10) {
      return NextResponse.json(
        { error: "Osiągnięto maksymalną liczbę alertów (10)" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = alertSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: validated.error.issues },
        { status: 400 }
      )
    }

    const alert = await prisma.jobAlert.create({
      data: {
        jobSeekerId: jobSeeker.id,
        name: validated.data.name,
        latitude: validated.data.latitude,
        longitude: validated.data.longitude,
        radius: validated.data.radius,
        categoryId: validated.data.categoryId || null,
        jobType: validated.data.jobType || null,
        keywords: validated.data.keywords || null,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
