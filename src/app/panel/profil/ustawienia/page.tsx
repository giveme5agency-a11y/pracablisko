import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Bell, Trash2 } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session!.user.id },
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
    },
  })

  if (!jobSeeker) {
    redirect("/")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ustawienia</h1>
        <p className="text-muted-foreground">
          Zarządzaj ustawieniami swojego konta
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informacje o koncie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{jobSeeker.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Typ konta</p>
              <Badge variant="secondary">Szukający pracy</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data rejestracji</p>
              <p>{new Date(jobSeeker.user.createdAt).toLocaleDateString("pl-PL")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Powiadomienia
            </CardTitle>
            <CardDescription>
              Ustawienia powiadomień email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funkcja powiadomień email będzie dostępna wkrótce.
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Strefa niebezpieczna
            </CardTitle>
            <CardDescription>
              Nieodwracalne akcje na koncie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Usuń konto
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Funkcja usuwania konta będzie dostępna wkrótce.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
