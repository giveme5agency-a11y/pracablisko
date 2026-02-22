import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Building2 } from "lucide-react"
import Link from "next/link"
import { LocationActions } from "./LocationActions"

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ info?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  const employer = await prisma.employer.findUnique({
    where: { userId: session!.user.id },
    include: {
      locations: {
        include: {
          _count: {
            select: { jobs: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!employer) {
    redirect("/panel/pracodawca")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lokalizacje</h1>
          <p className="text-muted-foreground">
            Zarządzaj lokalizacjami swojej firmy
          </p>
        </div>
        <Link href="/panel/pracodawca/lokalizacje/nowa">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj lokalizację
          </Button>
        </Link>
      </div>

      {params.info === "first" && (
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          <strong>Witaj!</strong> Aby dodać ofertę pracy, musisz najpierw
          utworzyć przynajmniej jedną lokalizację.
        </div>
      )}

      {employer.locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak lokalizacji</h3>
            <p className="text-muted-foreground text-center mb-4">
              Dodaj pierwszą lokalizację, aby móc publikować oferty pracy
            </p>
            <Link href="/panel/pracodawca/lokalizacje/nowa">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj lokalizację
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employer.locations.map((location) => (
            <Card key={location.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <LocationActions location={location} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.street}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {location.postalCode} {location.city}
                </div>
                <Badge variant="secondary">
                  {location._count.jobs}{" "}
                  {location._count.jobs === 1
                    ? "oferta"
                    : location._count.jobs > 1 && location._count.jobs < 5
                    ? "oferty"
                    : "ofert"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
