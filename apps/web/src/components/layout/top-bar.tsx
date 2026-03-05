'use client'

import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/auth/logout-button"

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center gap-4 px-6 ml-64">
        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
