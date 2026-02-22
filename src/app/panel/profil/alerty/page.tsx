"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Plus,
  MapPin,
  Trash2,
  Pause,
  Play,
  Tag,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { AlertForm } from "./AlertForm"
import { JOB_TYPE_LABELS } from "@/types"

interface JobAlert {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  categoryId: string | null
  category: { id: string; name: string } | null
  jobType: string | null
  keywords: string | null
  isActive: boolean
  unreadCount?: number
  createdAt: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null)

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/jobseeker/alerts")
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (error) {
      toast.error("Nie udało się pobrać alertów")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten alert?")) return

    try {
      const res = await fetch(`/api/jobseeker/alerts/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
        toast.success("Alert został usunięty")
      } else {
        toast.error("Nie udało się usunąć alertu")
      }
    } catch (error) {
      toast.error("Wystąpił błąd")
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/jobseeker/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, isActive: !isActive } : a
          )
        )
        toast.success(isActive ? "Alert wstrzymany" : "Alert aktywowany")
      } else {
        toast.error("Nie udało się zmienić statusu alertu")
      }
    } catch (error) {
      toast.error("Wystąpił błąd")
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAlert(null)
    fetchAlerts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alerty o ofertach</h1>
          <p className="text-muted-foreground">
            Otrzymuj powiadomienia o nowych ofertach w wybranych lokalizacjach
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={alerts.length >= 10}>
          <Plus className="h-4 w-4 mr-2" />
          Nowy alert
        </Button>
      </div>

      {showForm || editingAlert ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingAlert ? "Edytuj alert" : "Nowy alert"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertForm
              alert={editingAlert}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingAlert(null)
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak alertów</h3>
            <p className="text-muted-foreground text-center mb-4">
              Utwórz alert, aby otrzymywać powiadomienia o nowych ofertach pracy
              w wybranej lokalizacji
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Utwórz pierwszy alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={!alert.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{alert.name}</h3>
                      {alert.unreadCount && alert.unreadCount > 0 ? (
                        <Badge variant="default">
                          {alert.unreadCount} nowych
                        </Badge>
                      ) : null}
                      {!alert.isActive && (
                        <Badge variant="secondary">Wstrzymany</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Promień: {alert.radius} km
                      </div>
                      {alert.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {alert.category.name}
                        </div>
                      )}
                      {alert.jobType && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">
                            {JOB_TYPE_LABELS[alert.jobType as keyof typeof JOB_TYPE_LABELS]}
                          </Badge>
                        </div>
                      )}
                      {alert.keywords && (
                        <div className="flex items-center gap-1">
                          <Search className="h-4 w-4" />
                          {alert.keywords}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Utworzono: {new Date(alert.createdAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(alert.id, alert.isActive)}
                    >
                      {alert.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Wstrzymaj
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Aktywuj
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAlert(alert)}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {alerts.length >= 10 && (
            <p className="text-sm text-muted-foreground text-center">
              Osiągnięto maksymalną liczbę alertów (10)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
