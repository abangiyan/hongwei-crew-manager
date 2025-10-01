"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, ChefHat, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setUserEmail(null)
        } else {
          setUserEmail(user?.email || null)
        }
      } catch (error) {
        setUserEmail(null)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (!isLoading && !userEmail) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary flex items-center justify-center shadow-md shrink-0">
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">HongWei Kopitiam</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Crew Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hover:bg-accent bg-transparent">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{userEmail}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin Account</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
