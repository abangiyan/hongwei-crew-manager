import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LeaveRequestList } from "@/components/leave-request-list"

export default async function LeavesPage() {
  const supabase = await createClient()

  // Fetch leave requests with employee data
  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select(
      `
      *,
      employees(id, full_name, branches(name), teams(name), roles(name))
    `,
    )
    .order("leave_date", { ascending: false })

  const { data: employees } = await supabase
    .from("employees")
    .select("*, branches(name), teams(name)")
    .eq("status", "active")
    .eq("employment_type", "full_time")
    .order("full_name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-orange-900">Cuti Karyawan</h1>
            <p className="text-muted-foreground mt-1">
              Kelola permintaan cuti karyawan (1x per minggu, hanya weekdays)
            </p>
          </div>
          <Link href="/leaves/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajukan Cuti
            </Button>
          </Link>
        </div>

        <LeaveRequestList leaveRequests={leaveRequests || []} employees={employees || []} />
      </div>
    </div>
  )
}
