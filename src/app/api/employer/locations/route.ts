import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const locationSchema = z.object({
  name: z.string().min(2).max(100),
  street: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(5).max(10),
  latitude: z.number(),
  longitude: z.number(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    })

    if (!employer) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
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

    const location = await prisma.location.create({
      data: {
        employerId: employer.id,
        name: data.name,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    return NextResponse.json({ id: location.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 })
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    })

    if (!employer) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    const locations = await prisma.location.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
