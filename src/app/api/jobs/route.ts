import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDistance, getBoundingBox } from "@/lib/geo"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null
    const radius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 10
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const jobType = searchParams.get("jobType") || ""

    // Bazowe warunki - tylko aktywne oferty
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    }

    // Filtr tekstowy
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { employer: { companyName: { contains: query, mode: "insensitive" } } },
      ]
    }

    // Filtr kategorii
    if (category) {
      where.categoryId = category
    }

    // Filtr typu pracy
    if (jobType) {
      where.jobType = jobType
    }

    // Filtr lokalizacji (bounding box)
    if (lat && lng) {
      const bbox = getBoundingBox(lat, lng, radius)
      where.location = {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLon, lte: bbox.maxLon },
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            verified: true,
          },
        },
        location: true,
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Oblicz odległość dla każdej oferty
    const jobsWithDistance = jobs.map((job) => {
      let distance: number | null = null

      if (lat && lng && job.location) {
        distance = calculateDistance(
          lat,
          lng,
          job.location.latitude,
          job.location.longitude
        )
      }

      return {
        ...job,
        distance,
        salaryMin: job.salaryMin ? Number(job.salaryMin) : null,
        salaryMax: job.salaryMax ? Number(job.salaryMax) : null,
      }
    })

    // Sortuj po odległości jeśli mamy lokalizację
    if (lat && lng) {
      jobsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })

      // Filtruj tylko te w promieniu
      const filteredJobs = jobsWithDistance.filter(
        (job) => job.distance !== null && job.distance <= radius
      )

      return NextResponse.json(filteredJobs)
    }

    return NextResponse.json(jobsWithDistance)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Błąd podczas pobierania ofert" },
      { status: 500 }
    )
  }
}
