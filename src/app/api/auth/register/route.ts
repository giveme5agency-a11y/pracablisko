import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy email"),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
  name: z.string().min(2, "Nazwa jest wymagana"),
  role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, role } = validated.data

    // Sprawdź czy użytkownik istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym adresem email już istnieje" },
        { status: 400 }
      )
    }

    // Hash hasła
    const passwordHash = await hashPassword(password)

    // Utwórz użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    })

    // Utwórz profil w zależności od roli
    if (role === "EMPLOYER") {
      await prisma.employer.create({
        data: {
          userId: user.id,
          companyName: name,
        },
      })
    } else {
      // Podziel imię i nazwisko
      const nameParts = name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || ""

      await prisma.jobSeeker.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
        },
      })
    }

    return NextResponse.json(
      { message: "Konto utworzone pomyślnie" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 }
    )
  }
}
