import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateAlertSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).max(50).optional(),
  categoryId: z.string().optional().nullable(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]).optional().nullable(),
  keywords: z.string().max(200).optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    const alert = await prisma.jobAlert.findFirst({
      where: {
        id,
        jobSeekerId: jobSeeker.id,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        notifications: {
          where: { isRead: false },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                employer: {
                  select: { companyName: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!alert) {
      return NextResponse.json(
        { error: "Alert nie został znaleziony" },
        { status: 404 }
      )
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error fetching alert:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    // Sprawdź czy alert należy do użytkownika
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        jobSeekerId: jobSeeker.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Alert nie został znaleziony" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = updateAlertSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: validated.error.issues },
        { status: 400 }
      )
    }

    const alert = await prisma.jobAlert.update({
      where: { id },
      data: {
        ...(validated.data.name && { name: validated.data.name }),
        ...(validated.data.latitude !== undefined && { latitude: validated.data.latitude }),
        ...(validated.data.longitude !== undefined && { longitude: validated.data.longitude }),
        ...(validated.data.radius !== undefined && { radius: validated.data.radius }),
        ...(validated.data.categoryId !== undefined && { categoryId: validated.data.categoryId }),
        ...(validated.data.jobType !== undefined && { jobType: validated.data.jobType }),
        ...(validated.data.keywords !== undefined && { keywords: validated.data.keywords }),
        ...(validated.data.isActive !== undefined && { isActive: validated.data.isActive }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    // Sprawdź czy alert należy do użytkownika
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        jobSeekerId: jobSeeker.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Alert nie został znaleziony" },
        { status: 404 }
      )
    }

    await prisma.jobAlert.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
