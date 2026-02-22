/**
 * Oblicza odległość między dwoma punktami używając formuły Haversine
 * @param lat1 Szerokość geograficzna punktu 1
 * @param lon1 Długość geograficzna punktu 1
 * @param lat2 Szerokość geograficzna punktu 2
 * @param lon2 Długość geograficzna punktu 2
 * @returns Odległość w kilometrach
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Promień Ziemi w km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Zaokrąglenie do 1 miejsca po przecinku
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Oblicza bounding box dla danego punktu i promienia
 * Używane do wstępnego filtrowania w bazie danych
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusKm / 111.32 // 1 stopień szerokości ≈ 111.32 km
  const lonDelta = radiusKm / (111.32 * Math.cos(toRad(lat)))

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  }
}

/**
 * Współrzędne centrum Warszawy
 */
export const WARSAW_CENTER = {
  lat: 52.2297,
  lon: 21.0122,
}

/**
 * Predefiniowane dzielnice Warszawy z ich współrzędnymi
 */
export const WARSAW_DISTRICTS = {
  mokotow: { lat: 52.1935, lon: 21.0369, name: "Mokotów" },
  srodmiescie: { lat: 52.2297, lon: 21.0122, name: "Śródmieście" },
  praga_polnoc: { lat: 52.2571, lon: 21.0374, name: "Praga Północ" },
  praga_poludnie: { lat: 52.2365, lon: 21.0756, name: "Praga Południe" },
  wola: { lat: 52.2352, lon: 20.9795, name: "Wola" },
  zoliborz: { lat: 52.2692, lon: 20.9874, name: "Żoliborz" },
  bielany: { lat: 52.2899, lon: 20.9355, name: "Bielany" },
  targowek: { lat: 52.2911, lon: 21.0447, name: "Targówek" },
  ochota: { lat: 52.2156, lon: 20.9833, name: "Ochota" },
  ursynow: { lat: 52.1491, lon: 21.0399, name: "Ursynów" },
} as const
