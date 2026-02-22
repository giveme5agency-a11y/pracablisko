"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/components/layout/Header"
import { JobCard } from "@/components/jobs/JobCard"
import { JobMap } from "@/components/map/DynamicJobMap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Search,
  Loader2,
  List,
  Map,
  LocateFixed,
  SlidersHorizontal,
  X,
  Briefcase,
  Building2,
} from "lucide-react"
import { JOB_TYPE_LABELS } from "@/types"

interface Suggestion {
  type: "job" | "company"
  value: string
}

interface Job {
  id: string
  title: string
  description: string
  jobType: string
  workSchedule: string
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string | null
  distance: number | null
  employer: {
    companyName: string
    verified: boolean
  }
  location: {
    latitude: number
    longitude: number
    city: string
    street: string
  }
  category: {
    name: string
  } | null
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split")
  // Domyślna lokalizacja: Plac Konstytucji 5, Warszawa
  const DEFAULT_LOCATION = { lat: 52.2225, lng: 21.0158 }
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION)
  const [isLocating, setIsLocating] = useState(false)
  const [isCustomLocation, setIsCustomLocation] = useState(false)

  // Filtry
  const [searchQuery, setSearchQuery] = useState("")
  const [radius, setRadius] = useState("10")
  const [jobType, setJobType] = useState("")

  // Autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (searchQuery) params.set("q", searchQuery)
      // Zawsze używaj lokalizacji (domyślnej lub użytkownika)
      params.set("lat", userLocation.lat.toString())
      params.set("lng", userLocation.lng.toString())
      params.set("radius", radius)
      if (jobType) params.set("jobType", jobType)

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, userLocation, radius, jobType])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokalizacja nie jest wspierana przez Twoją przeglądarkę")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsCustomLocation(true)
        setIsLocating(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Nie udało się pobrać lokalizacji. Sprawdź uprawnienia.")
        setIsLocating(false)
      }
    )
  }

  const handleResetLocation = () => {
    setUserLocation(DEFAULT_LOCATION)
    setIsCustomLocation(false)
  }

  // Pobieranie sugestii
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  // Debounce dla sugestii
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchSuggestions])

  // Zamknij sugestie po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.value)
    setShowSuggestions(false)
    // Automatyczne wyszukiwanie po wybraniu sugestii
    setTimeout(() => fetchJobs(), 100)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    fetchJobs()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Search Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <form onSubmit={handleSearch} className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-3">
            {/* Pierwszy rząd - wyszukiwarka z autocomplete */}
            <div className="flex gap-2 w-full sm:w-auto sm:flex-1 sm:min-w-[200px]">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Stanowisko, firma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-9"
                  autoComplete="off"
                />
                {/* Dropdown z sugestiami */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Szukam...
                      </div>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.value}-${index}`}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.type === "job" ? (
                            <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="truncate">{suggestion.value}</span>
                          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                            {suggestion.type === "job" ? "stanowisko" : "firma"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Button type="submit" className="sm:hidden" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Drugi rząd - filtry */}
            <div className="flex flex-wrap gap-2 sm:contents">
              <Button
                type="button"
                variant={isCustomLocation ? "default" : "outline"}
                onClick={handleGetLocation}
                disabled={isLocating}
                size="sm"
                className="text-xs sm:text-sm sm:size-default"
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                ) : (
                  <LocateFixed className="h-4 w-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isCustomLocation ? "Moja lokalizacja" : "Użyj GPS"}</span>
                <span className="sm:hidden">{isCustomLocation ? "GPS" : "GPS"}</span>
              </Button>

              {isCustomLocation && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetLocation}
                  title="Wróć do domyślnej lokalizacji"
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}

              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-[90px] sm:w-[120px]">
                  <MapPin className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <SelectValue placeholder="km" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobType || "all"} onValueChange={(v) => setJobType(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[110px] sm:w-[140px]">
                  <SlidersHorizontal className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="hidden sm:inline-flex">
                <Search className="h-4 w-4 mr-2" />
                Szukaj
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* View Mode Toggle (mobile) */}
      <div className="md:hidden bg-white border-b px-4 py-2 flex gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex-1"
        >
          <List className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("map")}
          className="flex-1"
        >
          <Map className="h-4 w-4 mr-2" />
          Mapa
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex gap-4 h-[calc(100vh-280px)] sm:h-[calc(100vh-220px)]">
          {/* Job List */}
          <div
            className={`${
              viewMode === "map" ? "hidden" : "flex"
            } md:flex flex-col w-full md:w-1/2 lg:w-2/5`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isLoading ? (
                  "Wczytywanie..."
                ) : (
                  <>
                    Znaleziono <Badge variant="secondary">{jobs.length}</Badge> ofert
                  </>
                )}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Brak ofert</h3>
                    <p className="text-muted-foreground text-sm">
                      Nie znaleziono ofert w wybranym promieniu. Spróbuj zwiększyć promień wyszukiwania.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job as Job}
                    isSelected={job.id === selectedJobId}
                    onSelect={() => setSelectedJobId(job.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Map */}
          <div
            className={`${
              viewMode === "list" ? "hidden" : "flex"
            } md:flex flex-1 rounded-lg overflow-hidden border bg-white`}
          >
            <JobMap
              jobs={jobs}
              selectedJobId={selectedJobId}
              onJobSelect={setSelectedJobId}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
