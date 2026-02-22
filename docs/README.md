# Pracablisko - Dokumentacja Projektu

## Spis treści
1. [Opis projektu](#opis-projektu)
2. [Stack technologiczny](#stack-technologiczny)
3. [Struktura projektu](#struktura-projektu)
4. [Uruchomienie lokalne](#uruchomienie-lokalne)
5. [Deployment](#deployment)
6. [Zmienne środowiskowe](#zmienne-środowiskowe)
7. [Baza danych](#baza-danych)
8. [API Endpoints](#api-endpoints)
9. [Funkcjonalności](#funkcjonalności)
10. [Status implementacji](#status-implementacji)
11. [TODO / Plany rozwoju](#todo--plany-rozwoju)
12. [Dane testowe](#dane-testowe)

---

## Opis projektu

**Pracablisko** to portal pracy skupiony na ofertach lokalnych, umożliwiający wyszukiwanie pracy w określonym promieniu od lokalizacji użytkownika. Aplikacja wyświetla oferty na interaktywnej mapie i pozwala na filtrowanie po kategorii, typie pracy, wynagrodzeniu itp.

### Główne założenia:
- Wyszukiwanie pracy w promieniu od lokalizacji (geolokalizacja)
- Prosty interfejs dla poszukujących pracy bez doświadczenia
- Panel pracodawcy do zarządzania ofertami
- System alertów o nowych ofertach w okolicy
- Mapa z wizualizacją ofert pracy

### Grupy docelowe:
- **Poszukujący pracy** - osoby szukające pracy blisko miejsca zamieszkania (gastronomia, handel, usługi)
- **Pracodawcy** - lokalne firmy (restauracje, sklepy, kawiarnie) szukające pracowników

---

## Stack technologiczny

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Next.js | 16.1.6 | Framework React (App Router) |
| React | 19.2.3 | UI Library |
| TypeScript | 5.x | Typowanie |
| Prisma | 6.19.2 | ORM |
| PostgreSQL | - | Baza danych (Neon) |
| NextAuth | 5.0.0-beta.30 | Autentykacja |
| Tailwind CSS | 4.x | Stylowanie |
| shadcn/ui | - | Komponenty UI |
| Leaflet | 1.9.4 | Mapy |
| Zod | 4.3.6 | Walidacja |
| Zustand | 5.0.11 | State management |
| Sonner | 2.0.7 | Toasty/powiadomienia |

### Hosting:
- **Aplikacja**: Vercel
- **Baza danych**: Neon (PostgreSQL serverless)

---

## Struktura projektu

```
pracablisko/
├── docs/                          # Dokumentacja
├── prisma/
│   ├── schema.prisma              # Schemat bazy danych
│   └── seed.ts                    # Dane testowe
├── public/                        # Statyczne assety
├── src/
│   ├── app/
│   │   ├── (auth)/                # Strony auth (logowanie, rejestracja)
│   │   │   ├── logowanie/
│   │   │   └── rejestracja/
│   │   ├── (public)/              # Strony publiczne
│   │   ├── api/                   # API Routes
│   │   │   ├── applications/      # Aplikacje o pracę
│   │   │   ├── auth/              # NextAuth
│   │   │   ├── categories/        # Kategorie
│   │   │   ├── employer/          # API pracodawcy
│   │   │   │   ├── applications/
│   │   │   │   ├── jobs/
│   │   │   │   ├── locations/
│   │   │   │   └── settings/
│   │   │   ├── jobs/              # Oferty pracy
│   │   │   └── jobseeker/         # API poszukującego
│   │   │       ├── alerts/
│   │   │       ├── cv/
│   │   │       ├── profile/
│   │   │       └── saved-jobs/
│   │   ├── oferta/[id]/           # Szczegóły oferty
│   │   ├── panel/
│   │   │   ├── pracodawca/        # Panel pracodawcy
│   │   │   │   ├── aplikacje/
│   │   │   │   ├── lokalizacje/
│   │   │   │   ├── oferty/
│   │   │   │   └── ustawienia/
│   │   │   └── profil/            # Panel poszukującego
│   │   │       ├── alerty/
│   │   │       ├── aplikacje/
│   │   │       ├── cv/
│   │   │       ├── ustawienia/
│   │   │       └── zapisane/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Strona główna (mapa + lista)
│   │   └── globals.css
│   ├── components/
│   │   ├── jobs/
│   │   │   └── JobCard.tsx        # Karta oferty pracy
│   │   ├── layout/
│   │   │   └── Header.tsx         # Nagłówek
│   │   ├── map/
│   │   │   ├── JobMap.tsx         # Mapa z ofertami
│   │   │   └── DynamicJobMap.tsx  # Dynamic import mapy
│   │   ├── providers/
│   │   │   └── SessionProvider.tsx
│   │   └── ui/                    # Komponenty shadcn/ui
│   ├── lib/
│   │   ├── auth.ts                # Konfiguracja NextAuth
│   │   ├── geo.ts                 # Funkcje geolokalizacji
│   │   ├── prisma.ts              # Klient Prisma
│   │   ├── utils.ts               # Utility functions
│   │   └── validations.ts         # Schematy Zod
│   └── types/
│       ├── index.ts               # Typy i etykiety
│       └── next-auth.d.ts         # Rozszerzenie typów NextAuth
├── .env                           # Zmienne środowiskowe (lokalne)
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Uruchomienie lokalne

### Wymagania:
- Node.js 18+
- npm lub yarn
- Konto Neon (baza danych) lub lokalna instancja PostgreSQL

### Kroki:

1. **Sklonuj repozytorium:**
```bash
git clone https://github.com/giveme5agency-a11y/pracablisko.git
cd pracablisko
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**
```bash
cp .env.example .env
# Edytuj .env i uzupełnij wartości
```

4. **Wygeneruj klienta Prisma:**
```bash
npx prisma generate
```

5. **Zsynchronizuj schemat z bazą:**
```bash
npx prisma db push
```

6. **Załaduj dane testowe:**
```bash
npx prisma db seed
```

7. **Uruchom serwer deweloperski:**
```bash
npm run dev
```

Aplikacja będzie dostępna pod: http://localhost:3000

---

## Deployment

### Vercel (produkcja)

**URL produkcyjny:** https://pracablisko-uddy.vercel.app

**GitHub repo:** https://github.com/giveme5agency-a11y/pracablisko

### Konfiguracja Vercel:

1. Połącz repo GitHub z Vercel
2. Framework Preset: `Next.js`
3. Build Command: `npm run build` (auto)
4. Dodaj zmienne środowiskowe (patrz sekcja poniżej)
5. Deploy

### Ważne pliki dla Vercel:
- `vercel.json` - konfiguracja frameworka
- `package.json` - skrypt `postinstall` uruchamia `prisma generate`

---

## Zmienne środowiskowe

### Lokalne (.env):
```env
# Baza danych Neon
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host-unpooled/db?sslmode=require"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
AUTH_SECRET=your-secret-key
AUTH_TRUST_HOST=true
```

### Vercel (Environment Variables):

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `DATABASE_URL` | Neon pooled connection | `postgresql://...@...-pooler.../neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Neon direct connection | `postgresql://...@.../neondb?sslmode=require` |
| `AUTH_SECRET` | Secret dla NextAuth v5 | losowy string 32+ znaków |
| `AUTH_TRUST_HOST` | Trust host dla Vercel | `true` |
| `NEXTAUTH_URL` | URL aplikacji | `https://pracablisko-uddy.vercel.app` |
| `NEXTAUTH_SECRET` | Legacy (opcjonalne) | taki sam jak AUTH_SECRET |

### Uwagi:
- `DATABASE_URL` musi mieć `-pooler` w adresie hosta
- `DATABASE_URL_UNPOOLED` NIE ma `-pooler`
- `NEXTAUTH_URL` musi zawierać `https://`

---

## Baza danych

### Provider: Neon (PostgreSQL serverless)

### Schemat (prisma/schema.prisma):

#### Modele główne:

| Model | Opis |
|-------|------|
| `User` | Użytkownik (pracodawca lub poszukujący) |
| `Employer` | Profil pracodawcy |
| `JobSeeker` | Profil poszukującego pracy |
| `Job` | Oferta pracy |
| `Location` | Lokalizacja (oddział firmy) |
| `Application` | Aplikacja o pracę |
| `Category` | Kategoria oferty |
| `Skill` | Umiejętność |
| `SavedJob` | Zapisane oferty |
| `JobAlert` | Alert o nowych ofertach |
| `AlertNotification` | Powiadomienie z alertu |

#### Enumy:

```prisma
enum UserRole { JOB_SEEKER, EMPLOYER, ADMIN }
enum JobType { FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY }
enum WorkSchedule { MORNING, AFTERNOON, EVENING, NIGHT, FLEXIBLE, SHIFTS }
enum SalaryType { HOURLY, MONTHLY, YEARLY }
enum ExperienceLevel { NO_EXPERIENCE, JUNIOR, MID, SENIOR }
enum JobStatus { DRAFT, ACTIVE, PAUSED, EXPIRED, CLOSED }
enum ApplicationStatus { PENDING, REVIEWED, SHORTLISTED, INTERVIEW, OFFERED, HIRED, REJECTED, WITHDRAWN }
```

### Diagram relacji:

```
User (1) -----> (0..1) Employer -----> (*) Location -----> (*) Job
  |                                                           |
  +-------> (0..1) JobSeeker -----> (*) Application <---------+
                    |
                    +-----> (*) SavedJob
                    +-----> (*) JobAlert -----> (*) AlertNotification
```

### Komendy Prisma:

```bash
# Generowanie klienta
npx prisma generate

# Synchronizacja schematu (bez migracji)
npx prisma db push

# Migracje (produkcja)
npx prisma migrate dev

# Seed danych testowych
npx prisma db seed

# Studio (GUI dla bazy)
npx prisma studio
```

---

## API Endpoints

### Publiczne:

| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/jobs` | Lista ofert (z filtrowaniem geo) |
| GET | `/api/jobs/suggestions` | Sugestie wyszukiwania |
| GET | `/api/categories` | Lista kategorii |

### Auth:

| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/auth/register` | Rejestracja |
| * | `/api/auth/[...nextauth]` | NextAuth handlers |

### Poszukujący pracy (JOB_SEEKER):

| Method | Endpoint | Opis |
|--------|----------|------|
| GET/PUT | `/api/jobseeker/profile` | Profil użytkownika |
| GET/POST | `/api/jobseeker/alerts` | Alerty o ofertach |
| GET/PUT/DELETE | `/api/jobseeker/alerts/[id]` | Pojedynczy alert |
| POST | `/api/jobseeker/cv` | Upload CV |
| GET/POST | `/api/jobseeker/saved-jobs` | Zapisane oferty |
| GET/DELETE | `/api/jobseeker/saved-jobs/[jobId]` | Pojedyncza zapisana |
| POST | `/api/applications` | Aplikowanie o pracę |

### Pracodawca (EMPLOYER):

| Method | Endpoint | Opis |
|--------|----------|------|
| GET/POST | `/api/employer/jobs` | Oferty pracy |
| GET/PUT/DELETE | `/api/employer/jobs/[id]` | Pojedyncza oferta |
| PUT | `/api/employer/jobs/[id]/status` | Zmiana statusu oferty |
| GET/POST | `/api/employer/locations` | Lokalizacje |
| GET/PUT/DELETE | `/api/employer/locations/[id]` | Pojedyncza lokalizacja |
| GET/PUT | `/api/employer/settings` | Ustawienia firmy |
| PUT | `/api/employer/applications/[id]` | Zmiana statusu aplikacji |

---

## Funkcjonalności

### Zaimplementowane:

#### Strona główna:
- [x] Mapa z ofertami pracy (Leaflet)
- [x] Lista ofert z kartami
- [x] Geolokalizacja użytkownika
- [x] Filtrowanie po promieniu (1-50 km)
- [x] Filtrowanie po kategorii
- [x] Filtrowanie po typie pracy
- [x] Wyszukiwanie tekstowe
- [x] Sugestie wyszukiwania (firmy, stanowiska)
- [x] Responsywny widok (mapa/lista toggle na mobile)

#### Autoryzacja:
- [x] Rejestracja (pracodawca / poszukujący)
- [x] Logowanie (credentials)
- [x] Sesja JWT
- [x] Ochrona tras

#### Panel poszukującego pracy:
- [x] Profil użytkownika (edycja danych)
- [x] Upload CV
- [x] Lista aplikacji
- [x] Zapisane oferty
- [x] Alerty o nowych ofertach (CRUD)
- [x] Mapa w formularzu alertu

#### Panel pracodawcy:
- [x] Dashboard
- [x] Zarządzanie lokalizacjami (CRUD)
- [x] Zarządzanie ofertami (CRUD)
- [x] Zmiana statusu ofert
- [x] Przeglądanie aplikacji
- [x] Zmiana statusu aplikacji
- [x] Ustawienia firmy

#### Szczegóły oferty:
- [x] Pełne informacje o ofercie
- [x] Przycisk aplikowania
- [x] Przycisk zapisywania
- [x] Mapa lokalizacji

---

## Status implementacji

### Wersja: MVP 1.0

### Co działa:
- Pełny flow rejestracji i logowania
- Przeglądanie i wyszukiwanie ofert na mapie
- Aplikowanie o pracę
- Panel pracodawcy (pełny CRUD)
- Panel poszukującego (pełny CRUD)
- System alertów (bez wysyłania powiadomień)
- Deployment na Vercel + Neon

### Znane ograniczenia:
- Alerty nie wysyłają jeszcze emaili/push
- Brak uploadu zdjęć/logo
- Brak weryfikacji email
- Brak resetowania hasła
- Brak OAuth (Google, Facebook)

---

## TODO / Plany rozwoju

### Priorytet wysoki:
- [ ] System wysyłania alertów (cron job / Vercel cron)
- [ ] Reset hasła
- [ ] Weryfikacja email
- [ ] Upload logo firmy
- [ ] Upload zdjęcia profilowego

### Priorytet średni:
- [ ] OAuth (Google, Facebook)
- [ ] Powiadomienia push (PWA)
- [ ] Wyszukiwanie zaawansowane (wiele filtrów)
- [ ] Historia przeglądanych ofert
- [ ] Statystyki dla pracodawcy (wyświetlenia, aplikacje)

### Priorytet niski:
- [ ] Chat pracodawca-kandydat
- [ ] Rekomendacje ofert (ML)
- [ ] Wersja mobilna (React Native)
- [ ] Panel admina
- [ ] Płatne promowanie ofert

### Pomysły na przyszłość:
- Integracja z LinkedIn
- Import CV z PDF (OCR)
- Wideo-prezentacje kandydatów
- System ocen pracodawców

---

## Dane testowe

### Konta demo:

| Rola | Email | Hasło |
|------|-------|-------|
| Pracodawca | `restauracja@test.pl` | `Test123!` |
| Pracodawca | `sklep@test.pl` | `Test123!` |
| Pracodawca | `kawiarnia@test.pl` | `Test123!` |
| Poszukujący | `szukam@test.pl` | `Test123!` |

### Dane w bazie po seedzie:
- 3 pracodawców
- 5 lokalizacji (Warszawa)
- 5 ofert pracy
- 8 kategorii
- 10 umiejętności
- 1 poszukujący pracy
- 1 przykładowa aplikacja

### Resetowanie danych:
```bash
npx prisma db seed
```

**Uwaga:** Seed czyści całą bazę przed dodaniem nowych danych!

---

## Kontakt / Autorzy

- **Projekt:** Pracablisko
- **Repozytorium:** https://github.com/giveme5agency-a11y/pracablisko
- **Produkcja:** https://pracablisko-uddy.vercel.app

---

*Dokumentacja wygenerowana: 2026-02-22*
