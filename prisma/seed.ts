import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Rozpoczynam seedowanie bazy danych...")

  // Czyszczenie bazy
  await prisma.savedJob.deleteMany()
  await prisma.application.deleteMany()
  await prisma.jobSkill.deleteMany()
  await prisma.jobSeekerSkill.deleteMany()
  await prisma.job.deleteMany()
  await prisma.location.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.category.deleteMany()
  await prisma.employer.deleteMany()
  await prisma.jobSeeker.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log("✅ Wyczyszczono bazę danych")

  // Tworzenie umiejętności
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: "Obsługa klienta" } }),
    prisma.skill.create({ data: { name: "Kasa fiskalna" } }),
    prisma.skill.create({ data: { name: "Język angielski" } }),
    prisma.skill.create({ data: { name: "Prawo jazdy kat. B" } }),
    prisma.skill.create({ data: { name: "Obsługa komputera" } }),
    prisma.skill.create({ data: { name: "Praca w zespole" } }),
    prisma.skill.create({ data: { name: "Gotowanie" } }),
    prisma.skill.create({ data: { name: "Serwis kelnerski" } }),
    prisma.skill.create({ data: { name: "Barista" } }),
    prisma.skill.create({ data: { name: "Sprzątanie" } }),
  ])

  console.log(`✅ Utworzono ${skills.length} umiejętności`)

  // Tworzenie kategorii
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Gastronomia", slug: "gastronomia", icon: "utensils" } }),
    prisma.category.create({ data: { name: "Handel", slug: "handel", icon: "shopping-cart" } }),
    prisma.category.create({ data: { name: "Usługi", slug: "uslugi", icon: "wrench" } }),
    prisma.category.create({ data: { name: "Biuro", slug: "biuro", icon: "briefcase" } }),
    prisma.category.create({ data: { name: "Transport", slug: "transport", icon: "truck" } }),
    prisma.category.create({ data: { name: "Produkcja", slug: "produkcja", icon: "factory" } }),
    prisma.category.create({ data: { name: "Magazyn", slug: "magazyn", icon: "box" } }),
    prisma.category.create({ data: { name: "Sprzątanie", slug: "sprzatanie", icon: "spray-can" } }),
  ])

  console.log(`✅ Utworzono ${categories.length} kategorii`)

  const passwordHash = await hash("Test123!", 12)

  // Tworzenie pracodawców
  const employer1User = await prisma.user.create({
    data: {
      email: "restauracja@test.pl",
      passwordHash,
      name: "Restauracja Polska",
      role: "EMPLOYER",
      emailVerified: new Date(),
    },
  })

  const employer1 = await prisma.employer.create({
    data: {
      userId: employer1User.id,
      companyName: "Restauracja Polska Sp. z o.o.",
      nip: "1234567890",
      description: "Tradycyjna restauracja polska z domową kuchnią. Działamy od 2010 roku.",
      phone: "221234567",
      verified: true,
    },
  })

  const employer2User = await prisma.user.create({
    data: {
      email: "sklep@test.pl",
      passwordHash,
      name: "Sklep Osiedlowy",
      role: "EMPLOYER",
      emailVerified: new Date(),
    },
  })

  const employer2 = await prisma.employer.create({
    data: {
      userId: employer2User.id,
      companyName: "Sklep Osiedlowy Kowalski",
      description: "Lokalny sklep spożywczy z produktami najwyższej jakości.",
      phone: "222345678",
      verified: true,
    },
  })

  const employer3User = await prisma.user.create({
    data: {
      email: "kawiarnia@test.pl",
      passwordHash,
      name: "Kawiarnia Aromat",
      role: "EMPLOYER",
      emailVerified: new Date(),
    },
  })

  const employer3 = await prisma.employer.create({
    data: {
      userId: employer3User.id,
      companyName: "Kawiarnia Aromat",
      description: "Przytulna kawiarnia z najlepszą kawą w okolicy.",
      phone: "223456789",
      verified: true,
    },
  })

  console.log("✅ Utworzono 3 pracodawców")

  // Tworzenie lokalizacji
  const location1 = await prisma.location.create({
    data: {
      employerId: employer1.id,
      name: "Restauracja Mokotów",
      street: "ul. Puławska 100",
      city: "Warszawa",
      postalCode: "02-595",
      latitude: 52.1935,
      longitude: 21.0369,
      isMain: true,
    },
  })

  const location2 = await prisma.location.create({
    data: {
      employerId: employer2.id,
      name: "Sklep Śródmieście",
      street: "ul. Marszałkowska 50",
      city: "Warszawa",
      postalCode: "00-950",
      latitude: 52.2297,
      longitude: 21.0122,
      isMain: true,
    },
  })

  const location3 = await prisma.location.create({
    data: {
      employerId: employer3.id,
      name: "Kawiarnia Żoliborz",
      street: "ul. Słowackiego 20",
      city: "Warszawa",
      postalCode: "01-592",
      latitude: 52.2692,
      longitude: 20.9874,
      isMain: true,
    },
  })

  const location4 = await prisma.location.create({
    data: {
      employerId: employer1.id,
      name: "Restauracja Praga",
      street: "ul. Targowa 30",
      city: "Warszawa",
      postalCode: "03-733",
      latitude: 52.2571,
      longitude: 21.0374,
      isMain: false,
    },
  })

  const location5 = await prisma.location.create({
    data: {
      employerId: employer2.id,
      name: "Sklep Wola",
      street: "ul. Wolska 80",
      city: "Warszawa",
      postalCode: "01-258",
      latitude: 52.2352,
      longitude: 20.9795,
      isMain: false,
    },
  })

  console.log("✅ Utworzono 5 lokalizacji")

  // Tworzenie ogłoszeń o pracę
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: employer1.id,
        locationId: location1.id,
        categoryId: categories[0].id, // Gastronomia
        title: "Kelner/Kelnerka",
        description: `Poszukujemy energicznej osoby na stanowisko kelnera/kelnerki w naszej restauracji na Mokotowie.

Oferujemy:
- Atrakcyjne wynagrodzenie + napiwki
- Elastyczny grafik
- Przyjazną atmosferę pracy
- Możliwość rozwoju

Jeśli lubisz kontakt z ludźmi i szukasz stabilnej pracy - aplikuj!`,
        requirements: "Mile widziane doświadczenie w gastronomii. Komunikatywność, schludny wygląd.",
        responsibilities: "Obsługa gości, przyjmowanie zamówień, serwowanie potraw i napojów.",
        benefits: "Posiłki pracownicze, elastyczny grafik, premie za wyniki.",
        jobType: "PART_TIME",
        workSchedule: "FLEXIBLE",
        salaryMin: 25,
        salaryMax: 35,
        salaryType: "HOURLY",
        experienceLevel: "NO_EXPERIENCE",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        employerId: employer1.id,
        locationId: location4.id,
        categoryId: categories[0].id,
        title: "Pomoc kuchenna",
        description: `Szukamy osoby do pomocy w kuchni w naszej restauracji na Pradze.

Obowiązki:
- Przygotowywanie składników
- Utrzymanie czystości w kuchni
- Pomoc kucharzowi

Oferujemy szkolenie od podstaw!`,
        requirements: "Książeczka sanepidowska (pomożemy w uzyskaniu).",
        jobType: "FULL_TIME",
        workSchedule: "SHIFTS",
        salaryMin: 4300,
        salaryMax: 5000,
        salaryType: "MONTHLY",
        experienceLevel: "NO_EXPERIENCE",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        employerId: employer2.id,
        locationId: location2.id,
        categoryId: categories[1].id, // Handel
        title: "Sprzedawca/Kasjer",
        description: `Poszukujemy osoby na stanowisko sprzedawcy w sklepie spożywczym w centrum miasta.

Zadania:
- Obsługa klientów
- Obsługa kasy fiskalnej
- Wykładanie towaru
- Dbanie o porządek na sali sprzedaży`,
        requirements: "Uczciwość, komunikatywność. Mile widziane doświadczenie w handlu.",
        benefits: "Rabaty pracownicze, stabilne zatrudnienie.",
        jobType: "FULL_TIME",
        workSchedule: "MORNING",
        salaryMin: 4500,
        salaryMax: 5200,
        salaryType: "MONTHLY",
        experienceLevel: "NO_EXPERIENCE",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        employerId: employer2.id,
        locationId: location5.id,
        categoryId: categories[1].id,
        title: "Pracownik sklepu - weekendy",
        description: `Szukamy osoby do pracy w weekendy w naszym sklepie na Woli.

Idealna praca dla studentów!

Godziny: 8:00-20:00 (sobota, niedziela)`,
        requirements: "Dyspozycyjność w weekendy.",
        jobType: "PART_TIME",
        workSchedule: "FLEXIBLE",
        salaryMin: 28,
        salaryMax: 32,
        salaryType: "HOURLY",
        experienceLevel: "NO_EXPERIENCE",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        employerId: employer3.id,
        locationId: location3.id,
        categoryId: categories[0].id,
        title: "Barista",
        description: `Dołącz do naszego zespołu i naucz się sztuki parzenia kawy!

Oferujemy:
- Szkolenie baristyczne
- Przyjazny zespół
- Zniżki na kawę
- Elastyczny grafik

Nie wymagamy doświadczenia - nauczymy Cię wszystkiego!`,
        responsibilities: "Przygotowywanie kaw, obsługa klientów, dbanie o czystość.",
        benefits: "Bezpłatna kawa, szkolenia, elastyczny grafik.",
        jobType: "PART_TIME",
        workSchedule: "FLEXIBLE",
        salaryMin: 26,
        salaryMax: 33,
        salaryType: "HOURLY",
        experienceLevel: "NO_EXPERIENCE",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`✅ Utworzono ${jobs.length} ogłoszeń o pracę`)

  // Dodawanie umiejętności do ogłoszeń
  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobs[0].id, skillId: skills[0].id, required: true }, // Kelner - Obsługa klienta
      { jobId: jobs[0].id, skillId: skills[7].id, required: false }, // Kelner - Serwis kelnerski
      { jobId: jobs[2].id, skillId: skills[0].id, required: true }, // Sprzedawca - Obsługa klienta
      { jobId: jobs[2].id, skillId: skills[1].id, required: true }, // Sprzedawca - Kasa fiskalna
      { jobId: jobs[4].id, skillId: skills[0].id, required: true }, // Barista - Obsługa klienta
      { jobId: jobs[4].id, skillId: skills[8].id, required: false }, // Barista - Barista
    ],
  })

  console.log("✅ Dodano umiejętności do ogłoszeń")

  // Tworzenie szukającego pracy
  const jobSeekerUser = await prisma.user.create({
    data: {
      email: "szukam@test.pl",
      passwordHash,
      name: "Jan Kowalski",
      role: "JOB_SEEKER",
      emailVerified: new Date(),
    },
  })

  const jobSeeker = await prisma.jobSeeker.create({
    data: {
      userId: jobSeekerUser.id,
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "501234567",
      bio: "Szukam pracy w gastronomii lub handlu. Jestem komunikatywny i lubie pracę z ludźmi.",
      preferredRadius: 5,
      latitude: 52.22,
      longitude: 21.02,
    },
  })

  // Dodawanie umiejętności szukającemu pracy
  await prisma.jobSeekerSkill.createMany({
    data: [
      { jobSeekerId: jobSeeker.id, skillId: skills[0].id },
      { jobSeekerId: jobSeeker.id, skillId: skills[5].id },
      { jobSeekerId: jobSeeker.id, skillId: skills[2].id },
    ],
  })

  console.log("✅ Utworzono szukającego pracy")

  // Tworzenie przykładowej aplikacji
  await prisma.application.create({
    data: {
      jobId: jobs[0].id,
      jobSeekerId: jobSeeker.id,
      coverLetter: "Chciałbym dołączyć do Państwa zespołu. Mam doświadczenie w obsłudze klienta.",
      status: "PENDING",
    },
  })

  console.log("✅ Utworzono przykładową aplikację")

  // Zapisywanie ogłoszenia
  await prisma.savedJob.create({
    data: {
      jobSeekerId: jobSeeker.id,
      jobId: jobs[4].id,
    },
  })

  console.log("✅ Zapisano przykładowe ogłoszenie")

  console.log("\n🎉 Seedowanie zakończone pomyślnie!")
  console.log("\n📧 Dane logowania testowe:")
  console.log("   Pracodawca: restauracja@test.pl / Test123!")
  console.log("   Pracodawca: sklep@test.pl / Test123!")
  console.log("   Pracodawca: kawiarnia@test.pl / Test123!")
  console.log("   Szukający pracy: szukam@test.pl / Test123!")
}

main()
  .catch((e) => {
    console.error("❌ Błąd podczas seedowania:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
