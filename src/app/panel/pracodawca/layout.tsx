import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import {
  LayoutDashboard,
  Briefcase,
  MapPin,
  Users,
  Settings
} from "lucide-react"

const sidebarLinks = [
  { href: "/panel/pracodawca", label: "Dashboard", icon: LayoutDashboard },
  { href: "/panel/pracodawca/oferty", label: "Moje oferty", icon: Briefcase },
  { href: "/panel/pracodawca/aplikacje", label: "Aplikacje", icon: Users },
  { href: "/panel/pracodawca/lokalizacje", label: "Lokalizacje", icon: MapPin },
  { href: "/panel/pracodawca/ustawienia", label: "Ustawienia", icon: Settings },
]

export default async function EmployerPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/logowanie")
  }

  if (session.user.role !== "EMPLOYER") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b overflow-x-auto">
        <nav className="flex px-2 py-2 gap-1 min-w-max">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors whitespace-nowrap text-xs font-medium"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-white border-r min-h-[calc(100vh-65px)]">
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
