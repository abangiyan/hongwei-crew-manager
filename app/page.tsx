"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Users, Calendar, Building2, ClipboardList, UserPlus, ChefHat } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    employeeCount: 0,
    partTimeCount: 0,
    branchCount: 0,
    todayScheduleCount: 0,
    pendingLeaveCount: 0,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (user) {
        fetchStats()
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setIsAuthenticated(false)
    }
  }

  const fetchStats = async () => {
    try {
      const supabase = createClient()

      const { count: empCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      const { count: ptCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .eq("employment_type", "part_time")

      const { count: brCount } = await supabase.from("branches").select("*", { count: "exact", head: true })

      const today = new Date().toISOString().split("T")[0]
      const { count: schedCount } = await supabase
        .from("schedules")
        .select("*", { count: "exact", head: true })
        .eq("schedule_date", today)

      const { count: leaveCount } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      setStats({
        employeeCount: empCount || 0,
        partTimeCount: ptCount || 0,
        branchCount: brCount || 0,
        todayScheduleCount: schedCount || 0,
        pendingLeaveCount: leaveCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.user) {
        setIsAuthenticated(true)
        router.refresh()
      } else {
        throw new Error("Login gagal: Tidak ada data user")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat login"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Login form (no header)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-sm">
          <Card className="border">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <ChefHat className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-bold text-foreground">HongWei Kopitiam</CardTitle>
              <CardDescription className="text-center">Login untuk mengakses sistem manajemen karyawan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@hongwei.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard (with header from layout)
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">HongWei Kopitiam</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Sistem Manajemen Karyawan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.employeeCount}</p>
                <p className="text-xs text-muted-foreground">Karyawan</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.branchCount}</p>
                <p className="text-xs text-muted-foreground">Cabang</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.todayScheduleCount}</p>
                <p className="text-xs text-muted-foreground">Jadwal Hari Ini</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.pendingLeaveCount}</p>
                <p className="text-xs text-muted-foreground">Cuti Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.partTimeCount}</p>
                <p className="text-xs text-muted-foreground">Part-Time</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Menu Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/employees" className="group">
              <div className="bg-card rounded-lg border p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Kelola Karyawan
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tambah, edit, dan kelola data karyawan</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/schedules" className="group">
              <div className="bg-card rounded-lg border p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Jadwal Shift
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Atur jadwal shift karyawan</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/leaves" className="group">
              <div className="bg-card rounded-lg border p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Cuti Karyawan
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kelola permintaan cuti karyawan</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/branches" className="group">
              <div className="bg-card rounded-lg border p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Cabang & Tim
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kelola cabang dan tim kerja</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/part-time" className="group">
              <div className="bg-card rounded-lg border p-5 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Karyawan Part-Time
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kelola karyawan part-time untuk weekend</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
