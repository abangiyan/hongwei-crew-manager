import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { EmployeeForm } from "@/components/employee-form"
import { ArrowLeft } from "lucide-react"

export default async function NewEmployeePage() {
  const supabase = await createClient()

  // Fetch options for form
  const { data: branches } = await supabase.from("branches").select("*").order("name")

  const { data: teams } = await supabase.from("teams").select("*").order("name")

  const { data: roles } = await supabase.from("roles").select("*, teams(id, name)").order("name")

  const { data: jobTasks } = await supabase.from("job_tasks").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Karyawan
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tambah Karyawan Baru</h1>
          <p className="text-muted-foreground text-lg">Isi form di bawah untuk menambahkan karyawan baru ke sistem</p>
        </div>

        <EmployeeForm branches={branches || []} teams={teams || []} roles={roles || []} jobTasks={jobTasks || []} />
      </div>
    </div>
  )
}
