import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { CVUploader } from "./CVUploader"

export default async function CVPage() {
  const session = await auth()

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session!.user.id },
    select: {
      cvUrl: true,
    },
  })

  if (!jobSeeker) {
    redirect("/")
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moje CV</h1>
        <p className="text-muted-foreground">
          Dodaj swoje CV, aby pracodawcy mogli je pobrać
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Curriculum Vitae
          </CardTitle>
          <CardDescription>
            Akceptowane formaty: PDF, DOC, DOCX. Maksymalny rozmiar: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CVUploader initialCvUrl={jobSeeker.cvUrl} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Wskazówki</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Dobre CV powinno zawierać:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Aktualne dane kontaktowe</li>
            <li>Podsumowanie zawodowe</li>
            <li>Doświadczenie zawodowe (od najnowszego)</li>
            <li>Wykształcenie</li>
            <li>Umiejętności i certyfikaty</li>
          </ul>
          <p className="mt-4">
            Twoje CV będzie dołączane do aplikacji na oferty pracy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
