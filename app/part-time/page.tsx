import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PartTimeWorkerList } from "@/components/part-time-worker-list"

export default async function PartTimePage() {
  const supabase = await createClient()

  // Fetch part-time workers
  const { data: partTimeWorkers } = await supabase
    .from("employees")
    .select(
      `
      *,
      branches(id, name),
      teams(id, name),
      roles(id, name)
    `,
    )
    .eq("employment_type", "part_time")
    .eq("status", "active")
    .order("full_name")

  // Get upcoming weekend schedules
  const today = new Date()
  const nextSaturday = new Date(today)
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7))
  const nextSunday = new Date(nextSaturday)
  nextSunday.setDate(nextSaturday.getDate() + 1)

  const { data: weekendSchedules } = await supabase
    .from("schedules")
    .select(
      `
      *,
      employees(id, full_name, employment_type),
      shifts(name, start_time, end_time),
      branches(name)
    `,
    )
    .in("schedule_date", [nextSaturday.toISOString().split("T")[0], nextSunday.toISOString().split("T")[0]])
    .order("schedule_date")

  const { data: branches } = await supabase.from("branches").select("*").order("name")

  const { data: shifts } = await supabase.from("shifts").select("*").order("start_time")

  // Get statistics
  const { count: totalPartTime } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("employment_type", "part_time")
    .eq("status", "active")

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const { count: monthSchedules } = await supabase
    .from("schedules")
    .select("*, employees!inner(employment_type)", { count: "exact", head: true })
    .eq("employees.employment_type", "part_time")
    .gte("schedule_date", startOfMonth.toISOString().split("T")[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-orange-900">Karyawan Part-Time</h1>
            <p className="text-muted-foreground mt-1">Kelola karyawan part-time untuk weekend dan hari libur</p>
          </div>
          <Link href="/employees/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Part-Time
            </Button>
          </Link>
        </div>

        <PartTimeWorkerList
          workers={partTimeWorkers || []}
          weekendSchedules={weekendSchedules || []}
          branches={branches || []}
          shifts={shifts || []}
          stats={{
            total: totalPartTime || 0,
            monthSchedules: monthSchedules || 0,
          }}
        />
      </div>
    </div>
  )
}
