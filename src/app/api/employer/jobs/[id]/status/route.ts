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

    const job = await prisma.job.findFirst({
      where: { id, employerId: employer.id },
    })

    if (!job) {
      return NextResponse.json({ error: "Nie znaleziono oferty" }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!["ACTIVE", "PAUSED", "DRAFT", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 })
    }

    await prisma.job.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
