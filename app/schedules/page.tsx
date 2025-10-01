import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { CreateScheduleModal } from "@/components/create-schedule-modal"

export default async function SchedulesPage() {
  const supabase = await createClient()

  // Fetch schedules for the current week
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const { data: schedules } = await supabase
    .from("schedules")
    .select(
      `
      *,
      employees(id, full_name, employment_type, roles(name)),
      shifts(id, name, start_time, end_time),
      branches(id, name)
    `,
    )
    .gte("schedule_date", startOfWeek.toISOString().split("T")[0])
    .lte("schedule_date", endOfWeek.toISOString().split("T")[0])
    .order("schedule_date")

  const { data: employees } = await supabase
    .from("employees")
    .select("*, branches(name), roles(name), teams(name)")
    .eq("status", "active")
    .order("full_name")

  const { data: shifts } = await supabase.from("shifts").select("*").order("start_time")

  const { data: branches } = await supabase.from("branches").select("*").order("name")

  const { data: jobTasks } = await supabase.from("job_tasks").select("*").order("name")

  const { data: teams } = await supabase.from("teams").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Jadwal Shift</h1>
            <p className="text-muted-foreground mt-2 text-lg">Kelola jadwal shift karyawan</p>
          </div>
          <CreateScheduleModal
            employees={employees || []}
            shifts={shifts || []}
            branches={branches || []}
            jobTasks={jobTasks || []}
            teams={teams || []}
          />
        </div>

        <ScheduleCalendar
          schedules={schedules || []}
          employees={employees || []}
          shifts={shifts || []}
          branches={branches || []}
        />
      </div>
    </div>
  )
}
