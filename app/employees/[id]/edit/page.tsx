import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { EmployeeForm } from "@/components/employee-form"
import { notFound } from "next/navigation"

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch employee
  const { data: employee } = await supabase.from("employees").select("*").eq("id", id).single()

  if (!employee) {
    notFound()
  }

  // Fetch employee job tasks
  const { data: employeeJobTasks } = await supabase
    .from("employee_job_tasks")
    .select("job_task_id")
    .eq("employee_id", id)

  // Fetch options for form
  const { data: branches } = await supabase.from("branches").select("*").order("name")

  const { data: teams } = await supabase.from("teams").select("*").order("name")

  const { data: roles } = await supabase.from("roles").select("*, teams(id, name)").order("name")

  const { data: jobTasks } = await supabase.from("job_tasks").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/employees" className="text-sm text-orange-600 hover:text-orange-700 mb-4 inline-block">
          ← Kembali ke Daftar Karyawan
        </Link>

        <h1 className="text-3xl font-bold text-orange-900 mb-2">Edit Karyawan</h1>
        <p className="text-muted-foreground mb-8">Update informasi karyawan</p>

        <EmployeeForm
          branches={branches || []}
          teams={teams || []}
          roles={roles || []}
          jobTasks={jobTasks || []}
          employee={employee}
          existingJobTasks={employeeJobTasks?.map((ejt) => ejt.job_task_id) || []}
        />
      </div>
    </div>
  )
}
