import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const settingsSchema = z.object({
  companyName: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  userName: z.string().max(100).optional(),
})

export async function PUT(request: Request) {
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
    const validated = settingsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    // Aktualizuj dane pracodawcy
    await prisma.employer.update({
      where: { id: employer.id },
      data: {
        companyName: data.companyName,
        description: data.description || null,
        website: data.website || null,
        phone: data.phone || null,
      },
    })

    // Aktualizuj dane użytkownika
    if (data.userName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: data.userName },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
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
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!employer) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    return NextResponse.json({
      companyName: employer.companyName,
      description: employer.description,
      website: employer.website,
      phone: employer.phone,
      userName: employer.user.name,
      email: employer.user.email,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
