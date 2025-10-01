import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ScheduleForm } from "@/components/schedule-form"

export default async function NewSchedulePage() {
  const supabase = await createClient()

  const { data: employees } = await supabase
    .from("employees")
    .select("*, branches(name), teams(name), roles(name)")
    .eq("status", "active")
    .order("full_name")

  const { data: shifts } = await supabase.from("shifts").select("*").order("start_time")

  const { data: branches } = await supabase.from("branches").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/schedules" className="text-sm text-orange-600 hover:text-orange-700 mb-4 inline-block">
          ← Kembali ke Jadwal
        </Link>

        <h1 className="text-3xl font-bold text-orange-900 mb-2">Tambah Jadwal Baru</h1>
        <p className="text-muted-foreground mb-8">Atur jadwal shift untuk karyawan</p>

        <ScheduleForm employees={employees || []} shifts={shifts || []} branches={branches || []} />
      </div>
    </div>
  )
}
