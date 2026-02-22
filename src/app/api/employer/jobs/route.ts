import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const jobSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(5000),
  requirements: z.string().max(2000).nullable().optional(),
  responsibilities: z.string().max(2000).nullable().optional(),
  benefits: z.string().max(2000).nullable().optional(),
  locationId: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]),
  workSchedule: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT", "FLEXIBLE", "SHIFTS"]),
  experienceLevel: z.enum(["NO_EXPERIENCE", "JUNIOR", "MID", "SENIOR"]),
  salaryMin: z.number().positive().nullable().optional(),
  salaryMax: z.number().positive().nullable().optional(),
  salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]).nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]),
  skills: z.array(z.object({
    skillId: z.string(),
    required: z.boolean(),
  })).optional(),
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
    const validated = jobSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = validated.data

    // Sprawdź czy lokalizacja należy do pracodawcy
    const location = await prisma.location.findFirst({
      where: { id: data.locationId, employerId: employer.id },
    })

    if (!location) {
      return NextResponse.json(
        { error: "Nieprawidłowa lokalizacja" },
        { status: 400 }
      )
    }

    // Utwórz ofertę
    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        locationId: data.locationId,
        categoryId: data.categoryId || null,
        title: data.title,
        description: data.description,
        requirements: data.requirements || null,
        responsibilities: data.responsibilities || null,
        benefits: data.benefits || null,
        jobType: data.jobType,
        workSchedule: data.workSchedule,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        salaryType: data.salaryType || null,
        status: data.status,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
      },
    })

    // Dodaj umiejętności
    if (data.skills && data.skills.length > 0) {
      await prisma.jobSkill.createMany({
        data: data.skills.map((s) => ({
          jobId: job.id,
          skillId: s.skillId,
          required: s.required,
        })),
      })
    }

    return NextResponse.json({ id: job.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
