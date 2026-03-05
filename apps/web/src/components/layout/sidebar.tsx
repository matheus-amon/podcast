'use client'

import { Home, Calendar, Mic, Users, Wallet, Settings, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Episodes",
    href: "/episodes",
    icon: Mic,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    title: "Budget",
    href: "/budget",
    icon: Wallet,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: TrendingUp,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">Podcast SaaS</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
