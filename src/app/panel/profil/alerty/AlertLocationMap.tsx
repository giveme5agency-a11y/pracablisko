"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface AlertLocationMapProps {
  center: { lat: number; lng: number }
  radius: number
  onLocationSelect: (lat: number, lng: number) => void
}

export function AlertLocationMap({
  center,
  radius,
  onLocationSelect,
}: AlertLocationMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
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

    // Dodaj marker i okrąg
    const icon = L.divIcon({
      className: "alert-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    markerRef.current = L.marker([center.lat, center.lng], { icon })
      .addTo(mapRef.current)

    circleRef.current = L.circle([center.lat, center.lng], {
      radius: radius * 1000,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(mapRef.current)

    // Obsługa kliknięcia
    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Aktualizacja pozycji markera i okręgu
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !circleRef.current) return

    markerRef.current.setLatLng([center.lat, center.lng])
    circleRef.current.setLatLng([center.lat, center.lng])
    circleRef.current.setRadius(radius * 1000)
    mapRef.current.setView([center.lat, center.lng])
  }, [center.lat, center.lng, radius])

  return (
    <div
      ref={containerRef}
      className="w-full h-[300px] rounded-lg overflow-hidden z-0 relative border"
    />
  )
}
