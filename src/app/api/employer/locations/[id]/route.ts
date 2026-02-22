import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface Props {
  params: Promise<{ id: string }>
}

const locationSchema = z.object({
  name: z.string().min(2).max(100),
  street: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(5).max(10),
  latitude: z.number(),
  longitude: z.number(),
})

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

    const location = await prisma.location.findFirst({
      where: { id, employerId: employer.id },
    })

    if (!location) {
      return NextResponse.json({ error: "Nie znaleziono lokalizacji" }, { status: 404 })
    }

    const body = await request.json()
    const validated = locationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    await prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
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

    const location = await prisma.location.findFirst({
      where: { id, employerId: employer.id },
      include: { _count: { select: { jobs: true } } },
    })

    if (!location) {
      return NextResponse.json({ error: "Nie znaleziono lokalizacji" }, { status: 404 })
    }

    if (location._count.jobs > 0) {
      return NextResponse.json(
        { error: "Nie można usunąć lokalizacji z przypisanymi ofertami" },
        { status: 400 }
      )
    }

    await prisma.location.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting location:", error)
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

    const location = await prisma.location.findFirst({
      where: { id, employerId: employer.id },
    })

    if (!location) {
      return NextResponse.json({ error: "Nie znaleziono lokalizacji" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error fetching location:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
