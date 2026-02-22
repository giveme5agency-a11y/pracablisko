"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Send, X } from "lucide-react"
import {
  JOB_TYPE_LABELS,
  WORK_SCHEDULE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  SALARY_TYPE_LABELS,
} from "@/types"

interface Location {
  id: string
  name: string
  city: string
}

interface Category {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
}

interface JobFormProps {
  locations: Location[]
  categories: Category[]
  skills: Skill[]
  initialData?: {
    id: string
    title: string
    description: string
    requirements: string | null
    responsibilities: string | null
    benefits: string | null
    locationId: string
    categoryId: string | null
    jobType: string
    workSchedule: string
    experienceLevel: string
    salaryMin: number | null
    salaryMax: number | null
    salaryType: string | null
    status: string
    skills: { skillId: string; required: boolean }[]
  }
}

export function JobForm({ locations, categories, skills, initialData }: JobFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    requirements: initialData?.requirements || "",
    responsibilities: initialData?.responsibilities || "",
    benefits: initialData?.benefits || "",
    locationId: initialData?.locationId || "",
    categoryId: initialData?.categoryId || "",
    jobType: initialData?.jobType || "FULL_TIME",
    workSchedule: initialData?.workSchedule || "FLEXIBLE",
    experienceLevel: initialData?.experienceLevel || "NO_EXPERIENCE",
    salaryMin: initialData?.salaryMin?.toString() || "",
    salaryMax: initialData?.salaryMax?.toString() || "",
    salaryType: initialData?.salaryType || "MONTHLY",
  })

  const [selectedSkills, setSelectedSkills] = useState<
    { skillId: string; required: boolean }[]
  >(initialData?.skills || [])

  const handleSubmit = async (status: "DRAFT" | "ACTIVE") => {
    setError("")

    if (!formData.title || !formData.description || !formData.locationId) {
      setError("Wypełnij wymagane pola: tytuł, opis i lokalizacja")
      return
    }

    setIsLoading(true)

    try {
      const url = initialData
        ? `/api/employer/jobs/${initialData.id}`
        : "/api/employer/jobs"

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
          categoryId: formData.categoryId || null,
          status,
          skills: selectedSkills,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd")
        return
      }

      router.push("/panel/pracodawca/oferty")
      router.refresh()
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId)
      if (exists) {
        return prev.filter((s) => s.skillId !== skillId)
      }
      return [...prev, { skillId, required: false }]
    })
  }

  const toggleRequired = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.map((s) =>
        s.skillId === skillId ? { ...s, required: !s.required } : s
      )
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł stanowiska *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="np. Kelner/Kelnerka"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationId">Lokalizacja *</Label>
              <Select
                value={formData.locationId}
                onValueChange={(v) =>
                  setFormData({ ...formData, locationId: v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz lokalizację" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategoria</Label>
              <Select
                value={formData.categoryId || "none"}
                onValueChange={(v) =>
                  setFormData({ ...formData, categoryId: v === "none" ? "" : v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Brak kategorii</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis stanowiska *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Opisz stanowisko, obowiązki, co oferujesz..."
              rows={6}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły oferty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Typ pracy</Label>
              <Select
                value={formData.jobType}
                onValueChange={(v) => setFormData({ ...formData, jobType: v })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Harmonogram</Label>
              <Select
                value={formData.workSchedule}
                onValueChange={(v) =>
                  setFormData({ ...formData, workSchedule: v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_SCHEDULE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Doświadczenie</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(v) =>
                setFormData({ ...formData, experienceLevel: v })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wynagrodzenie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Od (zł)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                placeholder="np. 4000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Do (zł)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                placeholder="np. 5000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={formData.salaryType}
                onValueChange={(v) =>
                  setFormData({ ...formData, salaryType: v })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dodatkowe informacje (opcjonalne)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirements">Wymagania</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="Jakie umiejętności lub doświadczenie są wymagane?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Obowiązki</Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) =>
                setFormData({ ...formData, responsibilities: e.target.value })
              }
              placeholder="Jakie będą główne obowiązki na tym stanowisku?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Oferujemy</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) =>
                setFormData({ ...formData, benefits: e.target.value })
              }
              placeholder="Co oferujesz pracownikom? (benefity, szkolenia, etc.)"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Umiejętności</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => {
              const selected = selectedSkills.find((s) => s.skillId === skill.id)
              return (
                <Badge
                  key={skill.id}
                  variant={selected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill.id)}
                >
                  {skill.name}
                  {selected && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              )
            })}
          </div>

          {selectedSkills.length > 0 && (
            <div className="border-t pt-4">
              <Label className="mb-2 block">Zaznacz wymagane:</Label>
              <div className="space-y-2">
                {selectedSkills.map((s) => {
                  const skill = skills.find((sk) => sk.id === s.skillId)
                  return (
                    <div key={s.skillId} className="flex items-center gap-2">
                      <Checkbox
                        id={`req-${s.skillId}`}
                        checked={s.required}
                        onCheckedChange={() => toggleRequired(s.skillId)}
                      />
                      <Label htmlFor={`req-${s.skillId}`} className="font-normal">
                        {skill?.name} {s.required && "(wymagane)"}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          variant="outline"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Zapisz jako szkic
        </Button>
        <Button onClick={() => handleSubmit("ACTIVE")} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Opublikuj ofertę
        </Button>
      </div>
    </div>
  )
}
