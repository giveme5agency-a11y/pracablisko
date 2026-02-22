"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { MapPin, Loader2 } from "lucide-react"
import { JOB_TYPE_LABELS } from "@/types"
import dynamic from "next/dynamic"

const AlertLocationMap = dynamic(
  () => import("./AlertLocationMap").then((mod) => mod.AlertLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  }
)

interface Category {
  id: string
  name: string
}

interface AlertFormProps {
  alert?: {
    id: string
    name: string
    latitude: number
    longitude: number
    radius: number
    categoryId: string | null
    jobType: string | null
    keywords: string | null
  } | null
  onSuccess: () => void
  onCancel: () => void
}

export function AlertForm({ alert, onSuccess, onCancel }: AlertFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: alert?.name || "",
    latitude: alert?.latitude || 52.2297,
    longitude: alert?.longitude || 21.0122,
    radius: alert?.radius || 5,
    categoryId: alert?.categoryId || "",
    jobType: alert?.jobType || "",
    keywords: alert?.keywords || "",
  })

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolokalizacja nie jest wspierana przez przeglądarkę")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        toast.success("Pobrano lokalizację")
      },
      () => {
        toast.error("Nie udało się pobrać lokalizacji")
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = alert
        ? `/api/jobseeker/alerts/${alert.id}`
        : "/api/jobseeker/alerts"

      const res = await fetch(url, {
        method: alert ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          radius: formData.radius,
          categoryId: formData.categoryId || null,
          jobType: formData.jobType || null,
          keywords: formData.keywords || null,
        }),
      })

      if (res.ok) {
        toast.success(alert ? "Alert zaktualizowany" : "Alert utworzony")
        onSuccess()
      } else {
        const data = await res.json()
        toast.error(data.error || "Wystąpił błąd")
      }
    } catch (error) {
      toast.error("Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nazwa alertu *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="np. Praca w centrum Warszawy"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">Promień (km)</Label>
          <Select
            value={formData.radius.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, radius: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 km</SelectItem>
              <SelectItem value="2">2 km</SelectItem>
              <SelectItem value="5">5 km</SelectItem>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="15">15 km</SelectItem>
              <SelectItem value="20">20 km</SelectItem>
              <SelectItem value="30">30 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategoria</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                categoryId: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wszystkie kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kategorie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">Typ pracy</Label>
          <Select
            value={formData.jobType}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                jobType: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wszystkie typy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords">Słowa kluczowe</Label>
        <Input
          id="keywords"
          value={formData.keywords}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, keywords: e.target.value }))
          }
          placeholder="np. kelner, barista, obsługa klienta"
        />
        <p className="text-xs text-muted-foreground">
          Oddziel słowa kluczowe przecinkami
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lokalizacja *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Użyj mojej lokalizacji
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Kliknij na mapie, aby wybrać centrum obszaru wyszukiwania
        </p>
        <AlertLocationMap
          center={{ lat: formData.latitude, lng: formData.longitude }}
          radius={formData.radius}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" disabled={loading || !formData.name}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {alert ? "Zapisz zmiany" : "Utwórz alert"}
        </Button>
      </div>
    </form>
  )
}
