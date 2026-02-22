"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, Loader2, CheckCircle, LogIn, FileText, AlertCircle } from "lucide-react"

interface ApplyButtonProps {
  jobId: string
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [isLoadingCv, setIsLoadingCv] = useState(false)

  // Pobierz info o CV gdy dialog się otwiera
  useEffect(() => {
    if (isOpen && session?.user?.role === "JOB_SEEKER") {
      setIsLoadingCv(true)
      fetch("/api/jobseeker/cv")
        .then((res) => res.json())
        .then((data) => {
          setCvUrl(data.cvUrl || null)
        })
        .catch(() => {
          setCvUrl(null)
        })
        .finally(() => {
          setIsLoadingCv(false)
        })
    }
  }, [isOpen, session])

  const handleApply = async () => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas wysyłania aplikacji")
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
        setCoverLetter("")
      }, 2000)
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (status === "loading") {
    return (
      <Button className="w-full" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Ładowanie...
      </Button>
    )
  }

  // Not logged in
  if (!session) {
    return (
      <div className="space-y-3">
        <Button className="w-full" asChild>
          <Link href="/logowanie">
            <LogIn className="mr-2 h-4 w-4" />
            Zaloguj się aby aplikować
          </Link>
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Nie masz konta?{" "}
          <Link href="/rejestracja" className="text-primary hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    )
  }

  // Employer can't apply
  if (session.user.role === "EMPLOYER") {
    return (
      <Button className="w-full" disabled variant="secondary">
        Pracodawcy nie mogą aplikować
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Aplikuj teraz
        </Button>
      </DialogTrigger>
      <DialogContent>
        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aplikacja wysłana!</h3>
            <p className="text-muted-foreground">
              Twoja aplikacja została przesłana do pracodawcy.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Aplikuj na to stanowisko</DialogTitle>
              <DialogDescription>
                Wyślij swoją aplikację do pracodawcy. Możesz dodać opcjonalny
                list motywacyjny.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Info o CV */}
              <div className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Twoje CV</p>
                    {isLoadingCv ? (
                      <p className="text-sm text-muted-foreground">Ładowanie...</p>
                    ) : cvUrl ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        CV zostanie dołączone do aplikacji
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Nie masz dodanego CV
                        </p>
                        <Link
                          href="/panel/profil/cv"
                          className="text-xs text-primary hover:underline"
                        >
                          Dodaj CV w ustawieniach profilu
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">List motywacyjny (opcjonalnie)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Napisz kilka słów o sobie i dlaczego chcesz pracować na tym stanowisku..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button onClick={handleApply} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Wyślij aplikację
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
