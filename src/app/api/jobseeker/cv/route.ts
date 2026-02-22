import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get("cv") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nie wybrano pliku" }, { status: 400 })
    }

    // Walidacja typu pliku
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Dozwolone formaty: PDF, DOC, DOCX" },
        { status: 400 }
      )
    }

    // Walidacja rozmiaru
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Maksymalny rozmiar pliku to 5MB" },
        { status: 400 }
      )
    }

    // Usuń stary plik CV jeśli istnieje
    if (jobSeeker.cvUrl) {
      try {
        const oldPath = join(process.cwd(), "public", jobSeeker.cvUrl)
        await unlink(oldPath)
      } catch {
        // Ignoruj błąd jeśli plik nie istnieje
      }
    }

    // Generuj unikalną nazwę pliku
    const ext = file.name.split(".").pop()
    const fileName = `${jobSeeker.id}-${Date.now()}.${ext}`
    const filePath = `/uploads/cv/${fileName}`
    const fullPath = join(process.cwd(), "public", filePath)

    // Zapisz plik
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(fullPath, buffer)

    // Aktualizuj bazę danych
    await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { cvUrl: filePath },
    })

    return NextResponse.json({
      success: true,
      cvUrl: filePath,
      fileName: file.name
    })
  } catch (error) {
    console.error("Error uploading CV:", error)
    return NextResponse.json({ error: "Błąd podczas uploadu" }, { status: 500 })
  }
}

export async function DELETE() {
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

    if (!jobSeeker.cvUrl) {
      return NextResponse.json({ error: "Brak CV do usunięcia" }, { status: 400 })
    }

    // Usuń plik
    try {
      const filePath = join(process.cwd(), "public", jobSeeker.cvUrl)
      await unlink(filePath)
    } catch {
      // Ignoruj błąd jeśli plik nie istnieje
    }

    // Aktualizuj bazę danych
    await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { cvUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting CV:", error)
    return NextResponse.json({ error: "Błąd podczas usuwania" }, { status: 500 })
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
      select: { cvUrl: true },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 })
    }

    return NextResponse.json({ cvUrl: jobSeeker.cvUrl })
  } catch (error) {
    console.error("Error fetching CV:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
