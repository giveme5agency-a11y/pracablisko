"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Job {
  id: string
  title: string
  employer: {
    companyName: string
  }
  location: {
    latitude: number
    longitude: number
    city: string
    street: string
  }
}

interface JobMapProps {
  jobs: Job[]
  center?: { lat: number; lng: number }
  selectedJobId?: string | null
  onJobSelect?: (jobId: string) => void
  userLocation?: { lat: number; lng: number } | null
}

// Custom marker icon
const createJobIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${isSelected ? "#16a34a" : "#22c55e"};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">💼</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const userIcon = L.divIcon({
  className: "user-marker",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export function JobMap({
  jobs,
  center = { lat: 52.2297, lng: 21.0122 }, // Warszawa
  selectedJobId,
  onJobSelect,
  userLocation,
}: JobMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Inicjalizacja mapy
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView(
      [center.lat, center.lng],
      13
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center.lat, center.lng])

  // Aktualizacja markerów
  useEffect(() => {
    if (!mapRef.current) return

    // Usuń stare markery
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    // Dodaj nowe markery
    jobs.forEach((job) => {
      if (!job.location) return

      const isSelected = job.id === selectedJobId
      const marker = L.marker(
        [job.location.latitude, job.location.longitude],
        { icon: createJobIcon(isSelected) }
      )

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">${job.title}</h3>
          <p style="color: #666; margin-bottom: 4px;">${job.employer.companyName}</p>
          <p style="font-size: 12px; color: #888; margin-bottom: 8px;">${job.location.street}, ${job.location.city}</p>
          <a href="/oferta/${job.id}" style="
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
          ">Zobacz ofertę</a>
        </div>
      `)

      marker.on("click", () => {
        onJobSelect?.(job.id)
      })

      marker.addTo(mapRef.current!)
      markersRef.current.set(job.id, marker)
    })

    // Dopasuj widok do markerów
    if (jobs.length > 0) {
      const bounds = L.latLngBounds(
        jobs
          .filter((j) => j.location)
          .map((j) => [j.location.latitude, j.location.longitude])
      )
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [jobs, selectedJobId, onJobSelect])

  // Marker lokalizacji użytkownika
  useEffect(() => {
    if (!mapRef.current || !userLocation) return

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
    })
      .bindPopup("Twoja lokalizacja")
      .addTo(mapRef.current)

    return () => {
      marker.remove()
    }
  }, [userLocation])

  // Centrowanie na wybranej ofercie
  useEffect(() => {
    if (!mapRef.current || !selectedJobId) return

    const marker = markersRef.current.get(selectedJobId)
    if (marker) {
      const latLng = marker.getLatLng()
      mapRef.current.setView(latLng, 15)
      marker.openPopup()
    }
  }, [selectedJobId])

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden z-0 relative"
    />
  )
}
