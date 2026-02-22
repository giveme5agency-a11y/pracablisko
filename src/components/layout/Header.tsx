"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, User, LogOut, Briefcase, Settings, Heart, Menu, X } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">PracaBlisko</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Oferty pracy
          </Link>
          <Link href="/mapa" className="text-sm font-medium hover:text-primary transition-colors">
            Mapa
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{session.user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {/* Linki nawigacyjne w dropdown na mobile */}
                <div className="md:hidden">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" />
                      Oferty pracy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mapa" className="cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" />
                      Mapa
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
                {session.user.role === "EMPLOYER" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/panel/pracodawca" className="cursor-pointer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Panel pracodawcy
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/panel/pracodawca/oferty" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Moje ogłoszenia
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/panel/profil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Mój profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/panel/profil/aplikacje" className="cursor-pointer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Moje aplikacje
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/panel/profil/zapisane" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Zapisane oferty
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Menu mobilne dla niezalogowanych */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/logowanie">Zaloguj się</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/rejestracja">Zarejestruj się</Link>
              </Button>
              {/* Przyciski mobilne */}
              <Button variant="outline" size="sm" asChild className="sm:hidden text-xs px-2">
                <Link href="/logowanie">Zaloguj</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu dla niezalogowanych */}
      {mobileMenuOpen && !session && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <Link
            href="/"
            className="block py-2 text-sm font-medium hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Oferty pracy
          </Link>
          <Link
            href="/mapa"
            className="block py-2 text-sm font-medium hover:text-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mapa
          </Link>
          <div className="pt-2 border-t flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href="/logowanie">Zaloguj się</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link href="/rejestracja">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
