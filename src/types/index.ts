import type {
  User,
  Employer,
  JobSeeker,
  Job,
  Location,
  Application,
  Skill,
  Category,
  UserRole,
  JobType,
  WorkSchedule,
  SalaryType,
  ExperienceLevel,
  JobStatus,
  ApplicationStatus,
} from "@prisma/client"

// Re-export typów z Prisma
export type {
  User,
  Employer,
  JobSeeker,
  Job,
  Location,
  Application,
  Skill,
  Category,
  UserRole,
  JobType,
  WorkSchedule,
  SalaryType,
  ExperienceLevel,
  JobStatus,
  ApplicationStatus,
}

// =====================
// Rozszerzone typy
// =====================

export interface JobWithRelations extends Job {
  employer: Employer & {
    user: Pick<User, "name" | "email">
  }
  location: Location
  category: Category | null
  skills: Array<{
    skill: Skill
    required: boolean
  }>
  _count?: {
    applications: number
  }
}

export interface JobWithDistance extends JobWithRelations {
  distance: number // w km
}

export interface EmployerWithRelations extends Employer {
  user: User
  locations: Location[]
  jobs: Job[]
  _count?: {
    jobs: number
    locations: number
  }
}

export interface JobSeekerWithRelations extends JobSeeker {
  user: User
  skills: Array<{
    skill: Skill
  }>
  applications: ApplicationWithJob[]
  savedJobs: Array<{
    job: JobWithRelations
  }>
}

export interface ApplicationWithJob extends Application {
  job: JobWithRelations
}

export interface ApplicationWithJobSeeker extends Application {
  jobSeeker: JobSeeker & {
    user: Pick<User, "name" | "email">
    skills: Array<{
      skill: Skill
    }>
  }
}

// =====================
// Typy dla filtrów
// =====================

export interface FilterState {
  query: string
  latitude: number | null
  longitude: number | null
  radius: number
  jobTypes: JobType[]
  workSchedules: WorkSchedule[]
  experienceLevels: ExperienceLevel[]
  salaryMin: number | null
  categoryId: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

// =====================
// Typy dla mapy
// =====================

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  type: "job" | "user" | "employer"
  data?: JobWithDistance
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// =====================
// Typy dla API
// =====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

// =====================
// Rozszerzenie typów NextAuth
// =====================
// Typy są rozszerzane w src/lib/auth.ts lub w osobnym pliku next-auth.d.ts

// =====================
// Etykiety polskie
// =====================

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Pełny etat",
  PART_TIME: "Część etatu",
  CONTRACT: "Umowa zlecenie",
  INTERNSHIP: "Staż",
  TEMPORARY: "Praca tymczasowa",
}

export const WORK_SCHEDULE_LABELS: Record<WorkSchedule, string> = {
  MORNING: "Ranne (6:00-14:00)",
  AFTERNOON: "Popołudniowe (14:00-22:00)",
  EVENING: "Wieczorne (18:00-24:00)",
  NIGHT: "Nocne (22:00-6:00)",
  FLEXIBLE: "Elastyczne",
  SHIFTS: "Zmianowe",
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  NO_EXPERIENCE: "Bez doświadczenia",
  JUNIOR: "Junior (do 2 lat)",
  MID: "Mid (2-5 lat)",
  SENIOR: "Senior (5+ lat)",
}

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  HOURLY: "za godzinę",
  MONTHLY: "miesięcznie",
  YEARLY: "rocznie",
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Szkic",
  ACTIVE: "Aktywne",
  PAUSED: "Wstrzymane",
  EXPIRED: "Wygasłe",
  CLOSED: "Zamknięte",
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Oczekująca",
  REVIEWED: "Przejrzana",
  SHORTLISTED: "Na liście",
  INTERVIEW: "Rozmowa",
  OFFERED: "Oferta",
  HIRED: "Zatrudniony",
  REJECTED: "Odrzucona",
  WITHDRAWN: "Wycofana",
}
