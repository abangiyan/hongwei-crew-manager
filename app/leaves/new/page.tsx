import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { LeaveRequestForm } from "@/components/leave-request-form"

export default async function NewLeaveRequestPage() {
  const supabase = await createClient()

  // Only full-time employees can request leave
  const { data: employees } = await supabase
    .from("employees")
    .select("*, branches(name), teams(name), roles(name)")
    .eq("status", "active")
    .eq("employment_type", "full_time")
    .order("full_name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/leaves" className="text-sm text-orange-600 hover:text-orange-700 mb-4 inline-block">
          ← Kembali ke Daftar Cuti
        </Link>

        <h1 className="text-3xl font-bold text-orange-900 mb-2">Ajukan Cuti</h1>
        <p className="text-muted-foreground mb-8">
          Ajukan permintaan cuti untuk karyawan (1x per minggu, hanya weekdays)
        </p>

        <LeaveRequestForm employees={employees || []} />
      </div>
    </div>
  )
}
