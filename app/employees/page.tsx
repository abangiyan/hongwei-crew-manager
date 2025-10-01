import { createClient } from "@/lib/supabase/server"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { EmployeeList } from "@/components/employee-list"

export default async function EmployeesPage() {
  let employees: any[] = []
  let branches: any[] = []
  let teams: any[] = []
  let roles: any[] = []
  let jobTasks: any[] = []

  try {
    const supabase = await createClient()

    const { data: employeesData, error: employeesError } = await supabase
      .from("employees")
      .select(`
        *,
        branches(id, name),
        teams(id, name),
        roles(id, name)
      `)
      .order("team_id")
      .order("full_name")

    if (employeesError) {
      console.error("[v0] Error fetching employees:", employeesError)
    } else {
      employees = employeesData || []
    }

    // Fetch filter options
    const { data: branchesData } = await supabase.from("branches").select("*").order("name")
    const { data: teamsData } = await supabase.from("teams").select("*").order("name")
    const { data: rolesData } = await supabase.from("roles").select("*").order("name")
    const { data: jobTasksData } = await supabase.from("job_tasks").select("*").order("name")

    branches = branchesData || []
    teams = teamsData || []
    roles = rolesData || []
    jobTasks = jobTasksData || []
  } catch (error) {
    console.error("[v0] Error in employees page:", error)
    // Continue with empty arrays
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Daftar Karyawan</h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola semua karyawan di HongWei Kopitiam</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <EmployeeList employees={employees} branches={branches} teams={teams} roles={roles} jobTasks={jobTasks} />
      </div>
    </div>
  )
}
