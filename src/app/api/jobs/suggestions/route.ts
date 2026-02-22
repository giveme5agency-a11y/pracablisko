import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""

    if (query.length < 2) {
      return NextResponse.json([])
    }

    // Pobierz unikalne tytuły ofert pasujące do zapytania
    const jobs = await prisma.job.findMany({
      where: {
        status: "ACTIVE",
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        title: true,
      },
      distinct: ["title"],
      take: 8,
      orderBy: {
        title: "asc",
      },
    })

    // Pobierz też nazwy firm pasujące do zapytania
    const employers = await prisma.employer.findMany({
      where: {
        companyName: {
          contains: query,
          mode: "insensitive",
        },
        jobs: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      select: {
        companyName: true,
      },
      distinct: ["companyName"],
      take: 4,
    })

    const suggestions = [
      ...jobs.map((j) => ({ type: "job" as const, value: j.title })),
      ...employers.map((e) => ({ type: "company" as const, value: e.companyName })),
    ]

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json([])
  }
}
