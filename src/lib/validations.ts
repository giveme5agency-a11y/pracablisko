import { z } from "zod"

// =====================
// Autentykacja
// =====================

export const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
  confirmPassword: z.string(),
  role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
})

// =====================
// Profil pracodawcy
// =====================

export const employerProfileSchema = z.object({
  companyName: z.string().min(2, "Nazwa firmy jest wymagana"),
  nip: z
    .string()
    .regex(/^\d{10}$/, "NIP musi składać się z 10 cyfr")
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000, "Opis może mieć maksymalnie 2000 znaków").optional(),
  website: z.string().url("Nieprawidłowy adres URL").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^(\+48)?[0-9]{9}$/, "Nieprawidłowy numer telefonu")
    .optional()
    .or(z.literal("")),
})

// =====================
// Profil szukającego pracy
// =====================

export const jobSeekerProfileSchema = z.object({
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  phone: z
    .string()
    .regex(/^(\+48)?[0-9]{9}$/, "Nieprawidłowy numer telefonu")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(1000, "Bio może mieć maksymalnie 1000 znaków").optional(),
  preferredRadius: z.number().min(1).max(50).default(5),
})

// =====================
// Lokalizacja
// =====================

export const locationSchema = z.object({
  name: z.string().min(2, "Nazwa lokalizacji jest wymagana"),
  street: z.string().min(3, "Ulica jest wymagana"),
  city: z.string().min(2, "Miasto jest wymagane"),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Nieprawidłowy kod pocztowy (format: XX-XXX)"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isMain: z.boolean().default(false),
})

// =====================
// Ogłoszenie o pracę
// =====================

export const jobSchema = z.object({
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków").max(100),
  description: z.string().min(50, "Opis musi mieć co najmniej 50 znaków").max(5000),
  requirements: z.string().max(2000).optional(),
  responsibilities: z.string().max(2000).optional(),
  benefits: z.string().max(2000).optional(),
  locationId: z.string().min(1, "Wybierz lokalizację"),
  categoryId: z.string().optional(),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]),
  workSchedule: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT", "FLEXIBLE", "SHIFTS"]),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  salaryType: z.enum(["HOURLY", "MONTHLY", "YEARLY"]).optional(),
  experienceLevel: z.enum(["NO_EXPERIENCE", "JUNIOR", "MID", "SENIOR"]).default("NO_EXPERIENCE"),
  skills: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin
    }
    return true
  },
  {
    message: "Maksymalna stawka nie może być niższa od minimalnej",
    path: ["salaryMax"],
  }
)

// =====================
// Aplikacja
// =====================

export const applicationSchema = z.object({
  coverLetter: z.string().max(3000, "List motywacyjny może mieć maksymalnie 3000 znaków").optional(),
})

// =====================
// Filtry wyszukiwania
// =====================

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).max(50).default(5),
  jobType: z.array(z.string()).optional(),
  workSchedule: z.array(z.string()).optional(),
  experienceLevel: z.array(z.string()).optional(),
  salaryMin: z.number().optional(),
  categoryId: z.string().optional(),
})

// =====================
// Typy TypeScript
// =====================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type EmployerProfileInput = z.infer<typeof employerProfileSchema>
export type JobSeekerProfileInput = z.infer<typeof jobSeekerProfileSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type JobInput = z.infer<typeof jobSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>
